/* Sons gerados no navegador com Web Audio. Nenhum arquivo de audio:
   o PWA continua funcionando offline e o repositorio fica leve. */

import { ajustes } from './settings.js';

let ctx = null;

function contexto() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/* Safari so libera audio depois de um gesto do usuario. */
export function destravarAudio() {
  const c = contexto();
  if (c && c.state === 'suspended') c.resume();
}

function tom(freq, inicio, duracao, volume = 0.16, forma = 'square') {
  const c = contexto();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = forma;
  osc.frequency.setValueAtTime(freq, c.currentTime + inicio);
  g.gain.setValueAtTime(0, c.currentTime + inicio);
  g.gain.linearRampToValueAtTime(volume, c.currentTime + inicio + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + inicio + duracao);
  osc.connect(g).connect(c.destination);
  osc.start(c.currentTime + inicio);
  osc.stop(c.currentTime + inicio + duracao + 0.02);
}

const RECEITAS = {
  clique:    [[880, 0, 0.03, 0.07]],
  passo:     [[660, 0, 0.06], [990, 0.06, 0.09]],
  sucesso:   [[523, 0, 0.08], [659, 0.08, 0.08], [784, 0.16, 0.16]],
  falha:     [[220, 0, 0.14], [160, 0.13, 0.22]],
  alerta:    [[740, 0, 0.09], [0, 0.09, 0], [740, 0.16, 0.09]],
  boot:      [[196, 0, 0.1], [392, 0.1, 0.1], [587, 0.2, 0.24]],
  abrir:     [[520, 0, 0.04, 0.09]],
  fechar:    [[380, 0, 0.05, 0.09]],
  lixo:      [[300, 0, 0.05], [200, 0.05, 0.05], [130, 0.1, 0.14]],
  tempo:     [[440, 0, 0.05, 0.1]],
  digitar:   [[1200, 0, 0.012, 0.035]]
};

export function tocar(nome) {
  if (!ajustes.som) return;
  const receita = RECEITAS[nome];
  if (!receita) return;
  for (const [f, i, d, v] of receita) {
    if (f > 0) tom(f, i, d, v ?? 0.14);
  }
}

/* ---------- voz do GabuTRON (so quando o aluno pede) ---------- */

let vozPtbr = null;

function escolherVoz() {
  if (!window.speechSynthesis) return null;
  const vozes = window.speechSynthesis.getVoices();
  if (!vozes.length) return null;
  return vozes.find(v => /pt[-_]BR/i.test(v.lang))
      || vozes.find(v => /^pt/i.test(v.lang))
      || null;
}

if (window.speechSynthesis) {
  window.speechSynthesis.addEventListener('voiceschanged', () => { vozPtbr = escolherVoz(); });
}

export function temVoz() {
  return !!window.speechSynthesis;
}

export function falar(texto) {
  if (!temVoz()) return false;
  window.speechSynthesis.cancel();
  const fala = new SpeechSynthesisUtterance(texto);
  if (!vozPtbr) vozPtbr = escolherVoz();
  if (vozPtbr) fala.voice = vozPtbr;
  fala.lang = vozPtbr ? vozPtbr.lang : 'pt-BR';
  fala.rate = 1.02;
  fala.pitch = 0.82;
  window.speechSynthesis.speak(fala);
  return true;
}

export function calarVoz() {
  if (temVoz()) window.speechSynthesis.cancel();
}
