/* Gerenciador de janelas do Pinguim 95x. */

import { acao } from './bus.js';
import { tocar } from './sound.js';
import { ICONES95 } from './icons.js';
import { fecharMenu } from './ctxmenu.js';

const janelas = new Map();
let z = 10;
let contador = 0;

function camada() { return document.getElementById('p95-janelas'); }
function barra() { return document.getElementById('p95-lista-tarefas'); }

export function janelaAberta(app) {
  for (const j of janelas.values()) if (j.app === app) return j;
  return null;
}

export function ativar(id) {
  const alvo = janelas.get(id);
  if (!alvo) return;
  alvo.el.dataset.min = '0';
  alvo.el.style.zIndex = ++z;
  for (const [k, j] of janelas) {
    j.el.dataset.ativa = k === id ? '1' : '0';
    j.tarefa.dataset.ativa = k === id ? '1' : '0';
  }
}

export function fechar(id) {
  const j = janelas.get(id);
  if (!j) return;
  j.aoFechar?.();
  j.el.remove();
  j.tarefa.remove();
  janelas.delete(id);
  tocar('fechar');
  acao('fechar_app', { app: j.app });
  const ultima = [...janelas.keys()].pop();
  if (ultima) ativar(ultima);
}

export function fecharTodas() {
  for (const id of [...janelas.keys()]) {
    const j = janelas.get(id);
    j.aoFechar?.();
    j.el.remove();
    j.tarefa.remove();
    janelas.delete(id);
  }
  z = 10;
}

/* Mantem a janela inteiramente dentro da area do sistema.
   Nenhuma janela pode nascer nem ser arrastada para fora: se a barra de titulo
   sair da tela, o aluno perde o controle dela. */
export function encaixar(el) {
  const caixa = camada().getBoundingClientRect();
  if (!caixa.width || el.dataset.max === '1') return;
  const largura = Math.min(el.offsetWidth, caixa.width);
  const altura = Math.min(el.offsetHeight, caixa.height);
  if (el.offsetWidth > caixa.width) el.style.width = largura + 'px';
  if (el.offsetHeight > caixa.height) el.style.height = altura + 'px';
  const x = Math.min(Math.max(0, el.offsetLeft), Math.max(0, caixa.width - largura));
  const y = Math.min(Math.max(0, el.offsetTop), Math.max(0, caixa.height - altura));
  el.style.left = x + 'px';
  el.style.top = y + 'px';
}

export function encaixarTodas() {
  for (const j of janelas.values()) encaixar(j.el);
  for (const d of document.querySelectorAll('.p95-dialogo')) encaixar(d);
}

function arrastavel(el, alca) {
  alca.addEventListener('mousedown', (ev) => {
    if (ev.button !== 0 || el.dataset.max === '1') return;
    if (ev.target.closest('.p95-btn-barra')) return;
    const caixa = camada().getBoundingClientRect();
    const dx = ev.clientX - el.offsetLeft;
    const dy = ev.clientY - el.offsetTop;
    const mover = (e) => {
      const limiteX = Math.max(0, caixa.width - el.offsetWidth);
      const limiteY = Math.max(0, caixa.height - el.offsetHeight);
      el.style.left = Math.min(Math.max(0, e.clientX - dx), limiteX) + 'px';
      el.style.top = Math.min(Math.max(0, e.clientY - dy), limiteY) + 'px';
    };
    const soltar = () => {
      document.removeEventListener('mousemove', mover);
      document.removeEventListener('mouseup', soltar);
      acao('mover_janela', {});
    };
    document.addEventListener('mousemove', mover);
    document.addEventListener('mouseup', soltar);
  });
}

/* opcoes: { app, titulo, icone, largura, altura, x, y, corpoFace, menu, status } */
export function criarJanela(op) {
  const existente = op.app ? janelaAberta(op.app) : null;
  if (existente && !op.multipla) { ativar(existente.id); existente.jaExistia = true; return existente; }

  const id = 'jan' + (++contador);
  const area = camada().getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'p95-janela';
  el.dataset.ativa = '1';
  el.dataset.min = '0';
  const largura = Math.min(op.largura || 520, Math.max(260, area.width - 12));
  const altura = Math.min(op.altura || 340, Math.max(150, area.height - 12));
  el.style.width = largura + 'px';
  el.style.height = altura + 'px';
  const desloque = (contador % 6) * 18;
  el.style.left = Math.min(op.x ?? 30 + desloque, Math.max(0, area.width - largura)) + 'px';
  el.style.top = Math.min(op.y ?? 20 + desloque, Math.max(0, area.height - altura)) + 'px';
  el.style.zIndex = ++z;

  const icone = ICONES95[op.icone] || ICONES95.executavel;

  el.innerHTML = `
    <div class="p95-barra">${icone}<span>${op.titulo}</span>
      <button class="p95-btn-barra" data-acao="min" title="Minimizar" aria-label="Minimizar">_</button>
      <button class="p95-btn-barra" data-acao="max" title="Maximizar" aria-label="Maximizar">[]</button>
      <button class="p95-btn-barra" data-acao="fechar" title="Fechar" aria-label="Fechar">X</button>
    </div>
    ${op.menu ? `<div class="p95-menu-fita">${op.menu}</div>` : ''}
    <div class="p95-corpo${op.corpoFace ? ' p95-corpo--face' : ''}"></div>
    ${op.status !== false ? '<div class="p95-status"></div>' : ''}`;

  camada().appendChild(el);

  const tarefa = document.createElement('button');
  tarefa.className = 'p95-tarefa';
  tarefa.dataset.ativa = '1';
  tarefa.innerHTML = icone + '<span>' + op.titulo + '</span>';
  tarefa.addEventListener('click', () => {
    const j = janelas.get(id);
    if (j.el.dataset.ativa === '1' && j.el.dataset.min !== '1') {
      j.el.dataset.min = '1';
      j.el.dataset.ativa = '0';
      tarefa.dataset.ativa = '0';
      acao('minimizar', { app: j.app });
    } else {
      ativar(id);
    }
  });
  barra().appendChild(tarefa);

  const janela = {
    id,
    app: op.app,
    el,
    tarefa,
    corpo: el.querySelector('.p95-corpo'),
    status: el.querySelector('.p95-status'),
    fita: el.querySelector('.p95-menu-fita'),
    definirStatus(txt) { if (this.status) this.status.textContent = txt; },
    definirTitulo(txt) { el.querySelector('.p95-barra span').textContent = txt; },
    fechar() { fechar(id); }
  };
  janela.jaExistia = false;
  janelas.set(id, janela);

  el.addEventListener('mousedown', () => { fecharMenu(); ativar(id); });
  arrastavel(el, el.querySelector('.p95-barra'));

  el.querySelector('[data-acao="fechar"]').addEventListener('click', () => fechar(id));
  el.querySelector('[data-acao="min"]').addEventListener('click', () => {
    el.dataset.min = '1';
    tarefa.dataset.ativa = '0';
    acao('minimizar', { app: op.app });
  });
  el.querySelector('[data-acao="max"]').addEventListener('click', () => {
    el.dataset.max = el.dataset.max === '1' ? '0' : '1';
    acao('maximizar', { app: op.app, estado: el.dataset.max });
  });
  el.querySelector('.p95-barra').addEventListener('dblclick', () => {
    el.dataset.max = el.dataset.max === '1' ? '0' : '1';
  });

  encaixar(el);
  tocar('abrir');
  ativar(id);
  acao('abrir_app', { app: op.app });
  return janela;
}

