/* Dois utilitarios pequenos do Pinguim 95x:
   - Central de Pacotes: instalar e remover programas por janela, com busca.
   - Bloco de Notas: abrir, escrever e salvar um arquivo de texto. */

import * as vfs from '../vfs.js';
import { acao } from '../bus.js';
import { criarJanela, dialogo, dialogoEntrada } from '../wm.js';
import { ICONES95 } from '../icons.js';
import { tocar } from '../sound.js';

export const PACOTES = [
  { nome: 'frota-scan', desc: 'Varre a rede da frota e lista as naves ativas.', instalado: false },
  { nome: 'worminator', desc: 'Verme de brinquedo. Faz o alvo falar em rimas.', instalado: false },
  { nome: 'quebra-senha3000', desc: 'Testa senhas obvias. Serve para mostrar por que senha curta e ruim.', instalado: false },
  { nome: 'resgata-arquivo', desc: 'Recupera arquivo apagado da lixeira.', instalado: false },
  { nome: 'pinguim-pincel', desc: 'Editor de desenho da frota.', instalado: true },
  { nome: 'transmissor-orbital', desc: 'Envia e baixa arquivos de servidores.', instalado: true },
  { nome: 'cafe-virtual', desc: 'Nao produz cafe. Apenas exibe a foto de um.', instalado: false },
  { nome: 'antivirus-boreal', desc: 'Protege contra vermes de brinquedo alheios.', instalado: false }
];

export function abrirPacotes() {
  const jan = criarJanela({
    app: 'pacotes', titulo: 'Central de Pacotes', icone: 'pacote',
    largura: 480, altura: 340, corpoFace: true
  });
  if (jan.jaExistia) return jan;

  let filtro = '';

  function desenhar() {
    const lista = PACOTES.filter(p => p.nome.includes(filtro.toLowerCase()));
    jan.corpo.innerHTML = `
      <div class="p95-campo"><label>Procurar programa</label>
        <input type="text" data-busca value="${filtro}" placeholder="ex.: scan"></div>
      <div class="p95-afundado" data-lista style="height:200px;overflow:auto"></div>`;

    const caixa = jan.corpo.querySelector('[data-lista]');
    for (const pac of lista) {
      const linha = document.createElement('div');
      linha.style.cssText = 'display:flex;gap:7px;align-items:center;padding:5px 6px;border-bottom:1px solid #dcdfe3';
      linha.innerHTML = ICONES95.pacote.replace('<svg', '<svg style="width:20px;height:20px;flex:none"') +
        `<span style="flex:1;font-size:11.5px"><b>${pac.nome}</b><br>
           <span style="color:#4a4f56">${pac.desc}</span></span>`;
      const b = document.createElement('button');
      b.className = 'p95-btn';
      b.style.minWidth = '78px';
      b.textContent = pac.instalado ? 'Remover' : 'Instalar';
      b.addEventListener('click', async () => {
        pac.instalado = !pac.instalado;
        acao(pac.instalado ? 'instalar_pacote' : 'remover_pacote', { pacote: pac.nome, origem: 'janela' });
        tocar(pac.instalado ? 'sucesso' : 'lixo');
        await dialogo({
          titulo: pac.instalado ? 'Instalado' : 'Removido', icone: 'info',
          texto: pac.instalado
            ? `${pac.nome} instalado. Ja pode ser usado pelo terminal.`
            : `${pac.nome} removido do sistema.`
        });
        desenhar();
      });
      linha.appendChild(b);
      caixa.appendChild(linha);
    }
    if (!lista.length) caixa.innerHTML = '<p style="font-size:11.5px;padding:8px;color:#5a6069">Nenhum programa com esse nome.</p>';

    const busca = jan.corpo.querySelector('[data-busca]');
    busca.addEventListener('input', (e) => { filtro = e.target.value; desenhar(); });
    if (filtro) { busca.focus(); busca.setSelectionRange(filtro.length, filtro.length); }
    jan.definirStatus(PACOTES.filter(p => p.instalado).length + ' programa(s) instalado(s)');
  }

  desenhar();
  return jan;
}

/* Lista os documentos de texto do computador para o aluno escolher.
   Digitar o caminho inteiro trava quem esta comecando. */
