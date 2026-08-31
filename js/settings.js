/* Preferencias do aluno. Progresso NAO e salvo de proposito:
   varios alunos usam a mesma maquina. Aqui ficam so os ajustes. */

const CHAVE = 'gabutron.ajustes.v1';

const PADRAO = {
  som: true,
  voz: false,
  crt: true,
  tema: 'escuro',
  minutos: 25,
  tempoInfinito: false,
  dificuldade: 'facil',
  trilha: 'geral',
  codinome: ''
};

export const ajustes = { ...PADRAO };

export function carregarAjustes() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) Object.assign(ajustes, JSON.parse(bruto));
  } catch (e) {
    console.warn('Nao foi possivel ler as preferencias.', e);
  }
  aplicarAjustes();
  return ajustes;
}

export function salvarAjustes(parcial = {}) {
  Object.assign(ajustes, parcial);
  try {
    localStorage.setItem(CHAVE, JSON.stringify(ajustes));
  } catch (e) {
    console.warn('Nao foi possivel salvar as preferencias.', e);
    return false;
  }
  aplicarAjustes();
  return true;
}

export function limparCache() {
  try {
    localStorage.removeItem(CHAVE);
    localStorage.removeItem('gabutron.placar.v1');
  } catch (e) { /* modo privado */ }
  if ('caches' in window) {
    caches.keys().then(nomes => nomes.forEach(n => caches.delete(n)));
  }
  Object.assign(ajustes, PADRAO);
  aplicarAjustes();
}

export function aplicarAjustes() {
  document.body.dataset.tema = ajustes.tema;
  document.body.dataset.crt = ajustes.crt ? '1' : '0';
}
