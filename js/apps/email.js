/* Correio Orbital - cliente de email do Pinguim 95x.
   Serve para dois treinos: enviar mensagem com anexo, e reconhecer golpe. */

import * as vfs from '../vfs.js';
import { acao } from '../bus.js';
import { criarJanela, dialogo } from '../wm.js';
import { abrirMenu } from '../ctxmenu.js';
import { ICONES95 } from '../icons.js';
import { tocar } from '../sound.js';

export const caixaEntrada = [];

export function carregarEmails(lista = []) {
  caixaEntrada.length = 0;
  lista.forEach((e, i) => caixaEntrada.push({ id: e.id || 'msg' + i, lido: false, golpe: false, ...e }));
}

export function abrirEmail() {
  const jan = criarJanela({
    app: 'email', titulo: 'Correio Orbital', icone: 'email',
    largura: 580, altura: 380,
    menu: '<button data-fita="novo">Nova mensagem</button><button data-fita="atualizar">Receber</button>'
  });

  if (jan.jaExistia) return jan;

  let selecionado = null;

  const lista = document.createElement('div');
  lista.className = 'p95-email-lista';
  const corpo = document.createElement('div');
  corpo.className = 'p95-email-corpo';
  jan.corpo.appendChild(lista);
  jan.corpo.appendChild(corpo);

  function desenhar() {
    lista.innerHTML = '';
    for (const msg of caixaEntrada) {
      const el = document.createElement('div');
      el.className = 'p95-email-item';
      el.dataset.lido = msg.lido ? '1' : '0';
      el.dataset.sel = selecionado === msg.id ? '1' : '0';
      el.title = 'De: ' + msg.de;
      el.innerHTML = (msg.marcado ? ICONES95.aviso : ICONES95.email) +
        `<span>${msg.assunto}</span><span>${msg.de}</span>`;
      el.addEventListener('click', () => {
        selecionado = msg.id;
        if (!msg.lido) { msg.lido = true; acao('ler_email', { id: msg.id, de: msg.de }); }
        tocar('clique');
        desenhar();
      });
      el.addEventListener('contextmenu', (ev) => {
        ev.preventDefault();
        selecionado = msg.id; desenhar();
        abrirMenu(ev.clientX, ev.clientY, [
          { rotulo: 'Marcar como golpe', ao: () => marcarGolpe(msg) },
          { rotulo: 'Excluir mensagem', ao: () => {
              const i = caixaEntrada.indexOf(msg);
              caixaEntrada.splice(i, 1);
              acao('excluir_email', { id: msg.id });
              selecionado = null; desenhar();
            } }
        ], msg.assunto);
      });
      lista.appendChild(el);
    }

    const msg = caixaEntrada.find(m => m.id === selecionado);
    corpo.innerHTML = msg
      ? `<h4>${msg.assunto}</h4>
         <div class="p95-email-cab">De: ${msg.de}<br>Para: cadete@frota.orb</div>
         <div>${msg.corpo}</div>
         ${msg.anexo ? `<div class="p95-email-cab" style="margin-top:10px">Anexo: ${msg.anexo}</div>` : ''}`
      : '<span style="color:#5a6069">Selecione uma mensagem para ler. Botao direito abre mais opcoes.</span>';

    jan.definirStatus(caixaEntrada.length + ' mensagem(ns) na caixa de entrada');
  }

  async function marcarGolpe(msg) {
    msg.marcado = true;
    acao('marcar_golpe', { id: msg.id, de: msg.de, correto: !!msg.golpe });
    desenhar();
    await dialogo({
      titulo: msg.golpe ? 'Boa leitura' : 'Hmm',
      icone: msg.golpe ? 'info' : 'aviso',
      texto: msg.golpe
        ? 'Mensagem marcada como golpe. Remetente estranho, urgencia falsa e link suspeito costumam andar juntos.'
        : 'Essa mensagem parece legitima. Marcar tudo como golpe tambem atrapalha o trabalho.'
    });
  }

  function novaMensagem() {
    const nova = criarJanela({
      app: 'email:novo', multipla: true, titulo: 'Nova mensagem', icone: 'email',
      largura: 440, altura: 360, corpoFace: true, status: false
    });
    const arquivos = [];
    (function varrer(p) {
      for (const item of vfs.listar(p)) {
        const c = vfs.normalizar(p + '/' + item.nome);
        if (item.tipo === 'pasta') varrer(c); else arquivos.push(c);
      }
    })('/lar/cadete');

    nova.corpo.innerHTML = `
      <div class="p95-campo"><label>Para</label><input type="text" data-para placeholder="nome@frota.orb"></div>
      <div class="p95-campo"><label>Assunto</label><input type="text" data-assunto></div>
      <div class="p95-campo"><label>Anexo</label>
        <select data-anexo><option value="">(sem anexo)</option>
        ${arquivos.map(a => `<option value="${a}">${a}</option>`).join('')}</select></div>
      <div class="p95-campo"><label>Mensagem</label><textarea data-corpo></textarea></div>
      <div style="display:flex;gap:6px;justify-content:flex-end">
        <button class="p95-btn" data-enviar>Enviar</button>
        <button class="p95-btn" data-cancelar>Cancelar</button>
      </div>`;

    nova.corpo.querySelector('[data-anexo]').addEventListener('change', (ev) => {
      if (ev.target.value) acao('anexar_arquivo', { caminho: ev.target.value, nome: vfs.nomeDe(ev.target.value) });
    });
    nova.corpo.querySelector('[data-cancelar]').addEventListener('click', () => nova.fechar());
    nova.corpo.querySelector('[data-enviar]').addEventListener('click', async () => {
      const para = nova.corpo.querySelector('[data-para]').value.trim();
      const assunto = nova.corpo.querySelector('[data-assunto]').value.trim();
      const texto = nova.corpo.querySelector('[data-corpo]').value.trim();
      const anexo = nova.corpo.querySelector('[data-anexo]').value;
      if (!para) {
        await dialogo({ titulo: 'Faltou o destinatario', texto: 'Escreva para quem vai a mensagem.' });
        return;
      }
      acao('enviar_email', {
        para, assunto, corpo: texto,
        anexo: anexo ? vfs.nomeDe(anexo) : '',
        caminhoAnexo: anexo
      });
      tocar('sucesso');
      nova.fechar();
      await dialogo({ titulo: 'Mensagem enviada', icone: 'info', texto: 'Transmissao concluida para ' + para + '.' });
    });
  }

  jan.fita.addEventListener('click', (ev) => {
    if (ev.target.dataset.fita === 'novo') novaMensagem();
    if (ev.target.dataset.fita === 'atualizar') { tocar('alerta'); desenhar(); }
  });

  jan.corpo.addEventListener('scroll', () => {
    if (jan.corpo.scrollTop > 30) acao('rolar', { area: 'email' });
  }, { passive: true });

  desenhar();
  return jan;
}
