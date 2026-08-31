/* Interrupcoes.
   De tempos em tempos aparece uma janela intrometida no Pinguim 95x: propaganda,
   falso alerta de virus, pedido de senha. Fechar corretamente da pontos.
   Clicar na isca nao castiga, so ensina, porque o objetivo e criar o reflexo
   de ler antes de clicar. */

import { acao } from '../bus.js';
import { dialogo } from '../wm.js';
import { ICONES95 } from '../icons.js';
import { tocar } from '../sound.js';

const MODELOS = [
  {
    tipo: 'propaganda',
    titulo: 'OFERTA IMPERDIVEL DA GALAXIA',
    texto: 'PENDRIVE DE 900 TERABYTES <b>GRATIS</b> para o cadete numero 1.000.000!<br>' +
           'Clique agora, restam 3 segundos ha 4 horas.',
    isca: 'QUERO O PENDRIVE',
    licao: 'Premio que aparece do nada e sempre isca. Ninguem sorteia pendrive para desconhecido.'
  },
  {
    tipo: 'virus_falso',
    titulo: 'ANTIVIRUS BOREAL PRO 3026',
    texto: 'Detectamos <b>47 virus</b> na sua nave. Instale agora o Boreal Pro para limpar tudo!<br>' +
           'Sua nave pode explodir em 30 segundos.',
    isca: 'LIMPAR AGORA',
    licao: 'Nenhum programa de verdade conta virus com urgencia e som de alarme. Isso e propaganda disfarcada.'
  },
  {
    tipo: 'senha',
    titulo: 'Verificacao de seguranca da frota',
    texto: 'Para continuar, confirme sua <b>senha de bordo</b> nesta janela.<br>' +
           'Setor de Seguranca da Fr0ta Estelar.',
    isca: 'DIGITAR MINHA SENHA',
    licao: 'Sistema legitimo nao pede senha em janela que apareceu sozinha. E repare no zero no lugar do O.'
  },
  {
    tipo: 'atualizacao',
    titulo: 'Atualizacao urgente do Pinguim',
    texto: 'Seu Pinguim 95x esta <b>desatualizado ha 900 anos</b>.<br>' +
           'Baixe o pacote de um site que nao vamos identificar.',
    isca: 'BAIXAR DAQUELE SITE',
    licao: 'Atualizacao de verdade vem pelas Configuracoes do Sistema, nao por janela pop-up.'
  }
];

let timer = null;
let aberta = null;

export function pararInterrupcoes() {
  clearInterval(timer);
  timer = null;
  aberta?.remove();
  aberta = null;
}

export function iniciarInterrupcoes(intervaloSegundos = 105) {
  pararInterrupcoes();
  timer = setInterval(() => {
    if (!aberta && Math.random() < 0.65) mostrar();
  }, intervaloSegundos * 1000);
}

export function mostrar(modelo = null) {
  const area = document.getElementById('p95');
  if (!area || aberta) return;
  const m = modelo || MODELOS[Math.floor(Math.random() * MODELOS.length)];

  const cx = document.createElement('div');
  cx.className = 'p95-dialogo p95-popup';
  cx.style.zIndex = 900;
  cx.innerHTML = `
    <div class="p95-barra">${ICONES95.aviso}<span>${m.titulo}</span>
      <button class="p95-btn-barra" data-fechar aria-label="Fechar">X</button></div>
    <div class="conteudo">${ICONES95.aviso}<div>${m.texto}</div></div>
    <div class="acoes">
      <button class="p95-btn" data-isca>${m.isca}</button>
      <button class="p95-btn" data-fechar>Fechar</button>
    </div>`;

  const caixa = area.getBoundingClientRect();
  cx.style.transform = 'none';
  area.appendChild(cx);
  cx.style.left = Math.max(0, Math.round((caixa.width - cx.offsetWidth) / 2)) + 'px';
  cx.style.top = Math.max(0, Math.round(caixa.height * 0.22)) + 'px';

  aberta = cx;
  tocar('alerta');
  acao('popup_apareceu', { tipo: m.tipo });

  const encerrar = () => { cx.remove(); aberta = null; };

  for (const b of cx.querySelectorAll('[data-fechar]')) {
    b.addEventListener('click', () => {
      encerrar();
      tocar('passo');
      acao('fechar_popup', { tipo: m.tipo, correto: true });
    });
  }

  cx.querySelector('[data-isca]').addEventListener('click', async () => {
    encerrar();
    tocar('falha');
    acao('cair_no_golpe', { tipo: m.tipo });
    await dialogo({
      titulo: 'Isso era isca', icone: 'aviso',
      texto: m.licao + '<br><br>Nada aconteceu com a sua nave. Foi so treino.'
    });
  });
}
