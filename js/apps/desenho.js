/* Pinguim Pincel - editor de desenho.
   Treina arrastar com o botao esquerdo pressionado, escolher ferramenta e salvar
   um arquivo novo com nome dado pelo aluno. */

import * as vfs from '../vfs.js';
import { acao } from '../bus.js';
import { criarJanela, dialogo, dialogoEntrada } from '../wm.js';
import { tocar } from '../sound.js';

const CORES = ['#000000', '#ffffff', '#c0202a', '#1d6b6b', '#0a2a6b',
               '#2f9e5b', '#f0c419', '#b07a3c', '#9aa0a8', '#7a2f8a'];

export function abrirDesenho() {
  const jan = criarJanela({
    app: 'desenho', titulo: 'Pinguim Pincel', icone: 'desenho',
    largura: 460, altura: 340, corpoFace: true,
    menu: '<button data-fita="limpar">Limpar tela</button><button data-fita="salvar">Salvar como</button>'
  });
  if (jan.jaExistia) return jan;

  jan.corpo.innerHTML = `
    <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;flex-wrap:wrap">
      <span style="font-size:11px">Cor</span>
      <div data-paleta style="display:flex;gap:2px"></div>
      <span style="font-size:11px;margin-left:8px">Espessura</span>
      <input type="range" data-espessura min="1" max="18" value="4" style="width:90px">
    </div>
    <canvas class="p95-tela-desenho" width="420" height="220"
      style="background:#ffffff;border:2px solid;border-color:#40444a #ffffff #ffffff #40444a;max-width:100%"></canvas>
    <p style="font-size:11px;margin:6px 0 0;color:#4a4f56">
      Segure o botao esquerdo do mouse e arraste para desenhar.</p>`;

  const tela = jan.corpo.querySelector('canvas');
  const ctx = tela.getContext ? tela.getContext('2d') : null;
  let cor = '#000000';
  let espessura = 4;
  let pintando = false;
  let jaDesenhou = false;

  const paleta = jan.corpo.querySelector('[data-paleta]');
  for (const c of CORES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.style.cssText = `width:17px;height:17px;background:${c};border:2px solid;` +
      'border-color:#ffffff #40444a #40444a #ffffff;padding:0';
    b.title = 'Cor ' + c;
    b.addEventListener('click', () => { cor = c; tocar('clique'); });
    paleta.appendChild(b);
  }
  jan.corpo.querySelector('[data-espessura]').addEventListener('input', (e) => {
    espessura = Number(e.target.value);
  });

  function ponto(ev) {
    const r = tela.getBoundingClientRect();
    return {
      x: (ev.clientX - r.left) * (tela.width / r.width),
      y: (ev.clientY - r.top) * (tela.height / r.height)
    };
  }

  tela.addEventListener('mousedown', (ev) => {
    if (!ctx) return;
    pintando = true;
    const p = ponto(ev);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  });
  tela.addEventListener('mousemove', (ev) => {
    if (!pintando || !ctx) return;
    const p = ponto(ev);
    ctx.strokeStyle = cor;
    ctx.lineWidth = espessura;
    ctx.lineCap = 'round';
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    if (!jaDesenhou) { jaDesenhou = true; acao('desenhar', {}); }
  });
  document.addEventListener('mouseup', () => { pintando = false; });

  jan.fita.addEventListener('click', async (ev) => {
    const f = ev.target.dataset.fita;
    if (f === 'limpar' && ctx) {
      ctx.clearRect(0, 0, tela.width, tela.height);
      tocar('clique');
    }
    if (f === 'salvar') {
      const nome = await dialogoEntrada({
        titulo: 'Salvar como', texto: 'Nome do arquivo (termine com .png):', valor: 'desenho.png'
      });
      if (!nome) return;
      const limpo = nome.endsWith('.png') ? nome : nome + '.png';
      vfs.criarArquivo('/lar/cadete/imagens', limpo, '(desenho feito pelo cadete)', 'imagem');
      acao('salvar_desenho', { nome: limpo, caminho: '/lar/cadete/imagens' });
      tocar('sucesso');
      await dialogo({ titulo: 'Salvo', icone: 'info',
        texto: 'Arquivo gravado em /lar/cadete/imagens/' + limpo });
    }
  });

  jan.definirStatus('Escolha a cor, segure o botao esquerdo e arraste.');
  return jan;
}
