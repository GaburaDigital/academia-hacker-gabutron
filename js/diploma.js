/* Diploma da Academia.
   Gera um certificado em SVG com o codinome, a patente e os numeros da sessao.
   Fica dentro de um modal com regra de impressao propria: ao mandar imprimir,
   so o diploma vai para o papel. */

import { sessao, patenteDe } from './score.js';
import { ajustes } from './settings.js';

function escapar(txt) {
  return String(txt).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
}

export function gerarDiploma() {
  const nome = escapar(ajustes.codinome || 'Cadete Anonimo');
  const patente = patenteDe(sessao.pontos).nome;
  const data = new Date().toLocaleDateString('pt-BR');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 600" width="100%"
     role="img" aria-label="Diploma da Academia Hacker GabuTRON">
  <rect width="840" height="600" fill="#000000"/>
  <rect x="14" y="14" width="812" height="572" fill="none" stroke="#35e07a" stroke-width="2"/>
  <rect x="26" y="26" width="788" height="548" fill="none" stroke="#9aa3ad" stroke-width="1"/>

  <g stroke="#35e07a" stroke-width="2" fill="none">
    <path d="M26 62 L62 62 L62 26"/><path d="M814 62 L778 62 L778 26"/>
    <path d="M26 538 L62 538 L62 574"/><path d="M814 538 L778 538 L778 574"/>
  </g>

  <g transform="translate(420 108)">
    <g transform="translate(-16 -18) scale(1.1)">
      <rect x="2" y="4" width="28" height="20" rx="2" fill="#9aa3ad" stroke="#3f464d" stroke-width="1.2"/>
      <rect x="5" y="6.8" width="22" height="14.4" fill="#0b120d"/>
      <rect x="7.5" y="9.4" width="8" height="1.6" fill="#35e07a"/>
      <rect x="7.5" y="12.6" width="5" height="1.6" fill="#35e07a"/>
      <rect x="13" y="24" width="6" height="3" fill="#78818b"/>
      <rect x="8" y="26.6" width="16" height="2.6" rx="1" fill="#8f98a2"/>
      <path d="M16.4 9.6 L16.4 20.2 L18.9 17.9 L20.6 21.4 L22.2 20.6 L20.6 17.2 L23.4 17 Z"
            fill="#f4f6f7" stroke="#171b1f" stroke-width="1.1" stroke-linejoin="round"/>
    </g>
  </g>

  <text x="420" y="176" text-anchor="middle" fill="#35e07a"
        font-family="monospace" font-size="15" letter-spacing="7">ACADEMIA HACKER GABUTRON</text>
  <text x="420" y="200" text-anchor="middle" fill="#8d968d"
        font-family="monospace" font-size="11" letter-spacing="3">FROTA ESTELAR - SETOR DE TREINAMENTO</text>

  <line x1="240" y1="222" x2="600" y2="222" stroke="#3a423c" stroke-width="1"/>

  <text x="420" y="266" text-anchor="middle" fill="#e6ebe6"
        font-family="monospace" font-size="13">certifica que o cadete</text>
  <text x="420" y="318" text-anchor="middle" fill="#35e07a"
        font-family="monospace" font-size="34" letter-spacing="2">${nome}</text>
  <line x1="180" y1="336" x2="660" y2="336" stroke="#3a423c" stroke-width="1"/>

  <text x="420" y="374" text-anchor="middle" fill="#e6ebe6" font-family="monospace" font-size="12.5">
    concluiu o treinamento de operacao de computador e alcancou a patente de
  </text>
  <text x="420" y="408" text-anchor="middle" fill="#e6ebe6"
        font-family="monospace" font-size="21" letter-spacing="3">${patente}</text>

  <g font-family="monospace" font-size="12" fill="#8d968d" text-anchor="middle">
    <text x="230" y="470">PONTOS</text>
    <text x="420" y="470">MISSOES CONCLUIDAS</text>
    <text x="610" y="470">ACOES NO SISTEMA</text>
  </g>
  <g font-family="monospace" font-size="24" fill="#35e07a" text-anchor="middle">
    <text x="230" y="500">${sessao.pontos}</text>
    <text x="420" y="500">${sessao.concluidas}</text>
    <text x="610" y="500">${sessao.acoes}</text>
  </g>

  <line x1="140" y1="530" x2="700" y2="530" stroke="#3a423c" stroke-width="1"/>
  <text x="140" y="552" fill="#8d968d" font-family="monospace" font-size="10.5">${data}</text>
  <text x="700" y="552" text-anchor="end" fill="#8d968d" font-family="monospace" font-size="10.5">
    GabuTRON, IA instrutora
  </text>
  <text x="420" y="570" text-anchor="middle" fill="#3a423c" font-family="monospace" font-size="9"
        letter-spacing="2">GABURA - ESTUDE, APRENDA E COMPARTILHE</text>
</svg>`;
}

export function abrirDiploma() {
  const modal = document.getElementById('modal-diploma');
  document.getElementById('diploma-arte').innerHTML = gerarDiploma();
  modal.dataset.aberto = '1';
}
