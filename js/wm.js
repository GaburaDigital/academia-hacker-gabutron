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

function arrastavel(el, alca) {
  alca.addEventListener('mousedown', (ev) => {
    if (ev.button !== 0 || el.dataset.max === '1') return;
    if (ev.target.closest('.p95-btn-barra')) return;
    const caixa = camada().getBoundingClientRect();
    const dx = ev.clientX - el.offsetLeft;
    const dy = ev.clientY - el.offsetTop;
    const mover = (e) => {
      el.style.left = Math.min(Math.max(0, e.clientX - dx), caixa.width - 60) + 'px';
      el.style.top = Math.min(Math.max(0, e.clientY - dy), caixa.height - 24) + 'px';
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
  const el = document.createElement('div');
  el.className = 'p95-janela';
  el.dataset.ativa = '1';
  el.dataset.min = '0';
  el.style.width = (op.largura || 520) + 'px';
  el.style.height = (op.altura || 340) + 'px';
  const desloque = (contador % 6) * 18;
  el.style.left = (op.x ?? 40 + desloque) + 'px';
  el.style.top = (op.y ?? 26 + desloque) + 'px';
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
    tocar('alerta');
    acoes.querySelector('button')?.focus();
  });
}
