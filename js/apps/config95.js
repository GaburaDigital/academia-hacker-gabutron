/* Configuracoes do Pinguim 95x.
   Nao confundir com os Ajustes da Academia: este painel e do computador simulado. */

import { acao } from '../bus.js';
import { criarJanela, dialogo } from '../wm.js';
import { tocar } from '../sound.js';

export const sistema = {
  rede: true,
  bluetooth: false,
  pareado: null,
  atualizado: false
};

const HARDWARE = [
  ['Processador', 'Nucleo Antartico 486 DX, 66 MHz'],
  ['Memoria', '32 MB (28 MB livres, 4 MB ocupados por um jogo de cartas)'],
  ['Armazenamento', 'Disco orbital de 540 MB'],
  ['Placa de video', 'GeloGrafica 1MB, 256 cores'],
  ['Rede', 'Interface orbital0, endereco 10.42.7.19'],
  ['Sistema', 'Pinguim 95x, versao 3026.2']
];

export function abrirConfig() {
  const jan = criarJanela({
    app: 'config', titulo: 'Configuracoes do Sistema', icone: 'config',
    largura: 480, altura: 340, corpoFace: true,
    menu: '<button data-fita="rede">Rede</button><button data-fita="bluetooth">Bluetooth</button>' +
          '<button data-fita="hardware">Sobre o computador</button><button data-fita="sistema">Manutencao</button>'
  });

  if (jan.jaExistia) return jan;

  let aba = 'rede';

  function desenhar() {
    if (aba === 'rede') {
      jan.corpo.innerHTML = `
        <h4 style="margin:0 0 10px">Rede orbital</h4>
        <p style="font-size:12px">Estado: <b>${sistema.rede ? 'conectado' : 'desconectado'}</b></p>
        <p style="font-size:12px">Endereco: 10.42.7.19 &nbsp; Rota: 10.42.7.1 (nave alpha)</p>
        <button class="p95-btn" data-alternar-rede>${sistema.rede ? 'Desconectar' : 'Conectar'}</button>`;
      jan.corpo.querySelector('[data-alternar-rede]').addEventListener('click', () => {
        sistema.rede = !sistema.rede;
        acao('alternar_rede', { estado: sistema.rede ? 'ligada' : 'desligada' });
        tocar(sistema.rede ? 'sucesso' : 'falha');
        desenhar();
      });
    }

    if (aba === 'bluetooth') {
      const dispositivos = ['Fone do Cadete', 'Teclado da Ponte', 'Robo-Cozinheiro 14'];
      jan.corpo.innerHTML = `
        <h4 style="margin:0 0 10px">Bluetooth</h4>
        <p style="font-size:12px">Radio: <b>${sistema.bluetooth ? 'ligado' : 'desligado'}</b>
          &nbsp; Pareado com: <b>${sistema.pareado || 'nenhum'}</b></p>
        <button class="p95-btn" data-radio>${sistema.bluetooth ? 'Desligar radio' : 'Ligar radio'}</button>
        <div style="margin-top:12px">
          ${dispositivos.map(d => `<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
            <span style="flex:1;font-size:12px">${d}</span>
            <button class="p95-btn" data-parear="${d}" ${sistema.bluetooth ? '' : 'disabled'}
              style="min-width:auto">${sistema.pareado === d ? 'Desparear' : 'Parear'}</button>
          </div>`).join('')}
        </div>`;
      jan.corpo.querySelector('[data-radio]').addEventListener('click', () => {
        sistema.bluetooth = !sistema.bluetooth;
        if (!sistema.bluetooth) sistema.pareado = null;
        acao('bluetooth', { estado: sistema.bluetooth ? 'ligado' : 'desligado' });
        desenhar();
      });
      for (const b of jan.corpo.querySelectorAll('[data-parear]')) {
        b.addEventListener('click', () => {
          const nome = b.dataset.parear;
          if (sistema.pareado === nome) {
            sistema.pareado = null;
            acao('desparear', { dispositivo: nome });
          } else {
            sistema.pareado = nome;
            acao('parear', { dispositivo: nome });
          }
          tocar('passo');
          desenhar();
        });
      }
    }

    if (aba === 'hardware') {
      jan.corpo.innerHTML = `<h4 style="margin:0 0 10px">Sobre este computador</h4>
        <table style="font-size:12px;border-collapse:collapse;width:100%">
          ${HARDWARE.map(([k, v]) => `<tr><td style="padding:3px 8px 3px 0;white-space:nowrap"><b>${k}</b></td>
            <td style="padding:3px 0">${v}</td></tr>`).join('')}
        </table>`;
      acao('config_ver', { secao: 'hardware' });
    }

    if (aba === 'sistema') {
      jan.corpo.innerHTML = `<h4 style="margin:0 0 10px">Manutencao</h4>
        <p style="font-size:12px">Atualizacoes: <b>${sistema.atualizado ? 'em dia' : '3 pendentes'}</b></p>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="p95-btn" data-atualizar>Atualizar sistema</button>
          <button class="p95-btn" data-reiniciar>Reiniciar computador</button>
        </div>`;
      jan.corpo.querySelector('[data-atualizar]').addEventListener('click', async () => {
        jan.corpo.querySelector('[data-atualizar]').disabled = true;
        await dialogo({ titulo: 'Atualizacao', icone: 'info',
          texto: 'Baixando pacotes da frota... instalado. Agora o sistema esta em dia.' });
        sistema.atualizado = true;
        acao('atualizar_sistema', {});
        tocar('sucesso');
        desenhar();
      });
      jan.corpo.querySelector('[data-reiniciar]').addEventListener('click', async () => {
        const r = await dialogo({ titulo: 'Reiniciar', icone: 'pergunta',
          texto: 'Reiniciar o Pinguim 95x agora?', botoes: ['Reiniciar', 'Cancelar'] });
        if (r === 0) reiniciar();
      });
    }
  }

  jan.fita.addEventListener('click', (ev) => {
    if (!ev.target.dataset.fita) return;
    aba = ev.target.dataset.fita;
    tocar('clique');
    desenhar();
  });

  desenhar();
  return jan;
}

export function reiniciar() {
  const p95 = document.getElementById('p95');
  const tela = document.getElementById('p95-reboot');
  const linhas = [
    'Pinguim 95x encerrando processos...',
    'Salvando o jogo de cartas...',
    'Desmontando disco orbital...',
    'Reiniciando.'
  ];
  tela.textContent = '';
  p95.dataset.estado = 'reiniciando';
  acao('reiniciar', {});
  tocar('boot');
  let i = 0;
  const timer = setInterval(() => {
    tela.textContent += linhas[i] + '\n';
    if (++i >= linhas.length) {
      clearInterval(timer);
      setTimeout(() => {
        p95.dataset.estado = 'ligado';
        tocar('sucesso');
      }, 900);
    }
  }, 520);
}
