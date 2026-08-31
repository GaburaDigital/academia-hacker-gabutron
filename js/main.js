/* Ponto de entrada da aplicacao. */

import { bus } from './bus.js';
import { ajustes, carregarAjustes, salvarAjustes, limparCache } from './settings.js';
import { tocar, destravarAudio, calarVoz } from './sound.js';
import { rodarBoot } from './boot.js';
import { iniciarRosto, dizer, ouvirFala, completarFala } from './gabutron.js';
import { prepararP95, montarP95 } from './p95.js';
import { encaixarTodas } from './wm.js';
import * as missao from './mission.js';
import { sessao, zerarSessao, pintarPontos, lerPlacar, gravarPlacar, zerarPlacar } from './score.js';
import { abrirDiploma } from './diploma.js';

const $ = (id) => document.getElementById(id);

/* ---------- modal de confirmacao ---------- */

function confirmar(texto) {
  return new Promise((resolve) => {
    const m = $('modal-confirma');
    $('confirma-texto').textContent = texto;
    m.dataset.aberto = '1';
    const sim = () => { fim(); resolve(true); };
    const nao = () => { fim(); resolve(false); };
    const fim = () => {
      m.dataset.aberto = '0';
      $('confirma-sim').removeEventListener('click', sim);
      $('confirma-nao').removeEventListener('click', nao);
    };
    $('confirma-sim').addEventListener('click', sim);
    $('confirma-nao').addEventListener('click', nao);
  });
}

/* ---------- ajustes ---------- */

function abrirAjustes() {
  $('aj-som').checked = ajustes.som;
  $('aj-voz').checked = ajustes.voz;
  $('aj-crt').checked = ajustes.crt;
  $('aj-claro').checked = ajustes.tema === 'claro';
  $('aj-codinome').value = ajustes.codinome || '';
  $('modal-ajustes').dataset.aberto = '1';
}

function ligarAjustes() {
  $('btn-ajustes').addEventListener('click', abrirAjustes);
  $('btn-fechar-ajustes').addEventListener('click', () => { $('modal-ajustes').dataset.aberto = '0'; });

  $('btn-salvar-ajustes').addEventListener('click', () => {
    const ok = salvarAjustes({
      som: $('aj-som').checked,
      voz: $('aj-voz').checked,
      crt: $('aj-crt').checked,
      tema: $('aj-claro').checked ? 'claro' : 'escuro',
      codinome: $('aj-codinome').value.trim(),
      dificuldade: $('sel-dificuldade').value,
      trilha: $('sel-trilha').value,
      minutos: Number($('sel-minutos').value),
      tempoInfinito: $('chk-infinito').checked
    });
    tocar(ok ? 'sucesso' : 'falha');
    $('modal-ajustes').dataset.aberto = '0';
    dizer(ok ? 'Preferencias gravadas neste computador, cadete.'
             : 'Nao consegui gravar as preferencias. O navegador pode estar em modo privado.',
          ok ? 'feliz' : 'alerta');
  });

  $('btn-limpar-cache').addEventListener('click', async () => {
    if (!await confirmar('Isso apaga as preferencias e o placar guardados neste computador. Confirma?')) return;
    limparCache();
    aplicarNaBarra();
    tocar('falha');
    dizer('Cache limpo. Este computador esqueceu tudo o que sabia sobre voce.', 'alerta');
    $('modal-ajustes').dataset.aberto = '0';
  });

  /* aplicar imediatamente sem precisar salvar */
  $('aj-som').addEventListener('change', (e) => { ajustes.som = e.target.checked; if (e.target.checked) tocar('clique'); });
  $('aj-crt').addEventListener('change', (e) => { ajustes.crt = e.target.checked; document.body.dataset.crt = e.target.checked ? '1' : '0'; });
  $('aj-claro').addEventListener('change', (e) => { ajustes.tema = e.target.checked ? 'claro' : 'escuro'; document.body.dataset.tema = ajustes.tema; });
  $('aj-voz').addEventListener('change', (e) => { ajustes.voz = e.target.checked; if (!e.target.checked) calarVoz(); });
}

