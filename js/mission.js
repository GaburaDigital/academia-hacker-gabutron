/* Motor de missoes.
   Missao e dado, nao codigo: tudo vem dos JSON em ATIVIDADES/.
   Este modulo sorteia a missao, monta o cenario, escuta o barramento
   e marca cada passo concluido. */

import { bus } from './bus.js';
import * as vfs from './vfs.js';
import { montarP95, atualizarIconeLixeira } from './p95.js';
import { carregarEmails } from './apps/email.js';
import { sistema } from './apps/config95.js';
import { iniciarInterrupcoes, pararInterrupcoes } from './apps/interrupcoes.js';
import { PACOTES } from './apps/utilitarios.js';
import { dizer, humor, completarFala } from './gabutron.js';
import { tocar } from './sound.js';
import { ajustes } from './settings.js';
import { habilidadesDaMissao, alvosDoPasso, conceitoDe, receitaDe } from './didatica.js';
import { sessao, somarPontos, calcularPontos, pintarPontos, proximaPatente, patenteDe } from './score.js';

const BASE = new URL('../ATIVIDADES/', import.meta.url);

export const estado = {
  catalogo: null,
  missoes: [],
  cenarios: {},
  atual: null,
  passoAtual: 0,
  feitos: [],
  usadas: new Set(),
  inicioMissao: 0,
  vistos: new Set(),
  falhou: false,
  pulosRestantes: 2,
  nivelDica: 0,
  emTreino: false,
  timer: null,
  restante: 0
};

/* ---------- carregamento ---------- */

export async function carregarCatalogo() {
  const resp = await fetch(new URL('catalogo.json', BASE));
  if (!resp.ok) throw new Error('catalogo.json nao encontrado');
  estado.catalogo = await resp.json();

  const pacotes = await Promise.all(
    estado.catalogo.pacotes.map(async (p) => {
      const r = await fetch(new URL('missoes/' + p.arquivo, BASE));
      if (!r.ok) { console.warn('pacote ausente:', p.arquivo); return []; }
      const dados = await r.json();
      return (dados.missoes || []).map(m => ({
        ...m,
        pacote: p.arquivo,
        pacoteNome: p.nome,
        dificuldade: m.dificuldade || p.dificuldade,
        trilhas: m.trilhas || p.trilhas || ['geral']
      }));
    })
  );
  estado.missoes = pacotes.flat();

  const cenarios = await Promise.all(
    (estado.catalogo.cenarios || []).map(async (arq) => {
      const r = await fetch(new URL('cenarios/' + arq, BASE));
      if (!r.ok) return null;
      const dados = await r.json();
      return [dados.id || arq.replace('.json', ''), dados];
    })
  );
  for (const c of cenarios) if (c) estado.cenarios[c[0]] = c[1];

  return estado;
}

/* ---------- selecao ---------- */

function candidatas() {
  return estado.missoes.filter(m => {
    if (ajustes.dificuldade !== 'mista' && m.dificuldade !== ajustes.dificuldade) return false;
    if (ajustes.trilha !== 'geral' && !m.trilhas.includes(ajustes.trilha)) return false;
    return !estado.usadas.has(m.id);
  });
}

function sortear() {
  let lista = candidatas();
  if (!lista.length) {
    estado.usadas.clear();
    lista = candidatas();
  }
  if (!lista.length) return null;
  return lista[Math.floor(Math.random() * lista.length)];
}

/* ---------- cenario ---------- */

function montarCenario(id) {
  const cenario = estado.cenarios[id] || estado.cenarios[estado.catalogo.cenario_padrao] || { arvore: [] };
  vfs.montar(JSON.parse(JSON.stringify(cenario.arvore || [])));
  carregarEmails(JSON.parse(JSON.stringify(cenario.emails || [])));
  sistema.rede = cenario.rede !== false;
  sistema.bluetooth = !!cenario.bluetooth;
  sistema.pareado = null;
  sistema.atualizado = !!cenario.atualizado;
  const jaInstalados = cenario.pacotes_instalados || ['pinguim-pincel', 'transmissor-orbital'];
  for (const pac of PACOTES) pac.instalado = jaInstalados.includes(pac.nome);
  pararInterrupcoes();
  montarP95(cenario);
  if (estado.emTreino) iniciarInterrupcoes();
}

/* ---------- comparacao de acoes ---------- */

const IGNORAR = new Set(['acao', 'dica', 'dica2', 'texto', 'opcional']);

function bate(esperado, recebido) {
  if (esperado === '*') return recebido !== undefined && recebido !== null && recebido !== '';
  if (typeof esperado === 'number') return Number(recebido) === esperado;
  const e = String(esperado);
  const r = String(recebido ?? '');
  if (e.startsWith('re:')) return new RegExp(e.slice(3), 'i').test(r);
  if (e.startsWith('contem:')) return r.toLowerCase().includes(e.slice(7).toLowerCase());
  if (e.startsWith('min:')) return Number(recebido) >= Number(e.slice(4));
  return r.trim().toLowerCase() === e.trim().toLowerCase();
}

