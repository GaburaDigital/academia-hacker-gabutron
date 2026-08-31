/* Monta o Pinguim 95x: area de trabalho, barra de tarefas, menu iniciar.
   A data e a hora sao absurdas de proposito (31 de fevereiro de 3026, 42:05). */

import { acao } from './bus.js';
import { ICONES95 } from './icons.js';
import { APPS, abrirApp } from './apps/index.js';
import { abrirMenu, fecharMenu, instalarMenuContexto } from './ctxmenu.js';
import { fecharTodas } from './wm.js';
import { tocar } from './sound.js';
import * as vfs from './vfs.js';

const RELOGIO_BASE = { min: 5, hora: 42 };

const ICONES_PADRAO = ['computador', 'explorador', 'terminal', 'email', 'navegador', 'config', 'manual', 'lixeira'];

export function montarP95(cenario = {}) {
  fecharTodas();
  fecharMenu();
  montarMesa(cenario.icones || ICONES_PADRAO);
  montarInicio();
  relogio();
}

function montarMesa(ids) {
  const mesa = document.getElementById('p95-mesa');
  mesa.innerHTML = '';
  let selecionado = null;

  for (const id of ids) {
    const app = APPS[id];
    if (!app) continue;
    const el = document.createElement('div');
    el.className = 'p95-icone';
    el.tabIndex = 0;
    el.dataset.app = id;
    el.title = app.nome;
    el.innerHTML = (ICONES95[app.icone] || ICONES95.executavel) + '<span>' + app.nome + '</span>';

    let etiqueta = null;
    el.addEventListener('mouseenter', () => {
      clearTimeout(etiqueta);
      etiqueta = setTimeout(() => acao('hover_tooltip', { alvo: id, nome: app.nome }), 600);
    });
    el.addEventListener('mouseleave', () => clearTimeout(etiqueta));

    el.addEventListener('click', () => {
      selecionado = id;
      for (const outro of mesa.children) outro.dataset.sel = outro.dataset.app === id ? '1' : '0';
      tocar('clique');
      acao('selecionar_icone', { alvo: id });
    });

    el.addEventListener('dblclick', () => {
      acao('duplo_clique', { alvo: id });
      abrirApp(id);
    });

    el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') abrirApp(id); });

    el.addEventListener('contextmenu', (ev) => {
      ev.preventDefault();
      abrirMenu(ev.clientX, ev.clientY, [
        { rotulo: 'Abrir', ao: () => abrirApp(id) },
        { rotulo: 'Propriedades', ao: () => abrirApp('config') }
      ], id);
    });

    mesa.appendChild(el);
  }

}

function montarInicio() {
  const botao = document.getElementById('p95-inicio');
  const painel = document.getElementById('p95-inicio-painel');
  const campo = painel.querySelector('input');
  const ul = painel.querySelector('ul');

  function listar(filtro = '') {
    ul.innerHTML = '';
    const termo = filtro.trim().toLowerCase();
    for (const [id, app] of Object.entries(APPS)) {
      if (termo && !app.nome.toLowerCase().includes(termo)) continue;
      const li = document.createElement('li');
      li.innerHTML = (ICONES95[app.icone] || ICONES95.executavel) + '<span>' + app.nome + '</span>';
      li.addEventListener('click', () => {
        fecharInicio();
        acao('menu_iniciar', { alvo: id });
        abrirApp(id);
      });
      ul.appendChild(li);
    }
    if (!ul.children.length) {
      const li = document.createElement('li');
      li.textContent = 'Nada encontrado com esse nome.';
      ul.appendChild(li);
    }
  }

  function abrirInicio() {
    painel.dataset.aberto = '1';
    botao.dataset.aberto = '1';
    campo.value = '';
    listar();
    campo.focus();
    tocar('abrir');
    acao('abrir_menu_iniciar', {});
  }
  function fecharInicio() {
    painel.dataset.aberto = '0';
    botao.dataset.aberto = '0';
  }

  botao.onclick = (ev) => {
    ev.stopPropagation();
    painel.dataset.aberto === '1' ? fecharInicio() : abrirInicio();
  };
  campo.oninput = () => listar(campo.value);
  if (!montarInicio.ligado) {
    montarInicio.ligado = true;
    document.addEventListener('mousedown', (ev) => {
      const pn = document.getElementById('p95-inicio-painel');
      const bt = document.getElementById('p95-inicio');
      if (pn.dataset.aberto === '1' && !pn.contains(ev.target) && !bt.contains(ev.target)) {
        pn.dataset.aberto = '0';
        bt.dataset.aberto = '0';
      }
    });
  }
  listar();
}

function relogio() {
  const el = document.getElementById('p95-relogio');
  let minutos = RELOGIO_BASE.min;
  const pinta = () => {
    el.textContent = `31/02/3026  ${RELOGIO_BASE.hora}:${String(minutos).padStart(2, '0')}`;
  };
  pinta();
  clearInterval(relogio.timer);
  relogio.timer = setInterval(() => { minutos = (minutos + 1) % 60; pinta(); }, 60000);
}

function menuDaMesa() {
  const mesa = document.getElementById('p95-mesa');
  mesa.addEventListener('contextmenu', (ev) => {
    if (ev.target.closest('.p95-icone')) return;
    ev.preventDefault();
    abrirMenu(ev.clientX, ev.clientY, [
      { rotulo: 'Atualizar area de trabalho', ao: () => tocar('clique') },
      { rotulo: 'Abrir terminal aqui', ao: () => abrirApp('terminal') },
      'sep',
      { rotulo: 'Propriedades de video', ao: () => abrirApp('config') }
    ], 'mesa');
  });
}

export function prepararP95() {
  instalarMenuContexto();
  menuDaMesa();
  document.getElementById('p95').dataset.estado = 'ligado';
}

export function atualizarIconeLixeira() {
  const el = document.querySelector('.p95-icone[data-app="lixeira"] svg');
  if (!el) return;
  const novo = vfs.lixeiraCheia() ? ICONES95.lixeiraCheia : ICONES95.lixeiraVazia;
  el.outerHTML = novo;
}
