/* Transmissor Orbital - cliente de transferencia de arquivos.
   Ensina a ideia de servidor: um computador em outro lugar que guarda arquivos.
   Duas listas lado a lado, e o aluno escolhe o sentido da transferencia. */

import * as vfs from '../vfs.js';
import { acao } from '../bus.js';
import { criarJanela, dialogo } from '../wm.js';
import { ICONES95 } from '../icons.js';
import { tocar } from '../sound.js';
import { sistema } from './config95.js';

export const SERVIDORES = {
  'alpha.frota.orb': {
    senha: 'alpha', descricao: 'Intranet da Nave Alpha',
    arquivos: [
      { nome: 'mapa_da_frota.txt', conteudo: 'Alpha, Beta, Gama e a torradeira rebelde.' },
      { nome: 'escala_de_turnos.txt', conteudo: 'Todos os turnos foram trocados. Ninguem sabe por quem.' }
    ]
  },
  'beta.frota.orb': {
    senha: 'beta', descricao: 'Intranet da Nave Beta',
    arquivos: [
      { nome: 'pedido_de_cafe.txt', conteudo: 'Pedido numero 402. Ainda sem resposta.' }
    ]
  },
  'deposito.frota.orb': {
    senha: 'alpha9902', descricao: 'Deposito 7-B (senha no relatorio da ponte)',
    arquivos: [
      { nome: 'inventario.txt', conteudo: 'Container ALPHA-9902: 400 latas de sopa de parafuso.' }
    ]
  }
};

export function abrirFtp() {
  const jan = criarJanela({
    app: 'ftp', titulo: 'Transmissor Orbital', icone: 'rede',
    largura: 540, altura: 360, corpoFace: true
  });
  if (jan.jaExistia) return jan;

  let conectado = null;
  let selLocal = null;
  let selRemoto = null;

  function desenhar() {
    if (!conectado) {
      jan.corpo.innerHTML = `
        <h4 style="margin:0 0 8px">Conectar a um servidor da frota</h4>
        <div class="p95-campo"><label>Servidor</label>
          <select data-servidor>${Object.entries(SERVIDORES)
            .map(([k, v]) => `<option value="${k}">${k} - ${v.descricao}</option>`).join('')}</select></div>
        <div class="p95-campo"><label>Usuario</label><input type="text" data-usuario value="cadete"></div>
        <div class="p95-campo"><label>Senha</label><input type="text" data-senha placeholder="peca a senha ao GabuTRON"></div>
        <button class="p95-btn" data-conectar>Conectar</button>
        <p style="font-size:11px;color:#4a4f56;margin-top:10px">
          Um servidor e um computador em outro lugar que guarda arquivos.
          Enviar coloca o arquivo la; baixar traz para ca.</p>`;
      jan.corpo.querySelector('[data-conectar]').addEventListener('click', conectar);
      jan.definirStatus(sistema.rede ? 'Desconectado' : 'Sem rede. Ligue a rede nas Configuracoes.');
      return;
    }

    const srv = SERVIDORES[conectado];
    const locais = vfs.listar('/lar/cadete/documentos').filter(i => i.tipo === 'arquivo');
    jan.corpo.innerHTML = `
      <div style="display:flex;gap:8px;height:100%">
        <div style="flex:1;display:flex;flex-direction:column;min-width:0">
          <b style="font-size:11px">Este computador (/lar/cadete/documentos)</b>
          <div class="p95-afundado" data-lista-local style="flex:1;overflow:auto;margin-top:3px"></div>
        </div>
        <div style="display:flex;flex-direction:column;justify-content:center;gap:6px">
          <button class="p95-btn" data-enviar style="min-width:auto">Enviar &gt;&gt;</button>
          <button class="p95-btn" data-baixar style="min-width:auto">&lt;&lt; Baixar</button>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;min-width:0">
          <b style="font-size:11px">${conectado}</b>
          <div class="p95-afundado" data-lista-remota style="flex:1;overflow:auto;margin-top:3px"></div>
        </div>
      </div>`;

    const pintar = (caixa, itens, selecionado, aoEscolher) => {
      caixa.innerHTML = '';
      for (const item of itens) {
        const linha = document.createElement('div');
        linha.style.cssText = 'display:flex;gap:5px;align-items:center;padding:2px 5px;font-size:11.5px';
        if (item.nome === selecionado) linha.style.cssText += ';background:#0a2a6b;color:#fff';
        linha.innerHTML = ICONES95.arquivo.replace('<svg', '<svg style="width:14px;height:14px"') +
                          '<span>' + item.nome + '</span>';
        linha.addEventListener('click', () => { aoEscolher(item.nome); tocar('clique'); });
        caixa.appendChild(linha);
      }
      if (!itens.length) caixa.innerHTML = '<p style="font-size:11px;color:#5a6069;padding:6px">Vazio.</p>';
    };

    pintar(jan.corpo.querySelector('[data-lista-local]'), locais, selLocal, (n) => { selLocal = n; desenhar(); });
    pintar(jan.corpo.querySelector('[data-lista-remota]'), srv.arquivos, selRemoto, (n) => { selRemoto = n; desenhar(); });

    jan.corpo.querySelector('[data-enviar]').addEventListener('click', async () => {
      if (!selLocal) { await dialogo({ titulo: 'Escolha um arquivo', texto: 'Selecione um arquivo da lista da esquerda.' }); return; }
      const origem = vfs.no('/lar/cadete/documentos/' + selLocal);
      srv.arquivos.push({ nome: selLocal, conteudo: origem?.conteudo || '' });
      acao('ftp_enviar', { nome: selLocal, servidor: conectado });
      tocar('sucesso');
      selLocal = null;
      desenhar();
    });

    jan.corpo.querySelector('[data-baixar]').addEventListener('click', async () => {
      if (!selRemoto) { await dialogo({ titulo: 'Escolha um arquivo', texto: 'Selecione um arquivo da lista da direita.' }); return; }
      const item = srv.arquivos.find(a => a.nome === selRemoto);
      vfs.criarArquivo('/lar/cadete/documentos', item.nome, item.conteudo);
      acao('ftp_baixar', { nome: item.nome, servidor: conectado });
      tocar('sucesso');
      selRemoto = null;
      desenhar();
    });

    jan.definirStatus('Conectado em ' + conectado);
  }

  async function conectar() {
    if (!sistema.rede) {
      await dialogo({ titulo: 'Sem rede', icone: 'aviso',
        texto: 'A rede orbital esta desligada. Ligue nas Configuracoes do Sistema e tente de novo.' });
      return;
    }
    const alvo = jan.corpo.querySelector('[data-servidor]').value;
    const senha = jan.corpo.querySelector('[data-senha]').value.trim();
    if (senha !== SERVIDORES[alvo].senha) {
      tocar('falha');
      await dialogo({ titulo: 'Acesso negado', icone: 'aviso',
        texto: 'Senha incorreta para ' + alvo + '. Servidor de verdade tambem nao deixa entrar sem credencial.' });
      acao('ftp_falha', { servidor: alvo });
      return;
    }
    conectado = alvo;
    acao('ftp_conectar', { servidor: alvo });
    tocar('sucesso');
    desenhar();
  }

  desenhar();
  return jan;
}
