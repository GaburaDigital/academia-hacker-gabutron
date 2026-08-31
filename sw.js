/* Service worker.
   Ao publicar uma atualizacao, mude a VERSAO abaixo.
   Isso e o suficiente para o navegador buscar tudo de novo. */

const VERSAO = 'gabutron-v3';

const ARQUIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/core.css',
  './css/shell.css',
  './css/p95.css',
  './css/themes.css',
  './js/main.js',
  './js/bus.js',
  './js/boot.js',
  './js/settings.js',
  './js/sound.js',
  './js/icons.js',
  './js/vfs.js',
  './js/wm.js',
  './js/ctxmenu.js',
  './js/p95.js',
  './js/gabutron.js',
  './js/mission.js',
  './js/score.js',
  './js/diploma.js',
  './js/apps/index.js',
  './js/apps/explorador.js',
  './js/apps/terminal.js',
  './js/apps/email.js',
  './js/apps/navegador.js',
  './js/apps/config95.js',
  './js/apps/desenho.js',
  './js/apps/ftp.js',
  './js/apps/utilitarios.js',
  './js/apps/interrupcoes.js',
  './assets/icons/favicon.svg',
  './assets/icons/icon-512.svg',
  './assets/icons/icon-maskable.svg',
  './assets/cursors/seta.svg',
  './assets/cursors/mao.svg',
  './assets/cursors/ocupado.svg',
  './assets/cursors/bloqueado.svg',
  './assets/cursors/cruz.svg',
  './assets/cursors/texto.svg',
  './ATIVIDADES/catalogo.json',
  './ATIVIDADES/missoes/mouse-e-janelas.json',
  './ATIVIDADES/missoes/arquivos-e-organizacao.json',
  './ATIVIDADES/missoes/terminal-primeiros-passos.json',
  './ATIVIDADES/missoes/rede-email-e-golpes.json',
  './ATIVIDADES/missoes/desenho-e-documentos.json',
  './ATIVIDADES/missoes/transmissao-e-servidores.json',
  './ATIVIDADES/missoes/pacotes-e-manutencao.json',
  './ATIVIDADES/missoes/missoes-chefe.json',
  './ATIVIDADES/missoes/primeiros-cliques.json',
  './ATIVIDADES/missoes/teclado-e-atalhos.json',
  './ATIVIDADES/missoes/investigacao-e-web.json',
  './ATIVIDADES/missoes/operacoes-finais.json',
  './ATIVIDADES/cenarios/nave-alpha.json',
  './ATIVIDADES/cenarios/estacao-sucata.json',
  './ATIVIDADES/cenarios/laboratorio-beta.json',
  './ATIVIDADES/cenarios/oficina-orbital.json'
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(
    caches.open(VERSAO)
      .then(c => Promise.allSettled(ARQUIVOS.map(a => c.add(a))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys()
      .then(nomes => Promise.all(nomes.filter(n => n !== VERSAO).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (ev) => {
  if (ev.request.method !== 'GET') return;
  ev.respondWith(
    caches.match(ev.request).then(guardado => {
      if (guardado) return guardado;
      return fetch(ev.request).then(resp => {
        const copia = resp.clone();
        caches.open(VERSAO).then(c => c.put(ev.request, copia)).catch(() => {});
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
