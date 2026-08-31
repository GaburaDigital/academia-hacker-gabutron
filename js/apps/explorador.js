/* Explorador de Arquivos do Pinguim 95x.
   Concentra o treino de mouse: clique simples, clique duplo, botao direito,
   passar o mouse para ver a etiqueta, selecao multipla e atalhos de teclado. */

import * as vfs from '../vfs.js';
import { bus, acao } from '../bus.js';
import { criarJanela, dialogo, dialogoEntrada } from '../wm.js';
import { abrirMenu } from '../ctxmenu.js';
import { ICONES95 } from '../icons.js';
import { tocar } from '../sound.js';

export function abrirExplorador(caminhoInicial = '/lar/cadete') {
  const jan = criarJanela({
    app: 'explorador',
    titulo: 'Explorador de Arquivos',
    icone: 'explorador',
    largura: 560,
    altura: 360,
    menu: '<button data-fita="acima">Acima</button><button data-fita="nova">Nova pasta</button>' +
          '<button data-fita="colar">Colar</button><button data-fita="atualizar">Atualizar</button>'
  });

  if (jan.jaExistia) return jan;

  let caminho = vfs.existe(caminhoInicial) ? caminhoInicial : '/lar/cadete';
  let selecao = new Set();

  const cabecalho = document.createElement('div');
  cabecalho.className = 'p95-caminho p95-relevo';
  jan.el.insertBefore(cabecalho, jan.corpo);

  const lista = document.createElement('div');
  lista.className = 'p95-lista';
  jan.corpo.appendChild(lista);

  function irPara(novo) {
    caminho = vfs.normalizar(novo);
    selecao.clear();
    desenhar();
    acao('navegar_pasta', { caminho });
  }

  function desenhar() {
    cabecalho.innerHTML = `<button class="p95-btn" data-acima style="min-width:auto;padding:2px 8px">Acima</button>
      <code>${caminho}</code>`;
    cabecalho.querySelector('[data-acima]').addEventListener('click', () => irPara(vfs.caminhoPai(caminho)));

    lista.innerHTML = '';
    const itens = vfs.listar(caminho);
    if (!itens.length) {
      const vazio = document.createElement('p');
      vazio.style.cssText = 'padding:14px;font-size:12px;color:#5a6069';
      vazio.textContent = 'Pasta vazia. Clique com o botao direito para criar alguma coisa aqui.';
      lista.appendChild(vazio);
    }

    for (const item of itens) {
      const caminhoItem = vfs.normalizar(caminho + '/' + item.nome);
      const el = document.createElement('div');
      el.className = 'p95-arquivo';
      el.tabIndex = 0;
      el.dataset.nome = item.nome;
      el.dataset.sel = selecao.has(item.nome) ? '1' : '0';
      el.title = item.tipo === 'pasta'
        ? 'Pasta: ' + item.nome
        : item.nome + ' - arquivo do sistema Pinguim 95x';
      el.innerHTML = (ICONES95[item.icone] || ICONES95.arquivo) + '<span>' + item.nome + '</span>';

      let etiqueta = null;
      el.addEventListener('mouseenter', () => {
        clearTimeout(etiqueta);
        etiqueta = setTimeout(() => acao('hover_tooltip', { alvo: item.nome, caminho: caminhoItem }), 600);
      });
      el.addEventListener('mouseleave', () => clearTimeout(etiqueta));

      el.addEventListener('click', (ev) => {
        if (!ev.ctrlKey && !ev.metaKey) selecao.clear();
        if (selecao.has(item.nome)) selecao.delete(item.nome); else selecao.add(item.nome);
        tocar('clique');
        acao('selecionar', { nome: item.nome, caminho: caminhoItem, quantidade: selecao.size });
        atualizarSelecao();
      });

      el.addEventListener('dblclick', () => abrirItem(item, caminhoItem));

      el.addEventListener('contextmenu', (ev) => {
        ev.preventDefault();
        selecao.clear();
        selecao.add(item.nome);
        atualizarSelecao();
        menuDoItem(ev, item, caminhoItem);
      });

      lista.appendChild(el);
    }
    atualizarSelecao();
  }

  function atualizarSelecao() {
    for (const el of lista.querySelectorAll('.p95-arquivo')) {
      el.dataset.sel = selecao.has(el.dataset.nome) ? '1' : '0';
    }
    const total = vfs.listar(caminho).length;
    jan.definirStatus(`${total} item(ns) - ${selecao.size} selecionado(s)`);
  }

  function abrirItem(item, caminhoItem) {
    acao('duplo_clique', { alvo: item.nome, caminho: caminhoItem });
    if (item.tipo === 'pasta') { irPara(caminhoItem); return; }
    acao('abrir_arquivo', { caminho: caminhoItem, nome: item.nome });
    const visor = criarJanela({
      app: 'visor:' + caminhoItem,
      multipla: true,
      titulo: item.nome + ' - Bloco de Texto',
      icone: item.icone === 'imagem' ? 'imagem' : 'arquivo',
      largura: 420, altura: 300
    });
    const p = document.createElement('div');
    p.style.cssText = 'padding:10px;font-size:12px;white-space:pre-wrap;user-select:text;font-family:monospace';
    p.textContent = item.conteudo || '(arquivo vazio)';
    visor.corpo.appendChild(p);
    visor.definirStatus('Selecione o texto e use Ctrl+C para copiar.');
    p.addEventListener('copy', () => acao('copiar_texto', { caminho: caminhoItem, nome: item.nome }));
  }

  function menuDoItem(ev, item, caminhoItem) {
    abrirMenu(ev.clientX, ev.clientY, [
      { rotulo: 'Abrir', ao: () => abrirItem(item, caminhoItem) },
      'sep',
      { rotulo: 'Recortar', ao: () => vfs.copiarParaArea(caminhoItem, 'recortar') },
      { rotulo: 'Copiar', ao: () => vfs.copiarParaArea(caminhoItem, 'copiar') },
      { rotulo: 'Colar', desativado: !vfs.transferencia.caminho || item.tipo !== 'pasta',
        ao: () => { vfs.colarDaArea(caminhoItem); desenhar(); } },
      'sep',
      { rotulo: 'Renomear', ao: () => renomear(item, caminhoItem) },
      { rotulo: 'Excluir', desativado: item.protegido,
        ao: async () => {
          const r = await dialogo({
            titulo: 'Confirmar exclusao',
            texto: `Enviar "${item.nome}" para a lixeira?`,
            icone: 'pergunta', botoes: ['Sim', 'Nao']
          });
          if (r === 0) { vfs.excluir(caminhoItem); tocar('lixo'); desenhar(); }
        } },
      'sep',
      { rotulo: 'Propriedades', ao: () => dialogo({
          titulo: 'Propriedades',
          icone: 'info',
          texto: `Nome: ${item.nome}<br>Tipo: ${item.tipo}<br>Local: ${caminho}<br>` +
                 `Tamanho: ${(item.conteudo || '').length || 0} bytes`
        }) }
    ], item.nome);
  }

  async function renomear(item, caminhoItem) {
    const novo = await dialogoEntrada({
      titulo: 'Renomear', texto: 'Novo nome do item:', valor: item.nome
    });
    if (novo) { vfs.renomear(caminhoItem, novo); desenhar(); }
  }

  /* menu do fundo da pasta */
  lista.addEventListener('contextmenu', (ev) => {
    if (ev.target.closest('.p95-arquivo')) return;
    ev.preventDefault();
    abrirMenu(ev.clientX, ev.clientY, [
      { rotulo: 'Nova pasta', ao: novaPasta },
      { rotulo: 'Novo documento de texto',
        ao: () => { vfs.criarArquivo(caminho, 'novo documento.txt', ''); desenhar(); } },
      'sep',
      { rotulo: 'Colar', desativado: !vfs.transferencia.caminho,
        ao: () => { vfs.colarDaArea(caminho); desenhar(); } },
      { rotulo: 'Atualizar', ao: desenhar }
    ], 'fundo:' + caminho);
  });

  async function novaPasta() {
    const nome = await dialogoEntrada({ titulo: 'Nova pasta', texto: 'Nome da pasta:', valor: 'nova pasta' });
    if (nome) { vfs.criarPasta(caminho, nome); desenhar(); }
  }

  /* atalhos de teclado */
  jan.el.addEventListener('keydown', async (ev) => {
    const alvo = [...selecao][0];
    const caminhoSel = alvo ? vfs.normalizar(caminho + '/' + alvo) : null;
    const ctrl = ev.ctrlKey || ev.metaKey;

    if (ctrl && ev.key.toLowerCase() === 'a') {
      ev.preventDefault();
      selecao = new Set(vfs.listar(caminho).map(i => i.nome));
      atualizarSelecao();
      acao('atalho', { tecla: 'ctrl+a', quantidade: selecao.size });
      acao('selecionar', { quantidade: selecao.size });
    }
    if (ctrl && ev.key.toLowerCase() === 'c' && caminhoSel) {
      acao('atalho', { tecla: 'ctrl+c' });
      vfs.copiarParaArea(caminhoSel, 'copiar');
    }
    if (ctrl && ev.key.toLowerCase() === 'x' && caminhoSel) {
      acao('atalho', { tecla: 'ctrl+x' });
      vfs.copiarParaArea(caminhoSel, 'recortar');
    }
    if (ctrl && ev.key.toLowerCase() === 'v') {
      acao('atalho', { tecla: 'ctrl+v' });
      vfs.colarDaArea(caminho);
      desenhar();
    }
    if (ev.key === 'F2' && caminhoSel) {
      ev.preventDefault();
      acao('atalho', { tecla: 'f2' });
      renomear(vfs.no(caminhoSel), caminhoSel);
    }
    if (ev.key === 'Delete' && caminhoSel) {
      acao('atalho', { tecla: 'delete' });
      vfs.excluir(caminhoSel);
      tocar('lixo');
      desenhar();
    }
    if (ev.key === 'Backspace') { ev.preventDefault(); irPara(vfs.caminhoPai(caminho)); }
  });

  /* rolagem: o aluno precisa usar a roda do mouse em pastas cheias */
  jan.corpo.addEventListener('scroll', () => {
    if (jan.corpo.scrollTop > 40) acao('rolar', { area: 'explorador', caminho });
  }, { passive: true });

  jan.fita?.addEventListener('click', (ev) => {
    const f = ev.target.dataset.fita;
    if (f === 'acima') irPara(vfs.caminhoPai(caminho));
    if (f === 'nova') novaPasta();
    if (f === 'colar') { vfs.colarDaArea(caminho); desenhar(); }
    if (f === 'atualizar') desenhar();
  });

  const solta = bus.on('vfs:mudou', desenhar);
  jan.aoFechar = solta;
  jan.el.tabIndex = 0;
  desenhar();
  jan.el.focus();
  return jan;
}