function escolherArquivo() {
  const arquivos = [];
  (function varrer(caminho) {
    for (const item of vfs.listar(caminho)) {
      const c = vfs.normalizar(caminho + '/' + item.nome);
      if (item.tipo === 'pasta') varrer(c);
      else if (/\.(txt|log|cfg|md)$/i.test(item.nome)) arquivos.push(c);
    }
  })('/lar');

  return new Promise((resolve) => {
    const area = document.getElementById('p95');
    const cx = document.createElement('div');
    cx.className = 'p95-dialogo';
    cx.style.width = '400px';
    cx.innerHTML = `
      <div class="p95-barra">${ICONES95.pasta}<span>Abrir documento</span></div>
      <div class="conteudo" style="display:block">
        <p style="margin:0 0 6px;font-size:11.5px">Escolha o documento que voce quer editar:</p>
        <select data-arq size="8" style="width:100%;font-family:inherit;font-size:11.5px">
          ${arquivos.map(a => `<option value="${a}">${a}</option>`).join('')}
        </select>
      </div>
      <div class="acoes">
        <button class="p95-btn" data-ok>Abrir</button>
        <button class="p95-btn" data-cancelar>Cancelar</button>
      </div>`;
    area.appendChild(cx);
    const caixa = area.getBoundingClientRect();
    cx.style.transform = 'none';
    cx.style.left = Math.max(0, Math.round((caixa.width - cx.offsetWidth) / 2)) + 'px';
    cx.style.top = Math.max(0, Math.round((caixa.height - cx.offsetHeight) / 2)) + 'px';

    const sel = cx.querySelector('[data-arq]');
    if (arquivos.length) sel.value = arquivos[0];
    const ok = () => { const v = sel.value; cx.remove(); resolve(v || null); };
    cx.querySelector('[data-ok]').addEventListener('click', ok);
    cx.querySelector('[data-cancelar]').addEventListener('click', () => { cx.remove(); resolve(null); });
    sel.addEventListener('dblclick', ok);
  });
}

/* ---------------------------------------------------------------- notas */

/* Referencia da janela aberta, para que abrir outro arquivo reaproveite a mesma
   janela em vez de devolver uma janela antiga com o texto errado. */
let notasAberto = null;

export function abrirNotas(caminhoArquivo = null) {
  const jan = criarJanela({
    app: 'notas', titulo: 'Bloco de Notas', icone: 'arquivo',
    largura: 460, altura: 340, corpoFace: true,
    menu: '<button data-fita="abrir">Abrir</button><button data-fita="salvar">Salvar</button>' +
          '<button data-fita="novo">Novo</button>'
  });
  if (jan.jaExistia) {
    if (caminhoArquivo && notasAberto) notasAberto.carregar(caminhoArquivo);
    return jan;
  }

  let atual = caminhoArquivo;

  jan.corpo.innerHTML = `<textarea data-texto spellcheck="false"
    aria-label="conteudo do documento"
    style="width:100%;height:100%;font-family:monospace;font-size:12.5px;padding:6px;
    background:#ffffff;border:2px solid;border-color:#40444a #ffffff #ffffff #40444a;
    resize:none;user-select:text"></textarea>`;
  const campo = jan.corpo.querySelector('[data-texto]');
  campo.readOnly = false;

  function carregar(caminho) {
    const n = vfs.no(caminho);
    if (!n || n.tipo !== 'arquivo') return false;
    atual = caminho;
    campo.value = n.conteudo || '';
    jan.definirTitulo(n.nome + ' - Bloco de Notas');
    jan.definirStatus(caminho);
    acao('abrir_arquivo', { caminho, nome: n.nome });
    return true;
  }

  notasAberto = { jan, carregar };
  jan.aoFechar = () => { notasAberto = null; };

  if (atual) carregar(atual);
  else jan.definirStatus('Documento novo. Clique na area branca e escreva.');

  campo.addEventListener('input', () => acao('editar_texto', { caminho: atual || '' }));

  /* selecionar e copiar texto com o mouse continua sendo um treino da missao */
  campo.addEventListener('copy', () => {
    acao('copiar_texto', { caminho: atual || '', nome: atual ? vfs.nomeDe(atual) : '' });
  });
  campo.addEventListener('paste', () => acao('atalho', { tecla: 'ctrl+v' }));
  campo.addEventListener('keydown', (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'c') acao('atalho', { tecla: 'ctrl+c' });
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'a') acao('atalho', { tecla: 'ctrl+a' });
  });

  jan.fita.addEventListener('click', async (ev) => {
    const f = ev.target.dataset.fita;

    if (f === 'novo') { atual = null; campo.value = ''; jan.definirTitulo('Bloco de Notas'); }

    if (f === 'abrir') {
      const caminho = await escolherArquivo();
      if (!caminho) return;
      if (!carregar(caminho)) {
        await dialogo({ titulo: 'Nao encontrado', icone: 'aviso',
          texto: 'Nao consegui abrir ' + caminho + '. Confira no Explorador.' });
      }
    }

    if (f === 'salvar') {
      if (atual) {
        vfs.no(atual).conteudo = campo.value;
        acao('salvar_arquivo', { caminho: atual, nome: vfs.nomeDe(atual) });
      } else {
        const nome = await dialogoEntrada({
          titulo: 'Salvar como', texto: 'Nome do arquivo:', valor: 'anotacoes.txt'
        });
        if (!nome) return;
        vfs.criarArquivo('/lar/cadete/documentos', nome, campo.value);
        atual = '/lar/cadete/documentos/' + nome;
        jan.definirTitulo(nome + ' - Bloco de Notas');
        acao('salvar_arquivo', { caminho: atual, nome });
      }
      tocar('sucesso');
      jan.definirStatus('Salvo em ' + atual);
    }
  });

  return jan;
}
