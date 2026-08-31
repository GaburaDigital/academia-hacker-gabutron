/* Menu de contexto do Pinguim 95x.
   Treinar o botao direito e um dos objetivos da atividade, entao o menu
   nativo do navegador e desligado apenas dentro de #p95. */

import { acao } from './bus.js';
import { tocar } from './sound.js';

let aberto = null;

export function fecharMenu() {
  if (aberto) { aberto.remove(); aberto = null; }
}

/* itens: [{rotulo, ao, desativado}] ou a string 'sep' */
export function abrirMenu(x, y, itens, alvo = '') {
  fecharMenu();
  const area = document.getElementById('p95');
  if (!area) return;

  const menu = document.createElement('div');
  menu.className = 'p95-menu';
  const ul = document.createElement('ul');

  for (const item of itens) {
    if (item === 'sep') { ul.appendChild(document.createElement('hr')); continue; }
    const li = document.createElement('li');
    li.textContent = item.rotulo;
    if (item.desativado) li.dataset.desativado = '1';
    li.addEventListener('click', (ev) => {
      ev.stopPropagation();
      fecharMenu();
      tocar('clique');
      item.ao?.();
    });
    ul.appendChild(li);
  }

  menu.appendChild(ul);
  area.appendChild(menu);

  const caixa = area.getBoundingClientRect();
  const m = menu.getBoundingClientRect();
  let px = x - caixa.left;
  let py = y - caixa.top;
  if (px + m.width > caixa.width) px = caixa.width - m.width - 4;
  if (py + m.height > caixa.height - 34) py = caixa.height - 34 - m.height;
  menu.style.left = Math.max(2, px) + 'px';
  menu.style.top = Math.max(2, py) + 'px';

  aberto = menu;
  tocar('clique');
  acao('menu_contexto', { alvo });
}

export function instalarMenuContexto() {
  const area = document.getElementById('p95');
  if (!area) return;
  area.addEventListener('contextmenu', (ev) => ev.preventDefault());
  document.addEventListener('mousedown', (ev) => {
    if (aberto && !aberto.contains(ev.target)) fecharMenu();
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') fecharMenu();
  });
}