function passoCombina(passo, ev) {
  if (passo.acao !== ev.acao) return false;
  for (const [chave, valor] of Object.entries(passo)) {
    if (IGNORAR.has(chave)) continue;
    if (!bate(valor, ev[chave])) return false;
  }
  return true;
}

/* ---------- painel de passos ---------- */

function pintarPassos() {
  const ul = document.getElementById('passos');
  const titulo = document.getElementById('missao-titulo');
  if (titulo) {
    titulo.textContent = estado.atual
      ? estado.atual.titulo + ' (' + estado.atual.dificuldade + ')'
      : 'Nenhuma missao em andamento.';
  }
  if (!ul) return;
  ul.innerHTML = '';
  estado.atual.passos.forEach((p, i) => {
    const li = document.createElement('li');
    li.textContent = p.texto || descreverPasso(p);
    li.dataset.feito = estado.feitos[i] ? '1' : '0';
    li.dataset.atual = (!estado.feitos[i] && i === estado.passoAtual && !estado.falhou) ? '1' : '0';
    li.dataset.falhou = (!estado.feitos[i] && estado.falhou) ? '1' : '0';
    ul.appendChild(li);
  });
}

function descreverPasso(p) {
  const mapa = {
    abrir_app: 'Abrir um aplicativo',
    duplo_clique: 'Abrir com clique duplo',
    renomear: 'Renomear um item',
    mover: 'Mover um item',
    copiar: 'Copiar um item',
    colar: 'Colar um item',
    excluir: 'Excluir um item',
    esvaziar_lixeira: 'Esvaziar a lixeira',
    restaurar: 'Restaurar da lixeira',
    criar_pasta: 'Criar uma pasta',
    comando_terminal: 'Usar um comando no terminal',
    enviar_email: 'Enviar uma mensagem',
    marcar_golpe: 'Marcar mensagem como golpe',
    menu_contexto: 'Usar o botao direito do mouse',
    hover_tooltip: 'Passar o mouse e ler a etiqueta',
    rolar: 'Rolar a tela',
    navegar_url: 'Visitar um endereco',
    abrir_inspetor: 'Inspecionar o codigo da pagina'
  };
  return mapa[p.acao] || 'Executar acao no sistema';
}

/* ---------- deteccao de missao impossivel ----------
   Um passo que depende de um arquivo vira impossivel se aquele arquivo, depois
   de ter existido durante a missao, sumir de vez (lixeira esvaziada, por exemplo).
   Só acusamos falha se o recurso ja foi visto presente: assim um passo que ainda
   vai criar o arquivo nao dispara alarme falso. */

function recursoDoPasso(passo) {
  if (passo.acao === 'excluir' || passo.acao === 'esvaziar_lixeira') return null;
  return passo.caminho || passo.nome || null;
}

function checarImpossivel() {
  for (let i = 0; i < estado.atual.passos.length; i++) {
    if (estado.feitos[i]) continue;
    const alvo = recursoDoPasso(estado.atual.passos[i]);
    if (!alvo) continue;
    const existe = !!vfs.procurar(alvo);
    if (existe) { estado.vistos.add(i); continue; }
    if (estado.vistos.has(i)) {
      const nome = String(alvo).replace(/^contem:/, '');
      return `O item "${nome}" nao existe mais em lugar nenhum, e o passo ` +
             `"${estado.atual.passos[i].texto || descreverPasso(estado.atual.passos[i])}" ` +
             `precisava dele.`;
    }
  }
  return null;
}

function checarFalhaDeclarada(ev) {
  for (const regra of estado.atual.falha || []) {
    if (regra.acao !== ev.acao) continue;
    let bateTudo = true;
    for (const [chave, valor] of Object.entries(regra)) {
      if (chave === 'acao' || chave === 'motivo' || chave === 'so_se_pendente') continue;
      if (!bate(valor, ev[chave])) { bateTudo = false; break; }
    }
    if (!bateTudo) continue;
    if (regra.so_se_pendente !== undefined && estado.feitos[regra.so_se_pendente]) continue;
    return regra.motivo || 'Essa acao tornou a missao impossivel.';
  }
  return null;
}

