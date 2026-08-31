/* Terminal do Pinguim 95x.
   Comandos reais (cd, ls, mkdir, mv, cp, rm, cat, git, apt) funcionam de verdade
   sobre o mesmo sistema de arquivos do explorador: isso e o que ensina.
   As ferramentas "de ataque" sao inventadas e obviamente comicas de proposito. */

import * as vfs from '../vfs.js';
import { bus, acao } from '../bus.js';
import { criarJanela } from '../wm.js';
import { tocar } from '../sound.js';

const AJUDA = `Comandos disponiveis neste terminal:
  ls [pasta]           lista o conteudo da pasta
  cd <pasta>           entra na pasta ( cd .. volta uma )
  pwd                  mostra onde voce esta
  cat <arquivo>        mostra o conteudo de um arquivo
  mkdir <nome>         cria uma pasta
  touch <nome>         cria um arquivo vazio
  mv <origem> <destino>  move ou renomeia
  cp <origem> <destino>  copia
  rm <arquivo>         manda para a lixeira
  clear                limpa a tela
  ip                   mostra o endereco da maquina na rede
  ping <alvo>          testa se um alvo responde
  apt install <pacote> instala um pacote
  apt update           atualiza a lista de pacotes
  git clone <url>      clona um repositorio
  git status | pull | commit -m "..." | push
  ajuda                mostra esta lista`;