function aplicarNaBarra() {
  $('sel-dificuldade').value = ajustes.dificuldade;
  $('sel-trilha').value = ajustes.trilha;
  $('sel-minutos').value = String(ajustes.minutos);
  $('chk-infinito').checked = ajustes.tempoInfinito;
  $('sel-minutos').disabled = ajustes.tempoInfinito;
}

/* ---------- placar ---------- */

function abrirPlacar() {
  const lista = lerPlacar();
  const ul = $('placar-lista');
  ul.innerHTML = '';
  for (const item of lista) {
    const li = document.createElement('li');
    li.innerHTML = `<span>${item.codinome}</span><b>${item.pontos}</b>`;
    ul.appendChild(li);
  }
  $('placar-vazio').classList.toggle('oculto', lista.length > 0);
  $('modal-placar').dataset.aberto = '1';
}

function ligarPlacar() {
  $('btn-placar').addEventListener('click', abrirPlacar);
  $('btn-fechar-placar').addEventListener('click', () => { $('modal-placar').dataset.aberto = '0'; });
  $('btn-zerar-placar').addEventListener('click', async () => {
    if (!await confirmar('Zerar o placar desta maquina?')) return;
    zerarPlacar();
    abrirPlacar();
  });
}

/* ---------- barra de treino ---------- */

function ligarBarra() {
  $('sel-dificuldade').addEventListener('change', (e) => { ajustes.dificuldade = e.target.value; });
  $('sel-trilha').addEventListener('change', (e) => { ajustes.trilha = e.target.value; });
  $('sel-minutos').addEventListener('change', (e) => { ajustes.minutos = Number(e.target.value); });
  $('chk-infinito').addEventListener('change', (e) => {
    ajustes.tempoInfinito = e.target.checked;
    $('sel-minutos').disabled = e.target.checked;
  });

  $('btn-iniciar').addEventListener('click', async () => {
    destravarAudio();
    if (missao.estado.emTreino) {
      if (!await confirmar('Comecar um treino novo? A pontuacao atual vai para o placar.')) return;
      encerrar('manual');
    }
    zerarSessao();
    missao.iniciarTreino();
    $('btn-iniciar').textContent = 'Reiniciar treino';
  });
}

/* ---------- botoes do GabuTRON ---------- */

function ligarGabutron() {
  $('btn-ouvir').addEventListener('click', () => { destravarAudio(); ouvirFala(); });
  $('btn-dica').addEventListener('click', () => {
    if (!missao.estado.emTreino) { dizer('Comece um treino primeiro, cadete.', 'alerta'); return; }
    missao.pedirDica();
  });
  $('btn-proximo').addEventListener('click', () => {
    if (completarFala()) return;
    missao.proximaMissao();
  });
  $('btn-refazer').addEventListener('click', async () => {
    if (!missao.estado.emTreino || !missao.estado.atual) return;
    if (missao.estado.falhou || await confirmar('Recomecar esta missao do zero?')) {
      missao.refazerMissao();
    }
  });
  $('btn-pular').addEventListener('click', async () => {
    if (!missao.estado.emTreino) return;
    if (!missao.podePular()) {
      dizer('Sem pulos restantes neste turno. Use a Dica, ela existe justamente para isso.', 'alerta');
      return;
    }
    if (await confirmar('Pular esta missao? Voce nao ganha pontos por ela e tem pulos limitados.')) {
      missao.pularMissao();
    }
  });
  $('btn-desistir').addEventListener('click', async () => {
    if (!missao.estado.emTreino) return;
    if (await confirmar('Desistir desta missao e sortear outra?')) missao.desistirMissao();
  });

  /* clicar no texto completa a digitacao */
  $('fala-texto').addEventListener('click', completarFala);
}

/* ---------- fim de turno ---------- */

function encerrar(motivo) {
  missao.encerrarTreino(motivo);
}