export function abrirLixeira() {
  const jan = criarJanela({
    app: 'lixeira', titulo: 'Lixeira', icone: 'lixeiraCheia',
    largura: 460, altura: 300,
    menu: '<button data-fita="restaurar">Restaurar selecionado</button><button data-fita="esvaziar">Esvaziar lixeira</button>'
  });

  if (jan.jaExistia) return jan;

  let selecionado = null;
  const lista = document.createElement('div');
  lista.className = 'p95-lista';
  jan.corpo.appendChild(lista);

  function desenhar() {
    lista.innerHTML = '';
    const itens = vfs.listar('/lixeira');
    if (!itens.length) {
      const p = document.createElement('p');
      p.style.cssText = 'padding:14px;font-size:12px;color:#5a6069';
      p.textContent = 'A lixeira esta vazia. Nada aqui foi perdido para sempre. Ainda.';
      lista.appendChild(p);
    }
    for (const item of itens) {
      const el = document.createElement('div');
      el.className = 'p95-arquivo';
      el.dataset.sel = selecionado === item.nome ? '1' : '0';
      el.title = 'Veio de: ' + (item.origem || 'origem desconhecida');
      el.innerHTML = (ICONES95[item.icone] || ICONES95.arquivo) + '<span>' + item.nome + '</span>';
      el.addEventListener('click', () => { selecionado = item.nome; desenhar(); tocar('clique'); });
      el.addEventListener('contextmenu', (ev) => {
        ev.preventDefault();
        selecionado = item.nome; desenhar();
        abrirMenu(ev.clientX, ev.clientY, [
          { rotulo: 'Restaurar', ao: () => { vfs.restaurar(item.nome); desenhar(); } }
        ], item.nome);
      });
      lista.appendChild(el);
    }
    jan.definirStatus(itens.length + ' item(ns) na lixeira');
  }

  jan.fita.addEventListener('click', async (ev) => {
    const f = ev.target.dataset.fita;
    if (f === 'restaurar' && selecionado) { vfs.restaurar(selecionado); selecionado = null; desenhar(); }
    if (f === 'esvaziar') {
      const r = await dialogo({
        titulo: 'Esvaziar lixeira', icone: 'aviso',
        texto: 'Isso apaga tudo em definitivo. Confirma?', botoes: ['Esvaziar', 'Cancelar']
      });
      if (r === 0) { vfs.esvaziarLixeira(); tocar('lixo'); desenhar(); }
    }
  });

  const solta = bus.on('vfs:mudou', desenhar);
  jan.aoFechar = solta;
  desenhar();
  return jan;
}

