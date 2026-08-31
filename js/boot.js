/* Sequencia de boot da Academia. Pode ser pulada com clique ou tecla. */

import { tocar, destravarAudio } from './sound.js';

const LINHAS = [
  'GABURA BIOS v3.26  (c) Frota Estelar',
  '',
  'Testando memoria orbital ............ 32768 KB  OK',
  'Detectando mouse .................... 2 botoes + roda  OK',
  'Detectando teclado .................. presente  OK',
  'Detectando cadete ................... presente  PROVAVELMENTE OK',
  'Montando disco orbital .............. OK',
  'Carregando nucleo GabuTRON .......... OK',
  'Carregando Pinguim 95x .............. OK',
  '',
  'AVISO: relogio de bordo marcando 42:05 de 31 de fevereiro.',
  'AVISO: cafe da nave beta em falta desde o ciclo 402.',
  '',
  'ACADEMIA HACKER GABUTRON pronta para o treinamento.',
  'Pressione qualquer tecla para entrar.'
];

export function rodarBoot() {
  return new Promise((resolve) => {
    const tela = document.getElementById('boot');
    const saida = tela.querySelector('pre');
    const pular = document.getElementById('boot-pular');
    let i = 0;
    let terminou = false;

    const encerrar = () => {
      if (terminou) return;
      terminou = true;
      clearInterval(timer);
      document.removeEventListener('keydown', encerrar);
      tela.removeEventListener('click', encerrar);
      tela.remove();
      destravarAudio();
      tocar('boot');
      resolve();
    };

    const timer = setInterval(() => {
      saida.textContent += (saida.textContent ? '\n' : '') + LINHAS[i];
      if (i > 1 && LINHAS[i]) tocar('digitar');
      if (++i >= LINHAS.length) {
        clearInterval(timer);
        saida.innerHTML += '\n<span class="cursor">&nbsp;</span>';
        setTimeout(encerrar, 2600);
      }
    }, 190);

    pular.addEventListener('click', encerrar);
    tela.addEventListener('click', encerrar);
    document.addEventListener('keydown', encerrar);
  });
}
