/* Sistema de arquivos virtual.
   Fonte unica de verdade: o explorador, o terminal, o email e a lixeira
   leem e escrevem aqui. Se o aluno digita "ls", ele ve o mesmo que na janela. */

import { bus, acao } from './bus.js';

let raiz = null;

function novoNo(dados) {
  return {
    nome: dados.nome,
    tipo: dados.tipo || 'arquivo',
    icone: dados.icone || (dados.tipo === 'pasta' ? 'pasta' : 'arquivo'),
    conteudo: dados.conteudo || '',
    protegido: !!dados.protegido,
    origem: dados.origem || null,
    filhos: (dados.filhos || []).map(novoNo)
  };
}

export function montar(arvore) {
  raiz = novoNo({ nome: '', tipo: 'pasta', filhos: arvore });
  if (!no('/lixeira')) raiz.filhos.push(novoNo({ nome: 'lixeira', tipo: 'pasta' }));
  bus.emit('vfs:mudou', { caminho: '/' });
}

export function normalizar(caminho) {
  const partes = String(caminho || '/').split('/').filter(Boolean);
  const pilha = [];
  for (const p of partes) {
    if (p === '.') continue;
    if (p === '..') pilha.pop();
    else pilha.push(p);
  }
  return '/' + pilha.join('/');
}

export function no(caminho) {
  if (!raiz) return null;
  const partes = normalizar(caminho).split('/').filter(Boolean);
  let atual = raiz;
  for (const p of partes) {
    if (atual.tipo !== 'pasta') return null;
    atual = atual.filhos.find(f => f.nome.toLowerCase() === p.toLowerCase());
    if (!atual) return null;
  }
  return atual;
}

export function existe(caminho) { return !!no(caminho); }

export function caminhoPai(caminho) {
  const c = normalizar(caminho);
  const i = c.lastIndexOf('/');
  return i <= 0 ? '/' : c.slice(0, i);
}

export function nomeDe(caminho) {
  return normalizar(caminho).split('/').filter(Boolean).pop() || '';
}

export function listar(caminho) {
  const alvo = no(caminho);
  if (!alvo || alvo.tipo !== 'pasta') return [];
  return [...alvo.filhos].sort((a, b) => {
    if (a.tipo !== b.tipo) return a.tipo === 'pasta' ? -1 : 1;
    return a.nome.localeCompare(b.nome, 'pt-BR');
  });
}

function mudou(caminho) { bus.emit('vfs:mudou', { caminho }); }

function nomeLivre(pasta, nome) {
  if (!pasta.filhos.some(f => f.nome.toLowerCase() === nome.toLowerCase())) return nome;
  const ponto = nome.lastIndexOf('.');
  const base = ponto > 0 ? nome.slice(0, ponto) : nome;
  const ext = ponto > 0 ? nome.slice(ponto) : '';
  let n = 2;
  while (pasta.filhos.some(f => f.nome.toLowerCase() === `${base} (${n})${ext}`.toLowerCase())) n++;
  return `${base} (${n})${ext}`;
}

/* ---------- operacoes ---------- */

export function criarPasta(caminhoPasta, nome) {
  const pasta = no(caminhoPasta);
  if (!pasta || pasta.tipo !== 'pasta') return null;
  const item = novoNo({ nome: nomeLivre(pasta, nome), tipo: 'pasta' });
  pasta.filhos.push(item);
  mudou(caminhoPasta);
  acao('criar_pasta', { caminho: normalizar(caminhoPasta), nome: item.nome });
  return item;
}

export function criarArquivo(caminhoPasta, nome, conteudo = '', icone = 'arquivo') {
  const pasta = no(caminhoPasta);
  if (!pasta || pasta.tipo !== 'pasta') return null;
  const item = novoNo({ nome: nomeLivre(pasta, nome), tipo: 'arquivo', conteudo, icone });
  pasta.filhos.push(item);
  mudou(caminhoPasta);
  acao('criar_arquivo', { caminho: normalizar(caminhoPasta), nome: item.nome });
  return item;
}

export function renomear(caminho, novoNome) {
  const alvo = no(caminho);
  if (!alvo || alvo.protegido) return false;
  const nomeAntigo = alvo.nome;
  const pasta = no(caminhoPai(caminho));
  alvo.nome = nomeLivre(pasta, novoNome);
  mudou(caminhoPai(caminho));
  acao('renomear', {
    caminho: normalizar(caminho),
    nome: nomeAntigo,
    para: alvo.nome,
    pasta: normalizar(caminhoPai(caminho))
  });
  return true;
}

