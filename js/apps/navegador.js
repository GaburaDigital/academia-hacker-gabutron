/* Orbital Explorer - navegador do Pinguim 95x.
   Paginas ficticias da frota. Serve para treinar barra de endereco, links,
   rolagem e o inspetor de codigo (botao direito > Inspecionar). */

import { acao } from '../bus.js';
import { criarJanela, dialogo } from '../wm.js';
import { abrirMenu } from '../ctxmenu.js';
import { tocar } from '../sound.js';

const PAGINAS = {
  'frota.orb': {
    titulo: 'Portal da Frota Estelar',
    html: `<h3>Portal da Frota Estelar</h3>
      <p>Bem-vindo, cadete. Este portal reune manuais, avisos e o mural da tripulacao.</p>
      <ul>
        <li><a href="#" data-ir="manual.frota.orb">Manual de bordo</a></li>
        <li><a href="#" data-ir="mural.frota.orb">Mural da tripulacao</a></li>
        <li><a href="#" data-ir="loja.frota.orb">Loja de pecas</a></li>
      </ul>
      <p>Aviso: a nave beta segue sem cafe desde o ciclo 402.</p>`,
    oculto: 'Nada escondido aqui. Continue procurando.'
  },
  'manual.frota.orb': {
    titulo: 'Manual de bordo',
    html: `<h3>Manual de bordo</h3>
      <p>Capitulo 1 - Um caminho e o endereco de um arquivo dentro do computador.
      Ele comeca na raiz, que e a barra, e desce pelas pastas.</p>
      <p>Capitulo 2 - O terminal faz as mesmas coisas que as janelas, so que escrevendo.
      "ls" lista, "cd" entra, "cat" mostra o conteudo.</p>
      <p>Capitulo 3 - Um repositorio e uma pasta com historico. Clonar e trazer uma copia.</p>
      <p>Capitulo 4 - Senha boa e longa e dificil de adivinhar. Senha ruim e o nome do gato.</p>
      <p>Capitulo 5 - Se uma mensagem te apressa e pede clique urgente, desconfie.</p>`,
    oculto: 'codigo-de-acesso: PINGUIM-ARCTICO-7'
  },
  'mural.frota.orb': {
    titulo: 'Mural da tripulacao',
    html: `<h3>Mural da tripulacao</h3>
      <p>Sargento Vilma: perdi meu pendrive. Se acharem, e o azul com adesivo de foguete.</p>
      <p>Robo-Cozinheiro 14: a sopa de parafuso e um recurso, nao um defeito.</p>
      <p>Cadete anonimo: alguem sabe desligar o alarme das 3h?</p>
      <p>Engenharia: nao mexam no cabo laranja. De novo nao.</p>`,
    oculto: 'link-secreto: deposito.frota.orb'
  },
  'loja.frota.orb': {
    titulo: 'Loja de pecas',
    html: `<h3>Loja de pecas usadas</h3>
      <p>Fusivel orbital - 3 creditos</p><p>Cabo laranja - 12 creditos</p>
      <p>Antena dobravel - 40 creditos</p><p>Cafe em po - esgotado desde o ciclo 402</p>`,
    oculto: 'cupom: TORRADEIRA10'
  },
  'deposito.frota.orb': {
    titulo: 'Deposito da frota',
    html: `<h3>Deposito 7-B</h3>
      <p>Voce encontrou uma pagina que nao aparece em nenhum menu.</p>
      <p>Codigo do container: <b>ALPHA-9902</b></p>`,
    oculto: 'nada aqui alem de poeira espacial'
  }
};

export function abrirNavegador(urlInicial = 'frota.orb') {
  const jan = criarJanela({
    app: 'navegador', titulo: 'Orbital Explorer', icone: 'navegador',
    largura: 560, altura: 380
  });

  if (jan.jaExistia) return jan;

  const barra = document.createElement('div');
  barra.className = 'p95-url p95-relevo';
  barra.innerHTML = `<span>Endereco:</span>
    <input type="text" class="p95-campo" data-url style="padding:3px 5px">
    <button class="p95-btn" data-ir style="min-width:auto">Ir</button>`;
  jan.el.insertBefore(barra, jan.corpo);

  const pagina = document.createElement('div');
  pagina.className = 'p95-pagina';
  jan.corpo.appendChild(pagina);

  const campo = barra.querySelector('[data-url]');

  function ir(url) {
    const limpo = String(url).replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
    campo.value = limpo;
    const p = PAGINAS[limpo];
    acao('navegar_url', { url: limpo, existe: !!p });
    if (!p) {
      pagina.innerHTML = `<h3>Pagina nao encontrada</h3>
        <p>O endereco <b>${limpo}</b> nao respondeu. Confira se digitou certo.</p>`;
      jan.definirTitulo('Nao encontrada - Orbital Explorer');
      tocar('falha');
      return;
    }
    pagina.innerHTML = p.html;
    pagina.dataset.oculto = p.oculto || '';
    jan.definirTitulo(p.titulo + ' - Orbital Explorer');
    jan.definirStatus('Concluido: ' + limpo);
    tocar('abrir');
  }

  pagina.addEventListener('click', (ev) => {
    const link = ev.target.closest('[data-ir]');
    if (link) { ev.preventDefault(); acao('clicar_link', { alvo: link.dataset.ir }); ir(link.dataset.ir); }
  });

  pagina.addEventListener('contextmenu', (ev) => {
    ev.preventDefault();
    abrirMenu(ev.clientX, ev.clientY, [
      { rotulo: 'Recarregar', ao: () => ir(campo.value) },
      'sep',
      { rotulo: 'Inspecionar codigo', ao: () => {
          acao('abrir_inspetor', { url: campo.value });
          const oculto = pagina.dataset.oculto || '';
          dialogo({
            titulo: 'Codigo da pagina', icone: 'info',
            texto: `&lt;!-- comentario deixado por quem programou a pagina --&gt;<br>
                   <b>${oculto}</b><br><br>
                   Todo site tem codigo por tras. Inspecionar mostra o que a tela nao mostra.`
          });
          if (/link-secreto/.test(oculto)) acao('achar_segredo', { url: campo.value, valor: oculto });
        } }
    ], 'pagina:' + campo.value);
  });

  barra.querySelector('[data-ir]').addEventListener('click', () => ir(campo.value));
  campo.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') ir(campo.value); });
  jan.corpo.addEventListener('scroll', () => {
    if (jan.corpo.scrollTop > 30) acao('rolar', { area: 'navegador' });
  }, { passive: true });

  ir(urlInicial);
  return jan;
}