/* Caixa de dialogo com campo de texto (renomear, nova pasta, ...) */
export function dialogoEntrada({ titulo, texto, valor = '' }) {
  return new Promise((resolve) => {
    const area = document.getElementById('p95');
    const cx = document.createElement('div');
    cx.className = 'p95-dialogo';
    cx.style.zIndex = ++z + 100;
    cx.innerHTML = `
      <div class="p95-barra">${ICONES95.pergunta}<span>${titulo}</span></div>
      <div class="conteudo" style="display:block">
        <p style="margin:0 0 8px">${texto}</p>
        <input type="text" class="entrada" style="width:100%;font-family:inherit;font-size:12px;padding:3px 5px">
      </div>
      <div class="acoes">
        <button class="p95-btn" data-ok>OK</button>
        <button class="p95-btn" data-cancelar>Cancelar</button>
      </div>`;
    area.appendChild(cx);
    prepararDialogo(cx, () => { cx.remove(); resolve(null); });
    const campo = cx.querySelector('.entrada');
    campo.value = valor;
    campo.focus();
    campo.select();
    const ok = () => { const v = campo.value.trim(); cx.remove(); resolve(v || null); };
    cx.querySelector('[data-ok]').addEventListener('click', ok);
    cx.querySelector('[data-cancelar]').addEventListener('click', () => { cx.remove(); resolve(null); });
    campo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') ok();
      if (e.key === 'Escape') { cx.remove(); resolve(null); }
    });
  });
}

/* Caixa de dialogo do sistema (alerta, confirmacao) */
export function dialogo({ titulo, texto, icone = 'aviso', botoes = ['OK'] }) {
  return new Promise((resolve) => {
    const area = document.getElementById('p95');
    const cx = document.createElement('div');
    cx.className = 'p95-dialogo';
    cx.style.zIndex = ++z + 100;
    cx.innerHTML = `
      <div class="p95-barra">${ICONES95.info}<span>${titulo}</span></div>
      <div class="conteudo">${ICONES95[icone] || ICONES95.aviso}<div>${texto}</div></div>
      <div class="acoes"></div>`;
    const acoes = cx.querySelector('.acoes');
    botoes.forEach((rotulo, i) => {
      const b = document.createElement('button');
      b.className = 'p95-btn';
      b.textContent = rotulo;
      b.addEventListener('click', () => { cx.remove(); tocar('clique'); resolve(i); });
      acoes.appendChild(b);
    });
    area.appendChild(cx);
    prepararDialogo(cx, () => { cx.remove(); resolve(botoes.length - 1); });
    tocar('alerta');
    acoes.querySelector('button')?.focus();
  });
}


/* Centraliza o dialogo dentro da area do sistema, deixa arrastavel e garante
   que os botoes nunca fiquem fora da tela. */
function prepararDialogo(cx, aoFechar) {
  const caixa = camada().getBoundingClientRect();
  cx.style.transform = 'none';
  cx.style.maxHeight = Math.max(120, caixa.height - 16) + 'px';
  cx.style.left = Math.max(0, Math.round((caixa.width - cx.offsetWidth) / 2)) + 'px';
  cx.style.top = Math.max(0, Math.round((caixa.height - cx.offsetHeight) / 2)) + 'px';

  const barra = cx.querySelector('.p95-barra');
  if (barra && !barra.querySelector('.p95-btn-barra')) {
    const x = document.createElement('button');
    x.className = 'p95-btn-barra';
    x.type = 'button';
    x.textContent = 'X';
    x.setAttribute('aria-label', 'Fechar');
    x.addEventListener('click', aoFechar);
    barra.appendChild(x);
  }
  if (barra) arrastavel(cx, barra);
  encaixar(cx);
}