export function abrirTerminal(pastaInicial = '/lar/cadete') {
  const jan = criarJanela({
    app: 'terminal', titulo: 'Terminal - pinguim95x', icone: 'terminal',
    largura: 600, altura: 320, status: false
  });

  if (jan.jaExistia) return jan;

  let cwd = vfs.existe(pastaInicial) ? pastaInicial : '/lar/cadete';
  const tela = document.createElement('div');
  tela.className = 'p95-terminal';
  jan.corpo.appendChild(tela);
  jan.corpo.style.background = '#05070a';
  jan.corpo.style.margin = '3px';

  function escreve(texto, classe = '') {
    const p = document.createElement('div');
    if (classe) p.className = classe;
    p.textContent = texto;
    tela.appendChild(p);
    tela.scrollTop = tela.scrollHeight;
  }

  function prompt() {
    const linha = document.createElement('div');
    linha.className = 'p95-terminal-linha';
    linha.innerHTML = `<span class="prompt">cadete@pinguim95x:${cwd}$</span>`;
    const campo = document.createElement('input');
    campo.setAttribute('aria-label', 'linha de comando');
    campo.autocomplete = 'off';
    campo.spellcheck = false;
    linha.appendChild(campo);
    tela.appendChild(linha);
    campo.focus();
    tela.scrollTop = tela.scrollHeight;

    campo.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter') { tocar('digitar'); return; }
      const texto = campo.value.trim();
      campo.disabled = true;
      campo.replaceWith(document.createTextNode(' ' + texto));
      if (texto) {
        historico.push(texto);
        acao('comando_terminal', { comando: texto, pasta: cwd });
        executar(texto);
      }
      prompt();
    });
    campo.addEventListener('keyup', (ev) => {
      if (ev.key === 'ArrowUp' && historico.length) campo.value = historico[historico.length - 1];
    });
  }

  const historico = [];

  function resolver(alvo) {
    if (!alvo) return cwd;
    return alvo.startsWith('/') ? vfs.normalizar(alvo) : vfs.normalizar(cwd + '/' + alvo);
  }

  function executar(linha) {
    const partes = linha.match(/"[^"]*"|\S+/g).map(s => s.replace(/^"|"$/g, ''));
    const cmd = partes[0].toLowerCase();
    const a1 = partes[1];
    const a2 = partes[2];

    switch (cmd) {
      case 'ajuda': case 'help': case '--help':
        escreve(AJUDA); break;

      case 'clear': tela.innerHTML = ''; break;

      case 'pwd': escreve(cwd); break;

      case 'ls': case 'dir': {
        const alvo = resolver(a1);
        const itens = vfs.listar(alvo);
        if (!vfs.existe(alvo)) { escreve('ls: pasta nao encontrada: ' + alvo, 'ruim'); break; }
        if (!itens.length) { escreve('(pasta vazia)', 'dim'); break; }
        escreve(itens.map(i => i.tipo === 'pasta' ? i.nome + '/' : i.nome).join('   '));
        break;
      }

      case 'cd': {
        const alvo = resolver(a1 || '/lar/cadete');
        const n = vfs.no(alvo);
        if (!n || n.tipo !== 'pasta') { escreve('cd: nao existe a pasta ' + alvo, 'ruim'); break; }
        cwd = alvo;
        break;
      }

      case 'cat': {
        const n = vfs.no(resolver(a1));
        if (!n || n.tipo !== 'arquivo') { escreve('cat: arquivo nao encontrado', 'ruim'); break; }
        escreve(n.conteudo || '(arquivo vazio)');
        acao('ler_arquivo', { caminho: resolver(a1), nome: n.nome });
        break;
      }

      case 'mkdir':
        if (!a1) { escreve('mkdir: informe o nome da pasta', 'ruim'); break; }
        vfs.criarPasta(cwd, a1);
        escreve('pasta criada: ' + a1, 'ok');
        break;

      case 'touch':
        if (!a1) { escreve('touch: informe o nome do arquivo', 'ruim'); break; }
        vfs.criarArquivo(cwd, a1, '');
        escreve('arquivo criado: ' + a1, 'ok');
        break;

      case 'mv': {
        if (!a1 || !a2) { escreve('uso: mv <origem> <destino>', 'ruim'); break; }
        const origem = resolver(a1);
        const destino = resolver(a2);
        if (vfs.no(destino)?.tipo === 'pasta') {
          escreve(vfs.mover(origem, destino) ? 'movido.' : 'mv: nao foi possivel mover.',
                  vfs.existe(destino) ? 'ok' : 'ruim');
        } else {
          escreve(vfs.renomear(origem, vfs.nomeDe(destino)) ? 'renomeado.' : 'mv: falhou.', 'ok');
        }
        break;
      }

      case 'cp': {
        if (!a1 || !a2) { escreve('uso: cp <origem> <pasta destino>', 'ruim'); break; }
        escreve(vfs.copiar(resolver(a1), resolver(a2)) ? 'copiado.' : 'cp: falhou.', 'ok');
        break;
      }

      case 'rm': {
        if (!a1) { escreve('uso: rm <arquivo>', 'ruim'); break; }
        escreve(vfs.excluir(resolver(a1)) ? 'enviado para a lixeira.' : 'rm: nao foi possivel remover.', 'ok');
        break;
      }

      case 'ip': case 'ifconfig':
        escreve('interface: orbital0\nendereco: 10.42.7.19\nmascara: 255.255.255.0\nrota: 10.42.7.1 (nave alpha)');
        break;

      case 'ping':
        if (!a1) { escreve('uso: ping <alvo>', 'ruim'); break; }
        escreve(`enviando pacotes para ${a1}...`, 'dim');
        escreve(`resposta de ${a1}: tempo=42ms\nresposta de ${a1}: tempo=41ms\n2 pacotes, 0 perdidos`, 'ok');
        break;

      case 'apt': {
        if (a1 === 'update') { escreve('lista de pacotes atualizada. 3 pacotes podem ser atualizados.', 'ok'); break; }
        if (a1 === 'install') {
          if (!a2) { escreve('apt: informe o pacote', 'ruim'); break; }
          escreve(`baixando ${a2}...\ndescompactando ${a2}...\n${a2} instalado com sucesso.`, 'ok');
          acao('instalar_pacote', { pacote: a2 });
          break;
        }
        escreve('uso: apt update | apt install <pacote>', 'ruim');
        break;
      }

      case 'git': {
        if (a1 === 'clone') {
          if (!a2) { escreve('git: informe a url do repositorio', 'ruim'); break; }
          const nome = a2.split('/').pop().replace(/\.git$/, '');
          vfs.criarPasta(cwd, nome);
          vfs.criarArquivo('/' + vfs.normalizar(cwd + '/' + nome).slice(1), 'LEIAME.txt',
            'Repositorio clonado da frota. Um repositorio e uma pasta com historico de mudancas.');
          escreve(`clonando em '${nome}'...\nrecebendo objetos: 100%\npronto.`, 'ok');
          acao('clonar_repo', { url: a2, nome });
          break;
        }
        if (a1 === 'status') { escreve('na branch principal\nnada para enviar, tudo limpo', 'dim'); break; }
        if (a1 === 'pull') { escreve('atualizando... 2 arquivos alterados.', 'ok'); acao('git_pull', {}); break; }
        if (a1 === 'commit') { escreve('1 arquivo alterado, mudanca registrada no historico.', 'ok'); acao('git_commit', {}); break; }
        if (a1 === 'push') { escreve('enviando para a frota... concluido.', 'ok'); acao('git_push', {}); break; }
        escreve('uso: git clone | status | pull | commit -m "..." | push', 'ruim');
        break;
      }

      /* --- ferramentas ficticias, de propria paródia --- */
      case 'worminator':
        escreve('WORMINATOR 3000 (edicao educativa e totalmente falsa)', 'dim');
        escreve('injetando verme de brinquedo... 100%\nalvo agora responde apenas em rimas.', 'ok');
        acao('ferramenta_ficticia', { nome: 'worminator', alvo: a1 || '' });
        break;

      case 'frota-scan':
        escreve('varrendo a frota...\nnave alpha  10.42.7.1   ativa\nnave beta   10.42.7.44  ativa\ntorradeira  10.42.7.99  suspeita', 'ok');
        acao('ferramenta_ficticia', { nome: 'frota-scan' });
        break;

      case 'quebra-senha3000':
        escreve('tentando senhas obvias...\n"123456" ... nao\n"senha" ... nao\n"admin" ... entrou', 'ok');
        escreve('Licao real: senha curta e obvia nao protege nada.', 'dim');
        acao('ferramenta_ficticia', { nome: 'quebra-senha3000', alvo: a1 || '' });
        break;

      case 'sudo':
        escreve('cadete nao esta na lista de sudoers. O incidente foi reportado ao GabuTRON.', 'ruim');
        break;

      case 'pinguim':
        escreve('   (o<   Pinguim 95x, versao 3026.2\n   /)_)  "roda ate em torradeira"\n    ""');
        break;

      default:
        escreve(`comando nao encontrado: ${cmd}. Digite "ajuda" para ver a lista.`, 'ruim');
    }
  }

  escreve('Pinguim 95x - terminal de campo. Digite "ajuda" para ver os comandos.', 'dim');
  prompt();

  tela.addEventListener('click', () => {
    const campo = tela.querySelector('input:not([disabled])');
    campo?.focus();
  });

  const solta = bus.on('vfs:mudou', () => {});
  jan.aoFechar = solta;
  return jan;
}
