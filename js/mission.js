/* Motor de missoes.
   Missao e dado, nao codigo: tudo vem dos JSON em ATIVIDADES/.
   Este modulo sorteia a missao, monta o cenario, escuta o barramento
   e marca cada passo concluido. */

import { bus } from './bus.js';
import * as vfs from './vfs.js';
import { montarP95, atualizarIconeLixeira } from './p95.js';
import { carregarEmails } from './apps/email.js';
import { sistema } from './apps/config95.js';
import { dizer, humor, completarFala } from './gabutron.js';
import { tocar } from './sound.js';
import { ajustes } from './settings.js';
import { sessao, somarPontos, calcularPontos, pintarPontos } from './score.js';

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
  montarP95(cenario);
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
  if (!ul) return;
  ul.innerHTML = '';
  estado.atual.passos.forEach((p, i) => {
    const li = document.createElement('li');
    li.textContent = p.texto || descreverPasso(p);
    li.dataset.feito = estado.feitos[i] ? '1' : '0';
    li.dataset.atual = (!estado.feitos[i] && i === estado.passoAtual) ? '1' : '0';
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

/* ---------- ciclo da missao ---------- */

export function proximaMissao() {
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
  dizer(`${estado.atual.fala_sucesso}\n\n+${ganhos} pontos. Tempo: ${segundos}s.`, 'feliz');
  document.getElementById('btn-proximo').disabled = false;
}

function aoAgir(ev) {
  if (!estado.emTreino || !estado.atual) return;
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
    return;
  }
  atualizarIconeLixeira();
}

/* ---------- dicas ---------- */

export function pedirDica() {
  if (!estado.atual) return;
  const passo = estado.atual.passos[estado.passoAtual];
  if (!passo) return;
  estado.nivelDica++;

  if (estado.nivelDica === 1) {
    dizer('Foco no passo marcado com [>] na lista. ' + (passo.dica || 'Procure o aplicativo certo para essa acao.'), 'pensando');
  } else if (estado.nivelDica === 2 && passo.dica2) {
    dizer(passo.dica2, 'pensando');
  } else {
    dizer(`Passo a passo: ${passo.dica2 || passo.dica || descreverPasso(passo)}. ` +
          `A acao esperada e "${descreverPasso(passo).toLowerCase()}". Se travar, use o Manual da Frota no menu iniciar.`, 'pensando');
  }
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
  proximaMissao();
}

export function encerrarTreino(motivo = 'manual') {
  estado.emTreino = false;
  clearInterval(estado.timer);
  bus.emit('treino:fim', { motivo, pontos: sessao.pontos });
}

bus.on('acao', aoAgir);

export { completarFala };
