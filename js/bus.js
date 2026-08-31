/* Barramento de eventos.
   Todo app do Pinguim 95x publica aqui o que o aluno fez.
   O verificador de missoes so escuta. Ninguem chama ninguem diretamente. */

const ouvintes = new Map();

export const bus = {
  on(evento, fn) {
    if (!ouvintes.has(evento)) ouvintes.set(evento, new Set());
    ouvintes.get(evento).add(fn);
    return () => ouvintes.get(evento).delete(fn);
  },

  emit(evento, dados = {}) {
    const lista = ouvintes.get(evento);
    if (lista) for (const fn of [...lista]) {
      try { fn(dados); } catch (e) { console.error('[bus]', evento, e); }
    }
  }
};

/* Atalho usado pelos apps: registra uma acao do aluno.
   acao  = verbo do vocabulario (renomear, mover, comando_terminal, ...)
   dados = campos que a missao pode exigir (caminho, destino, para, ...) */
export function acao(acao, dados = {}) {
  bus.emit('acao', { acao, ...dados });
}