export function mover(caminho, destinoPasta) {
  const alvo = no(caminho);
  const destino = no(destinoPasta);
  if (!alvo || alvo.protegido || !destino || destino.tipo !== 'pasta') return false;
  if (normalizar(destinoPasta).startsWith(normalizar(caminho) + '/')) return false;
  const pasta = no(caminhoPai(caminho));
  pasta.filhos = pasta.filhos.filter(f => f !== alvo);
  alvo.nome = nomeLivre(destino, alvo.nome);
  destino.filhos.push(alvo);
  mudou(destinoPasta);
  acao('mover', {
    caminho: normalizar(caminho),
    nome: alvo.nome,
    destino: normalizar(destinoPasta)
  });
  return true;
}

export function copiar(caminho, destinoPasta) {
  const alvo = no(caminho);
  const destino = no(destinoPasta);
  if (!alvo || !destino || destino.tipo !== 'pasta') return false;
  const copia = novoNo(JSON.parse(JSON.stringify(alvo)));
  copia.nome = nomeLivre(destino, copia.nome);
  destino.filhos.push(copia);
  mudou(destinoPasta);
  acao('colar', {
    caminho: normalizar(caminho),
    nome: copia.nome,
    destino: normalizar(destinoPasta)
  });
  return true;
}

export function excluir(caminho) {
  const alvo = no(caminho);
  if (!alvo || alvo.protegido) return false;
  const pasta = no(caminhoPai(caminho));
  pasta.filhos = pasta.filhos.filter(f => f !== alvo);
  alvo.origem = normalizar(caminhoPai(caminho));
  const lixeira = no('/lixeira');
  alvo.nome = nomeLivre(lixeira, alvo.nome);
  lixeira.filhos.push(alvo);
  mudou('/lixeira');
  acao('excluir', { caminho: normalizar(caminho), nome: alvo.nome });
  return true;
}

export function restaurar(nome) {
  const lixeira = no('/lixeira');
  const alvo = lixeira.filhos.find(f => f.nome.toLowerCase() === String(nome).toLowerCase());
  if (!alvo) return false;
  const destino = no(alvo.origem) || no('/lar/cadete');
  lixeira.filhos = lixeira.filhos.filter(f => f !== alvo);
  alvo.nome = nomeLivre(destino, alvo.nome);
  destino.filhos.push(alvo);
  mudou('/lixeira');
  acao('restaurar', { nome: alvo.nome, destino: alvo.origem });
  return true;
}

export function esvaziarLixeira() {
  const lixeira = no('/lixeira');
  const quantos = lixeira.filhos.length;
  lixeira.filhos = [];
  mudou('/lixeira');
  acao('esvaziar_lixeira', { quantidade: quantos });
  return quantos;
}

export function lixeiraCheia() {
  const l = no('/lixeira');
  return !!l && l.filhos.length > 0;
}

/* ---------- area de transferencia ---------- */

export const transferencia = { caminho: null, modo: null };

export function copiarParaArea(caminho, modo = 'copiar') {
  transferencia.caminho = normalizar(caminho);
  transferencia.modo = modo;
  acao(modo === 'recortar' ? 'recortar' : 'copiar', { caminho: transferencia.caminho, nome: nomeDe(caminho) });
}

export function colarDaArea(destinoPasta) {
  if (!transferencia.caminho) return false;
  const ok = transferencia.modo === 'recortar'
    ? mover(transferencia.caminho, destinoPasta)
    : copiar(transferencia.caminho, destinoPasta);
  if (ok && transferencia.modo === 'recortar') { transferencia.caminho = null; transferencia.modo = null; }
  return ok;
}


/* Procura um item em qualquer lugar da arvore, inclusive na lixeira.
   Usado pelo motor de missoes para descobrir se um arquivo necessario
   deixou de existir e a missao virou impossivel. */
export function procurar(padrao) {
  if (!raiz || !padrao) return null;
  const alvo = String(padrao).toLowerCase();
  const contem = alvo.startsWith('contem:') ? alvo.slice(7) : null;
  const caminhoDireto = alvo.startsWith('/');

  let achado = null;
  (function varrer(no, caminho) {
    if (achado) return;
    for (const filho of no.filhos || []) {
      const c = caminho + '/' + filho.nome;
      const nome = filho.nome.toLowerCase();
      if (caminhoDireto ? c.toLowerCase() === alvo
                        : contem ? nome.includes(contem) : nome === alvo) {
        achado = { no: filho, caminho: c };
        return;
      }
      if (filho.tipo === 'pasta') varrer(filho, c);
    }
  })(raiz, '');
  return achado;
}
