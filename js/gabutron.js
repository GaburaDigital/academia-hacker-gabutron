/* GabuTRON - a IA que treina o cadete.
   Rosto em ASCII pequeno, fala com efeito de digitacao e voz so quando pedida. */

import { tocar, falar, calarVoz, temVoz } from './sound.js';
import { ajustes } from './settings.js';

const OLHOS = {
  neutro: '[o]', falando: '[-]', feliz: '[^]',
  alerta: '[!]', erro: '[x]', pensando: '[?]'
};
const BOCA = {
  neutro: '--------', falando: '========', feliz: '\\______/',
  alerta: '~~~~~~~~', erro: 'xxxxxxxx', pensando: '..~..~..'
};

let humorAtual = 'neutro';
let piscando = null;
let digitando = null;
let textoAtual = '';

function rosto() { return document.getElementById('rosto-ia'); }

function desenharRosto(humor = humorAtual, olhoAlt = null) {
  const el = rosto();
  if (!el) return;
  const o = olhoAlt || OLHOS[humor] || OLHOS.neutro;
  const b = BOCA[humor] || BOCA.neutro;
  el.querySelector('pre').textContent =
`   .------------------.
  /  .--------------.  \\
 |  |  ${o}      ${o}  |  |
 |  |                |  |
 |  |    ${b}    |  |
  \\  '--------------'  /
   '--[============]--'
      G A B U T R O N`;
}

export function humor(novo) {
  humorAtual = novo;
  const el = rosto();
  if (el) el.dataset.humor = (novo === 'erro' || novo === 'alerta') ? novo : 'normal';
  desenharRosto(novo);
}

export function iniciarRosto() {
  desenharRosto('neutro');
  clearInterval(piscando);
  piscando = setInterval(() => {
    if (digitando) return;
    desenharRosto(humorAtual, '[-]');
    setTimeout(() => desenharRosto(humorAtual), 140);
  }, 5200);
}

/* ---------- fala ---------- */

export function dizer(texto, humorFala = 'falando', aoTerminar = null) {
  const alvo = document.getElementById('fala-texto');
  if (!alvo) return;
  textoAtual = texto;
  calarVoz();
  clearInterval(digitando);
  humor(humorFala);
  rosto().dataset.humor = 'falando';

  alvo.textContent = '';
  let i = 0;
  const passo = Math.max(1, Math.round(texto.length / 260));
  digitando = setInterval(() => {
    i += passo;
    alvo.textContent = texto.slice(0, i);
    if (i % 9 === 0) tocar('digitar');
    if (i >= texto.length) {
      clearInterval(digitando);
      digitando = null;
      alvo.textContent = texto;
      humor(humorFala === 'falando' ? 'neutro' : humorFala);
      aoTerminar?.();
    }
  }, 16);

  if (ajustes.voz) falar(texto);
}

export function completarFala() {
  if (!digitando) return false;
  clearInterval(digitando);
  digitando = null;
  document.getElementById('fala-texto').textContent = textoAtual;
  humor('neutro');
  return true;
}

export function falaAtual() { return textoAtual; }

export function ouvirFala() {
  if (!temVoz()) {
    dizer('Meu sintetizador de voz nao esta disponivel neste computador, cadete. Leia pela tela mesmo.', 'alerta');
    return false;
  }
  falar(textoAtual);
  return true;
}
