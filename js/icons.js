/* Dois conjuntos de icones propositalmente diferentes.
   ICONES   -> casca do site: traco fino, cinza com detalhe claro/verde.
   ICONES95 -> Pinguim 95x: chapado, 16 cores, cara de sistema antigo.
   Nenhum emoji em lugar nenhum. */

const C = '#9aa3ad';   /* cinza dominante */
const V = '#35e07a';   /* verde de detalhe */
const B = '#e6ebe6';   /* claro de detalhe */

const linha = (d, extra = '') =>
  `<svg class="icone" viewBox="0 0 24 24" fill="none" stroke="${C}" stroke-width="1.6"
     stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${d}${extra}</svg>`;

export const ICONES = {
  monitor: linha(`<rect x="2" y="4" width="20" height="13"/><path d="M9 21h6M12 17v4"/>
    <path d="M5 8h6M5 11h4" stroke="${V}"/>`),
  engrenagem: linha(`<circle cx="12" cy="12" r="3.2"/>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/>`),
  som: linha(`<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9c1.4 1.6 1.4 4.4 0 6" stroke="${V}"/>`),
  mudo: linha(`<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l4 6M21 9l-4 6" stroke="${V}"/>`),
  troféu: linha(`<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/>
    <path d="M10 14h4v3h-4zM8 20h8" stroke="${V}"/>`),
  ajuda: linha(`<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3 2.5v1.5" stroke="${V}"/>
    <path d="M12 17h.01" stroke="${V}"/>`),
  voz: linha(`<rect x="9" y="3" width="6" height="10" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/>
    <path d="M12 18v3" stroke="${V}"/>`),
  proximo: linha(`<path d="M6 5l8 7-8 7z"/><path d="M17 5v14" stroke="${V}"/>`),
  pular: linha(`<path d="M4 5l7 7-7 7zM12 5l7 7-7 7"/>`),
  sair: linha(`<path d="M14 4H5v16h9"/><path d="M12 12h8M17 8l4 4-4 4" stroke="${V}"/>`),
  repo: linha(`<path d="M4 4h11l5 5v11H4z"/><path d="M15 4v5h5" stroke="${V}"/>
    <path d="M8 13h8M8 16h5" stroke="${V}"/>`),
  relogio: linha(`<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke="${V}"/>`),
  limpar: linha(`<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6" stroke="${V}"/>`),
  salvar: linha(`<path d="M4 4h13l3 3v13H4z"/><path d="M8 4v6h8V4" stroke="${V}"/><path d="M8 20v-6h8v6"/>`),
  desktop: linha(`<rect x="2" y="4" width="20" height="14"/><path d="M8 22h8M12 18v4"/>
    <path d="M6 8l3 3-3 3M11 14h6" stroke="${V}"/>`)
};

/* ---------------- Pinguim 95x ---------------- */

const j = (d) =>
  `<svg viewBox="0 0 32 32" aria-hidden="true" shape-rendering="crispEdges">${d}</svg>`;

const PASTA = `<path d="M2 8h10l2 3h16v17H2z" fill="#f0c419" stroke="#8a6d0b" stroke-width="1.5"/>
  <path d="M4 13h24v13H4z" fill="#ffd94a"/>`;