export function falharMissao(motivo) {
  if (estado.falhou) return;
  estado.falhou = true;
  sessao.falhadas = (sessao.falhadas || 0) + 1;
  
  tocar('falha');
  humor('erro');
  pintarPassos();
  dizer(
    'MISSAO FALHOU.\n\n' + motivo +
    '\n\nAcontece, cadete. No computador de verdade tambem tem acao sem volta, e ' +
    'agora voce sabe disso na pratica. Use "Refazer missao" para tentar de novo do ' +
    'zero, ou "Proxima missao" para seguir em frente. Nao gastei nenhum dos seus pulos.',
    'erro');
  const prox = document.getElementById('btn-proximo');
  if (prox) prox.disabled = false;
  const refazer = document.getElementById('btn-refazer');
  if (refazer) refazer.disabled = false;
}

export function refazerMissao() {
  if (!estado.atual) return;
  const missao = estado.atual;
  estado.passoAtual = 0;
  estado.feitos = missao.passos.map(() => false);
  estado.nivelDica = 0;
  estado.falhou = false;
  estado.vistos = new Set();
  estado.inicioMissao = Date.now();
  montarCenario(missao.cenario);
  pintarPassos();
  atualizarBotoes();
  dizer('Tudo de volta ao inicio, cadete.\n\n' + missao.fala_intro, 'falando');
}

/* ---------- ciclo da missao ---------- */

export function proximaMissao() {
  const aviso = document.getElementById('modal-parabens');
  if (aviso) aviso.dataset.aberto = '0';
  const missao = sortear();
  if (!missao) {
    dizer('Acabaram as missoes deste filtro, cadete. Troque a dificuldade ou a trilha ali em cima.', 'alerta');
    return;
  }
  estado.atual = missao;
  estado.usadas.add(missao.id);
  estado.passoAtual = 0;
  estado.feitos = missao.passos.map(() => false);
  estado.nivelDica = 0;
  estado.falhou = false;
  estado.vistos = new Set();
  estado.inicioMissao = Date.now();

  montarCenario(missao.cenario);
  pintarPassos();
  atualizarBotoes();

  const cabecalho = `MISSAO: ${missao.titulo}\n\n`;
  dizer(cabecalho + missao.fala_intro, 'falando');
  tocar('alerta');
}

function concluirMissao() {
  const segundos = Math.round((Date.now() - estado.inicioMissao) / 1000);
  const ganhos = calcularPontos(estado.atual, segundos, !ajustes.tempoInfinito);
  somarPontos(ganhos);
  sessao.concluidas++;
  pintarPontos();
  tocar('sucesso');
  let extra = '';
  if (sessao.promovido) {
    extra = `\n\nPROMOCAO: voce agora e ${sessao.promovido}.`;
    sessao.promovido = null;
  } else {
    const prox = proximaPatente(sessao.pontos);
    if (prox) extra = `\n\nFaltam ${prox.pontos - sessao.pontos} pontos para ${prox.nome}.`;
  }
  dizer(`${estado.atual.fala_sucesso}\n\n+${ganhos} pontos. Tempo: ${segundos}s.${extra}`, 'feliz');
  document.getElementById('btn-proximo').disabled = false;
  bus.emit('missao:concluida', {
    missao: estado.atual,
    pontos: ganhos,
    segundos,
    habilidades: habilidadesDaMissao(estado.atual),
    promocao: extra.includes('PROMOCAO') ? patenteDe(sessao.pontos).nome : null
  });
}

function aoAgir(ev) {
  if (!estado.emTreino) return;

  /* fechar uma janela intrometida vale ponto mesmo fora dos passos da missao */
  if (ev.acao === 'fechar_popup' && ev.correto) {
    somarPontos(8);
    dizer('Boa. Janela intrometida fechada sem clicar na isca. Mais 8 pontos.', 'feliz');
    return;
  }
  if (ev.acao === 'cair_no_golpe') {
    humor('alerta');
    setTimeout(() => humor('neutro'), 1200);
    return;
  }

  if (!estado.atual || estado.falhou) return;
  sessao.acoes++;

  const livre = estado.atual.ordem === 'livre';
  const indices = livre
    ? estado.feitos.map((f, i) => (f ? -1 : i)).filter(i => i >= 0)
    : [estado.passoAtual];

  for (const i of indices) {
    const passo = estado.atual.passos[i];
    if (!passo || !passoCombina(passo, ev)) continue;

    estado.feitos[i] = true;
    estado.nivelDica = 0;
    tocar('passo');
    humor('feliz');
    setTimeout(() => humor('neutro'), 700);

    while (estado.feitos[estado.passoAtual]) estado.passoAtual++;
    pintarPassos();
    atualizarIconeLixeira();

    if (estado.feitos.every(Boolean)) concluirMissao();
    else {
      const motivo = checarImpossivel();
      if (motivo) falharMissao(motivo);
    }
    return;
  }

  atualizarIconeLixeira();

  const declarada = checarFalhaDeclarada(ev);
  if (declarada) { falharMissao(declarada); return; }
  const motivo = checarImpossivel();
  if (motivo) falharMissao(motivo);
}