bus.on('treino:fim', ({ motivo }) => {
  const nome = ajustes.codinome || 'Cadete anonimo';
  gravarPlacar(nome, sessao.pontos);
  $('fim-texto').innerHTML =
    `${motivo === 'tempo' ? 'O turno acabou.' : 'Turno encerrado.'}<br><br>` +
    `Codinome: <b>${nome}</b><br>Pontos: <b>${sessao.pontos}</b><br>` +
    `Missoes concluidas: <b>${sessao.concluidas}</b><br>Missoes puladas: <b>${sessao.puladas}</b>`;
  $('modal-fim').dataset.aberto = '1';
  tocar('sucesso');
  dizer('Turno encerrado, cadete. ' + sessao.pontos + ' pontos. A frota agradece, meio desconfiada.', 'feliz');
});

function ligarDiploma() {
  $('btn-fim-diploma').addEventListener('click', () => {
    $('modal-fim').dataset.aberto = '0';
    abrirDiploma();
  });
  $('btn-fechar-diploma').addEventListener('click', () => { $('modal-diploma').dataset.aberto = '0'; });
  $('btn-imprimir-diploma').addEventListener('click', () => window.print());
}

function ligarFim() {
  $('btn-fim-placar').addEventListener('click', () => { $('modal-fim').dataset.aberto = '0'; abrirPlacar(); });
  $('btn-fim-novo').addEventListener('click', () => {
    $('modal-fim').dataset.aberto = '0';
    zerarSessao();
    missao.iniciarTreino();
  });
}

/* ---------- modo tela cheia da area do computador ---------- */

function ligarFoco() {
  const botao = $('btn-foco');
  botao.addEventListener('click', () => {
    const ativo = document.body.dataset.foco === '1';
    document.body.dataset.foco = ativo ? '0' : '1';
    botao.textContent = ativo ? 'Tela cheia' : 'Voltar ao normal';
    botao.title = ativo ? 'Ampliar a area do computador' : 'Mostrar o GabuTRON de novo';
    tocar('clique');
    requestAnimationFrame(encaixarTodas);
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && document.body.dataset.foco === '1') botao.click();
  });
}

/* Se a area do sistema mudar de tamanho, puxa as janelas de volta para dentro. */
function vigiarTamanho() {
  const area = $('p95');
  if (!area || !window.ResizeObserver) {
    window.addEventListener('resize', () => encaixarTodas());
    return;
  }
  let esperando = null;
  new ResizeObserver(() => {
    clearTimeout(esperando);
    esperando = setTimeout(encaixarTodas, 120);
  }).observe(area);
}

/* ---------- PWA ---------- */

function registrarSW() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register(new URL('../sw.js', import.meta.url)).then((reg) => {
    reg.addEventListener('updatefound', () => {
      const novo = reg.installing;
      novo?.addEventListener('statechange', () => {
        if (novo.state === 'installed' && navigator.serviceWorker.controller) {
          dizer('Nova transmissao da frota disponivel. Recarregue a pagina para receber a versao nova.', 'alerta');
        }
      });
    });
  }).catch(() => { /* offline ou file:// */ });
}

/* ---------- inicializacao ---------- */

async function iniciar() {
  carregarAjustes();
  aplicarNaBarra();
  pintarPontos();
  iniciarRosto();
  prepararP95();
  ligarBarra();
  ligarAjustes();
  ligarPlacar();
  ligarGabutron();
  ligarFim();
  ligarDiploma();
  ligarFoco();
  vigiarTamanho();
  registrarSW();

  await rodarBoot();

  try {
    await missao.carregarCatalogo();
    montarP95({});
    const total = missao.estado.missoes.length;
    dizer(
      `Cadete${ajustes.codinome ? ' ' + ajustes.codinome : ''}, aqui e o GabuTRON. ` +
      `Tenho ${total} missoes de sabotagem carregadas e nenhuma paciencia sobrando.\n\n` +
      `Aquela caixa cinza embaixo e o Pinguim 95x, o computador de bordo. ` +
      `Ele nao e o site: e o alvo. Ajuste o treino ali em cima e aperte Iniciar treino.`,
      'falando'
    );
  } catch (e) {
    console.error(e);
    dizer('Falha ao carregar o catalogo de missoes. Confira a pasta ATIVIDADES no repositorio.', 'erro');
  }
}

iniciar();