export const ICONES95 = {
  pasta: j(PASTA),
  pastaAberta: j(`<path d="M2 8h10l2 3h14v6H8L2 28z" fill="#f0c419" stroke="#8a6d0b" stroke-width="1.5"/>
    <path d="M8 17h22l-6 11H2z" fill="#ffd94a" stroke="#8a6d0b" stroke-width="1.5"/>`),
  arquivo: j(`<path d="M6 2h14l6 6v22H6z" fill="#ffffff" stroke="#3a3f45" stroke-width="1.5"/>
    <path d="M20 2v6h6" fill="#c9ccd1" stroke="#3a3f45" stroke-width="1.5"/>
    <path d="M10 13h12M10 17h12M10 21h8" stroke="#5a6069" stroke-width="1.5"/>`),
  imagem: j(`<rect x="3" y="6" width="26" height="20" fill="#ffffff" stroke="#3a3f45" stroke-width="1.5"/>
    <circle cx="11" cy="13" r="3" fill="#f0c419"/>
    <path d="M5 24l7-8 5 5 4-4 6 7z" fill="#2f9e5b"/>`),
  pacote: j(`<path d="M4 10l12-6 12 6v14l-12 6-12-6z" fill="#b07a3c" stroke="#5c3d17" stroke-width="1.5"/>
    <path d="M4 10l12 6 12-6M16 16v14" stroke="#5c3d17" stroke-width="1.5" fill="none"/>`),
  executavel: j(`<rect x="4" y="4" width="24" height="24" fill="#c3c7cb" stroke="#3a3f45" stroke-width="1.5"/>
    <rect x="8" y="8" width="16" height="10" fill="#05070a"/>
    <path d="M10 11l3 2-3 2" stroke="#4ee08a" stroke-width="1.5" fill="none"/>
    <path d="M8 22h16" stroke="#5a6069" stroke-width="2"/>`),
  explorador: j(`${PASTA}<circle cx="22" cy="20" r="6" fill="none" stroke="#0a2a6b" stroke-width="2.5"/>
    <path d="M26 24l5 5" stroke="#0a2a6b" stroke-width="3"/>`),
  terminal: j(`<rect x="2" y="4" width="28" height="24" fill="#05070a" stroke="#3a3f45" stroke-width="1.5"/>
    <path d="M6 11l4 3-4 3" stroke="#4ee08a" stroke-width="2" fill="none"/>
    <path d="M13 19h9" stroke="#4ee08a" stroke-width="2"/>`),
  email: j(`<rect x="2" y="7" width="28" height="19" fill="#ffffff" stroke="#3a3f45" stroke-width="1.5"/>
    <path d="M2 7l14 11L30 7" fill="none" stroke="#0a2a6b" stroke-width="2"/>`),
  navegador: j(`<circle cx="16" cy="16" r="13" fill="#3a7fd5" stroke="#0a2a6b" stroke-width="1.5"/>
    <path d="M3 16h26M16 3c4 4 4 22 0 26M16 3c-4 4-4 22 0 26" fill="none" stroke="#ffffff" stroke-width="1.5"/>`),
  lixeiraVazia: j(`<path d="M8 10h16l-2 19H10z" fill="#c3c7cb" stroke="#3a3f45" stroke-width="1.5"/>
    <path d="M6 7h20v3H6z" fill="#9aa0a8" stroke="#3a3f45" stroke-width="1.5"/>
    <path d="M14 14v11M18 14v11" stroke="#6a7079" stroke-width="1.5"/>`),
  lixeiraCheia: j(`<path d="M8 12h16l-2 17H10z" fill="#c3c7cb" stroke="#3a3f45" stroke-width="1.5"/>
    <path d="M10 5l4 4 5-5 3 6 5-2-2 5H8z" fill="#f0c419" stroke="#8a6d0b" stroke-width="1.5"/>
    <path d="M14 16v10M18 16v10" stroke="#6a7079" stroke-width="1.5"/>`),
  config: j(`<circle cx="16" cy="16" r="6" fill="#c3c7cb" stroke="#3a3f45" stroke-width="1.5"/>
    <path d="M16 2v6M16 24v6M2 16h6M24 16h6M6 6l4 4M22 22l4 4M26 6l-4 4M10 22l-4 4"
      stroke="#5a6069" stroke-width="3"/>`),
  pendrive: j(`<rect x="3" y="12" width="19" height="10" fill="#3a3f45"/>
    <rect x="22" y="14" width="8" height="6" fill="#c3c7cb" stroke="#5a6069" stroke-width="1.2"/>
    <rect x="6" y="15" width="6" height="4" fill="#4ee08a"/>`),
  computador: j(`<rect x="3" y="5" width="26" height="17" fill="#c3c7cb" stroke="#3a3f45" stroke-width="1.5"/>
    <rect x="6" y="8" width="20" height="11" fill="#1d6b6b"/>
    <rect x="10" y="24" width="12" height="4" fill="#9aa0a8" stroke="#3a3f45" stroke-width="1.5"/>`),
  rede: j(`<rect x="11" y="3" width="10" height="7" fill="#c3c7cb" stroke="#3a3f45" stroke-width="1.5"/>
    <rect x="2" y="22" width="10" height="7" fill="#c3c7cb" stroke="#3a3f45" stroke-width="1.5"/>
    <rect x="20" y="22" width="10" height="7" fill="#c3c7cb" stroke="#3a3f45" stroke-width="1.5"/>
    <path d="M16 10v6M7 22v-6h18v6" fill="none" stroke="#2f9e5b" stroke-width="2"/>`),
  desenho: j(`<path d="M4 24l3-8L21 3l6 6L14 22z" fill="#f0c419" stroke="#8a6d0b" stroke-width="1.5"/>
    <path d="M20 4l6 6" stroke="#8a6d0b" stroke-width="1.5"/>
    <path d="M4 24l-2 6 6-2z" fill="#3a3f45"/>`),
  manual: j(`<path d="M4 5h10c1 0 2 1 2 2v21c0-1-1-2-2-2H4z" fill="#ffffff" stroke="#3a3f45" stroke-width="1.5"/>
    <path d="M28 5H18c-1 0-2 1-2 2v21c0-1 1-2 2-2h10z" fill="#e4e7ea" stroke="#3a3f45" stroke-width="1.5"/>
    <path d="M6 10h7M6 14h7M19 10h7M19 14h7" stroke="#5a6069" stroke-width="1.3"/>`),
  pinguim: j(`<ellipse cx="16" cy="19" rx="10" ry="12" fill="#1b1f24"/>
    <ellipse cx="16" cy="21" rx="6.5" ry="9" fill="#ffffff"/>
    <circle cx="12.6" cy="12" r="2" fill="#ffffff"/><circle cx="19.4" cy="12" r="2" fill="#ffffff"/>
    <circle cx="12.8" cy="12.3" r="1" fill="#1b1f24"/><circle cx="19.2" cy="12.3" r="1" fill="#1b1f24"/>
    <path d="M16 14l-3 2.4h6z" fill="#f0a419"/>
    <path d="M9 30l4-3M23 30l-4-3" stroke="#f0a419" stroke-width="3"/>`),
  aviso: j(`<path d="M16 3l14 25H2z" fill="#f0c419" stroke="#8a6d0b" stroke-width="1.5"/>
    <path d="M16 12v8" stroke="#1b1f24" stroke-width="3"/><circle cx="16" cy="24" r="1.7" fill="#1b1f24"/>`),
  info: j(`<circle cx="16" cy="16" r="13" fill="#3a7fd5" stroke="#0a2a6b" stroke-width="1.5"/>
    <circle cx="16" cy="9.5" r="2" fill="#ffffff"/><path d="M16 14v10" stroke="#ffffff" stroke-width="3.4"/>`),
  pergunta: j(`<circle cx="16" cy="16" r="13" fill="#3a7fd5" stroke="#0a2a6b" stroke-width="1.5"/>
    <path d="M12 12a4 4 0 1 1 5 4v3" fill="none" stroke="#ffffff" stroke-width="3"/>
    <circle cx="16.4" cy="24" r="1.9" fill="#ffffff"/>`)
};

export function svg(nome, conjunto = ICONES) {
  return conjunto[nome] || conjunto.arquivo || '';
}