/* ---------- dicas ---------- */

export function pedirDica() {
  if (!estado.atual) return;
  const passo = estado.atual.passos[estado.passoAtual];
  if (!passo) return;
  estado.nivelDica++;

  /* Monta a escada de ajuda com o que existe para este passo e nunca repete
     um degrau. Quem gosta de procurar sozinho para no primeiro; quem precisa
     de mais vai descendo ate a receita clique a clique. */
  const alvos = alvosDoPasso(passo);
  const escada = [];

  escada.push('Foco no passo marcado com [>] na lista. ' +
    (passo.dica || 'Procure o programa certo para essa acao.'));

  if (passo.dica2) escada.push(passo.dica2);

  const conceito = conceitoDe(passo);
  if (conceito) {
    escada.push(conceito + (alvos.length ? '\n\nNesta missao: ' + alvos.join('; ') + '.' : ''));
  }

  const receita = receitaDe(passo);
  if (receita) {
    let texto = 'Vou abrir o jogo, cadete.\n\n' + receita;
    if (alvos.length) texto += '\n\nOs alvos desta missao: ' + alvos.join('; ') + '.';
    escada.push(texto);
  } else if (alvos.length) {
    escada.push('Vou abrir o jogo, cadete.\n\nOs alvos desta missao: ' + alvos.join('; ') + '.');
  }

  /* Ultimo degrau: nao repete a receita, muda de estrategia e oferece saida. */
  escada.push(
    'Ja te contei tudo que eu sabia sobre este passo, cadete.\n\n' +
    'Tente assim: reveja a lista de passos ao lado e faca so o que esta marcado com [>], ' +
    'um de cada vez. Abra o Manual da Frota no menu Iniciar, ele explica os movimentos ' +
    'basicos do mouse e do teclado.\n\n' +
    'Se mesmo assim nao sair, use Refazer missao para comecar limpo, ou Pular missao. ' +
    'Pular nao e vergonha: e informacao de que essa aqui ficou dificil demais para agora.');

  const grau = Math.min(estado.nivelDica, escada.length) - 1;
  dizer(escada[grau], 'pensando');
}

/* ---------- pular e desistir ---------- */

export function podePular() { return estado.pulosRestantes > 0; }

export function pularMissao() {
  if (!podePular()) return false;
  estado.pulosRestantes--;
  sessao.puladas++;
  tocar('falha');
  dizer('Missao arquivada. Sem pontos por essa. Restam ' + estado.pulosRestantes + ' pulos nesta sessao.', 'alerta');
  setTimeout(proximaMissao, 900);
  atualizarBotoes();
  return true;
}

export function desistirMissao() {
  tocar('falha');
  dizer('Retirada tatica registrada. Vamos comecar outra.', 'alerta');
  setTimeout(proximaMissao, 900);
}

function atualizarBotoes() {
  const pular = document.getElementById('btn-pular');
  if (pular) {
    pular.disabled = !podePular();
    pular.textContent = 'Pular missao (' + estado.pulosRestantes + ')';
  }
  const prox = document.getElementById('btn-proximo');
  if (prox) prox.disabled = true;
  const refazer = document.getElementById('btn-refazer');
  if (refazer) refazer.disabled = false;
}

/* ---------- cronometro ---------- */

function pintarTempo() {
  const el = document.getElementById('leitura-tempo');
  if (!el) return;
  if (ajustes.tempoInfinito) { el.innerHTML = 'TEMPO <b>livre</b>'; el.dataset.urgente = '0'; return; }
  const m = Math.floor(estado.restante / 60);
  const s = estado.restante % 60;
  el.innerHTML = `TEMPO <b>${m}:${String(s).padStart(2, '0')}</b>`;
  el.dataset.urgente = estado.restante <= 60 ? '1' : '0';
}

function iniciarCronometro() {
  clearInterval(estado.timer);
  if (ajustes.tempoInfinito) { pintarTempo(); return; }
  estado.restante = ajustes.minutos * 60;
  pintarTempo();
  estado.timer = setInterval(() => {
    estado.restante--;
    if (estado.restante <= 10 && estado.restante > 0) tocar('tempo');
    pintarTempo();
    if (estado.restante <= 0) encerrarTreino('tempo');
  }, 1000);
}

/* ---------- inicio e fim ---------- */

export function iniciarTreino() {
  estado.emTreino = true;
  estado.usadas.clear();
  estado.pulosRestantes = 2;
  iniciarCronometro();
  iniciarInterrupcoes();
  proximaMissao();
}

export function encerrarTreino(motivo = 'manual') {
  estado.emTreino = false;
  clearInterval(estado.timer);
  pararInterrupcoes();
  bus.emit('treino:fim', { motivo, pontos: sessao.pontos });
}

bus.on('acao', aoAgir);

export { completarFala };
