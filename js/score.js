/* Pontuacao da sessao e Placar da Maquina.
   O progresso das missoes nao e salvo: varios alunos usam o mesmo computador.
   Só o placar fica guardado, e o professor pode zerar com um botao. */

const CHAVE = 'gabutron.placar.v1';

export const sessao = {
  pontos: 0,
  concluidas: 0,
  puladas: 0,
  acoes: 0
};

export function zerarSessao() {
  sessao.pontos = 0;
  sessao.concluidas = 0;
  sessao.puladas = 0;
  sessao.acoes = 0;
  pintarPontos();
}

export function somarPontos(n) {
  sessao.pontos += Math.max(0, Math.round(n));
  pintarPontos();
  return sessao.pontos;
}

export function pintarPontos() {
  const el = document.getElementById('leitura-pontos');
  if (el) el.innerHTML = 'PONTOS <b>' + sessao.pontos + '</b>';
  const m = document.getElementById('leitura-missoes');
  if (m) m.innerHTML = 'MISSOES <b>' + sessao.concluidas + '</b>';
}

/* pontos = base da missao + bonus por rapidez (so quando ha cronometro) */
export function calcularPontos(missao, segundosGastos, temCronometro) {
  const base = missao.pontos_base || (missao.passos.length * 10);
  if (!temCronometro) return base;
  const alvo = missao.passos.length * 22;
  const bonus = segundosGastos <= alvo ? Math.round(base * 0.5 * (1 - segundosGastos / (alvo * 2))) : 0;
  return base + Math.max(0, bonus);
}

/* ---------- placar ---------- */

export function lerPlacar() {
  try { return JSON.parse(localStorage.getItem(CHAVE) || '[]'); }
  catch (e) { return []; }
}

export function gravarPlacar(codinome, pontos) {
  if (!codinome || pontos <= 0) return lerPlacar();
  const lista = lerPlacar();
  lista.push({ codinome: String(codinome).slice(0, 18), pontos });
  lista.sort((a, b) => b.pontos - a.pontos);
  const top = lista.slice(0, 5);
  try { localStorage.setItem(CHAVE, JSON.stringify(top)); } catch (e) { /* modo privado */ }
  return top;
}

export function zerarPlacar() {
  try { localStorage.removeItem(CHAVE); } catch (e) { /* modo privado */ }
  return [];
}
