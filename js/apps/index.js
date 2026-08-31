/* Registro dos aplicativos do Pinguim 95x.
   Para acrescentar um app novo: crie o modulo, importe e adicione uma entrada aqui. */

import { abrirExplorador, abrirLixeira } from './explorador.js';
import { abrirTerminal } from './terminal.js';
import { abrirEmail } from './email.js';
import { abrirNavegador } from './navegador.js';
import { abrirConfig } from './config95.js';
import { abrirDesenho } from './desenho.js';
import { abrirFtp } from './ftp.js';
import { abrirPacotes, abrirNotas } from './utilitarios.js';
import { criarJanela } from '../wm.js';
import { acao } from '../bus.js';

function abrirManual() {
  const jan = criarJanela({
    app: 'manual', titulo: 'Manual da Frota', icone: 'manual',
    largura: 460, altura: 330, status: false
  });
  if (jan.jaExistia) return jan;
  jan.corpo.innerHTML = `<div style="padding:12px 14px;font-size:12px;user-select:text">
    <h4 style="margin:0 0 8px">Manual da Frota - resumo do cadete</h4>
    <p><b>Clique simples</b> seleciona. <b>Clique duplo</b> abre. <b>Botao direito</b> mostra o que da para fazer com aquele item.</p>
    <p><b>Passar o mouse por cima</b> e esperar um instante mostra a etiqueta com o nome completo.</p>
    <p><b>Roda do mouse</b> desce e sobe a pagina. A barra da direita faz a mesma coisa.</p>
    <p><b>Atalhos:</b> Ctrl+C copia, Ctrl+X recorta, Ctrl+V cola, Ctrl+A seleciona tudo,
       F2 renomeia, Delete manda para a lixeira, Backspace volta uma pasta.</p>
    <p><b>Caminho</b> e o endereco de um arquivo: comeca na barra e desce pelas pastas.</p>
    <p><b>Terminal:</b> ls lista, cd entra, cat mostra, mkdir cria pasta, mv move ou renomeia,
       cp copia, rm manda para a lixeira. Digite "ajuda" para a lista completa.</p>
    <p><b>Repositorio</b> e uma pasta com historico de mudancas. Clonar traz uma copia para a sua maquina.</p>
    <p><b>Golpe por email</b> costuma ter pressa, erro de escrita, remetente estranho e link suspeito.</p>
  </div>`;
  acao('ler_manual', {});
  return jan;
}

export const APPS = {
  explorador: { nome: 'Explorador de Arquivos', icone: 'explorador', abrir: () => abrirExplorador() },
  terminal:   { nome: 'Terminal',               icone: 'terminal',   abrir: () => abrirTerminal() },
  email:      { nome: 'Correio Orbital',        icone: 'email',      abrir: () => abrirEmail() },
  navegador:  { nome: 'Orbital Explorer',       icone: 'navegador',  abrir: () => abrirNavegador() },
  config:     { nome: 'Configuracoes do Sistema', icone: 'config',   abrir: () => abrirConfig() },
  lixeira:    { nome: 'Lixeira',                icone: 'lixeiraVazia', abrir: () => abrirLixeira() },
  manual:     { nome: 'Manual da Frota',        icone: 'manual',     abrir: abrirManual },
  computador: { nome: 'Meu Computador',         icone: 'computador', abrir: () => abrirExplorador('/') },
  pendrive:   { nome: 'Midia Externa',          icone: 'pendrive',   abrir: () => abrirExplorador('/midia/pendrive') },
  desenho:    { nome: 'Pinguim Pincel',         icone: 'desenho',    abrir: () => abrirDesenho() },
  ftp:        { nome: 'Transmissor Orbital',    icone: 'rede',       abrir: () => abrirFtp() },
  pacotes:    { nome: 'Central de Pacotes',     icone: 'pacote',     abrir: () => abrirPacotes() },
  notas:      { nome: 'Bloco de Notas',         icone: 'arquivo',    abrir: (c) => abrirNotas(c) }
};

export function abrirApp(id, ...args) {
  const app = APPS[id];
  if (!app) return null;
  return app.abrir(...args);
}
