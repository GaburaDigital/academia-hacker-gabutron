/* Camada didatica.
   Um lugar so para responder duas perguntas:
   - o que o aluno praticou nesta missao (aviso de parabens)
   - como explicar uma acao para quem pede dica de novo (dicas progressivas)

   A dica curta continua vindo do JSON da missao. O que esta aqui e o socorro
   para quem pediu ajuda mais de uma vez: primeiro o conceito, depois a receita
   passo a passo. Assim quem gosta de procurar sozinho nao perde a graca. */

export const HABILIDADES = {
  duplo_clique: 'abrir programas e pastas com clique duplo',
  selecionar_icone: 'selecionar com um clique so',
  selecionar: 'selecionar arquivos com o mouse',
  hover_tooltip: 'passar o mouse para ler a etiqueta de um icone',
  menu_contexto: 'usar o botao direito do mouse',
  abrir_menu_iniciar: 'usar o menu Iniciar',
  menu_iniciar: 'achar programas pelo menu Iniciar',
  rolar: 'usar a roda do mouse para rolar a tela',
  mover_janela: 'arrastar uma janela pela barra de titulo',
  minimizar: 'minimizar janela e traze-la de volta pela barra de tarefas',
  maximizar: 'maximizar janela',
  fechar_app: 'fechar janela',
  abrir_app: 'abrir programas',
  navegar_pasta: 'navegar entre pastas',
  abrir_arquivo: 'abrir arquivos',
  ler_arquivo: 'ler o conteudo de um arquivo',
  criar_pasta: 'criar pastas para organizar arquivos',
  criar_arquivo: 'criar arquivos',
  renomear: 'renomear arquivos e pastas',
  mover: 'mover arquivos de uma pasta para outra',
  copiar: 'copiar arquivos',
  recortar: 'recortar arquivos',
  colar: 'colar arquivos no lugar de destino',
  copiar_texto: 'selecionar e copiar texto com o mouse',
  editar_texto: 'escrever e editar um documento',
  salvar_arquivo: 'salvar um documento',
  salvar_desenho: 'salvar um desenho como arquivo',
  desenhar: 'arrastar com o botao do mouse pressionado',
  excluir: 'enviar arquivos para a lixeira',
  restaurar: 'recuperar arquivos da lixeira',
  esvaziar_lixeira: 'esvaziar a lixeira e entender que isso nao tem volta',
  atalho: 'atalhos de teclado',
  comando_terminal: 'comandos no terminal',
  instalar_pacote: 'instalar programas',
  remover_pacote: 'desinstalar programas',
  clonar_repo: 'clonar um repositorio',
  git_pull: 'atualizar um repositorio',
  git_commit: 'registrar mudancas num repositorio',
  git_push: 'enviar mudancas para um repositorio',
  ferramenta_ficticia: 'rodar um programa pelo terminal',
  enviar_email: 'enviar mensagens',
  anexar_arquivo: 'mandar arquivo em anexo',
  ler_email: 'ler a caixa de entrada',
  marcar_golpe: 'reconhecer mensagem falsa e golpe',
  excluir_email: 'apagar mensagens',
  navegar_url: 'digitar endereco no navegador',
  clicar_link: 'navegar por links',
  abrir_inspetor: 'inspecionar o codigo de uma pagina',
  achar_segredo: 'seguir pistas escondidas numa pagina',
  ftp_conectar: 'conectar a um servidor com usuario e senha',
  ftp_enviar: 'enviar arquivo para um servidor',
  ftp_baixar: 'baixar arquivo de um servidor',
  ftp_falha: 'entender por que um acesso foi negado',
  alternar_rede: 'ligar e desligar a rede',
  bluetooth: 'ligar e desligar o bluetooth',
  parear: 'parear um aparelho por bluetooth',
  desparear: 'desconectar um aparelho',
  config_ver: 'ver as informacoes tecnicas do computador',
  atualizar_sistema: 'atualizar o sistema',
  reiniciar: 'reiniciar o computador',
  ler_manual: 'consultar o manual em vez de adivinhar',
  fechar_popup: 'fechar janela intrometida sem clicar na isca'
};

/* Nivel 3 da dica: o conceito. Nivel 4: a receita, clique a clique. */
export const EXPLICACOES = {
  mover: {
    conceito: 'Mover quer dizer tirar o arquivo de uma pasta e deixar ele em outra. ' +
      'Ele nao fica nos dois lugares: sai de um e entra no outro.',
    receita: 'Dois caminhos. O primeiro: clique no arquivo, segure o botao esquerdo, ' +
      'arraste ate a pasta de destino e so entao solte. O segundo, mais seguro: clique ' +
      'no arquivo, aperte Ctrl+X para recortar, entre na pasta de destino e aperte Ctrl+V ' +
      'para colar. Se o destino comeca com barra, e um caminho: use o botao Acima ate ' +
      'chegar na raiz e va descendo pelas pastas.'
  },
  colar: {
    conceito: 'Colar so funciona depois de copiar ou recortar. E preciso estar dentro ' +
      'da pasta de destino na hora de colar.',
    receita: 'Entre na pasta de destino primeiro, clique num espaco vazio dela e aperte ' +
      'Ctrl+V. Tambem da para clicar com o botao direito no vazio e escolher Colar.'
  },
  copiar: {
    conceito: 'Copiar deixa o arquivo onde esta e prepara uma copia para ser colada em ' +
      'outro lugar. Depois de copiar, nada acontece ate voce colar.',
    receita: 'Clique uma vez no arquivo para selecionar e aperte Ctrl+C. Depois entre na ' +
      'pasta de destino e aperte Ctrl+V.'
  },
  recortar: {
    conceito: 'Recortar e o mesmo que copiar, mas o arquivo sai do lugar de origem quando ' +
      'voce colar.',
    receita: 'Clique uma vez no arquivo e aperte Ctrl+X. Entre na pasta de destino e ' +
      'aperte Ctrl+V.'
  },
  renomear: {
    conceito: 'Renomear muda so o nome. O conteudo do arquivo continua igual.',
    receita: 'Clique UMA vez no arquivo para selecionar. Aperte a tecla F2, na fileira de ' +
      'cima do teclado. O nome fica editavel: escreva o nome novo e aperte Enter. ' +
      'Tambem funciona clicando com o botao direito e escolhendo Renomear.'
  },
  criar_pasta: {
    conceito: 'Pasta e uma gaveta para guardar arquivos. Ela e criada dentro da pasta em ' +
      'que voce esta no momento, entao entre no lugar certo antes.',
    receita: 'Dentro do Explorador, confira o caminho na barra de cima. Clique com o botao ' +
      'direito num espaco vazio da lista, escolha Nova pasta, escreva o nome e aperte Enter.'
  },
  excluir: {
    conceito: 'Excluir manda para a lixeira. O arquivo continua existindo ate a lixeira ' +
      'ser esvaziada.',
    receita: 'Clique uma vez no arquivo e aperte a tecla Delete. Ou botao direito e Excluir. ' +
      'Confirme na janela que aparece.'
  },
  restaurar: {
    conceito: 'Restaurar traz de volta o que estava na lixeira, para o lugar de onde saiu.',
    receita: 'Abra a Lixeira, clique uma vez no arquivo para selecionar e use o botao ' +
      'Restaurar selecionado, na barra de cima da janela.'
  },
  esvaziar_lixeira: {
    conceito: 'Esvaziar apaga tudo de vez. Depois disso nao existe jeito de recuperar.',
    receita: 'Abra a Lixeira e use o botao Esvaziar lixeira, na barra de cima. Confirme.'
  },
  navegar_pasta: {
    conceito: 'Cada pasta tem um endereco, chamado caminho, que aparece na barra de cima ' +
      'do Explorador. Ele comeca na barra e desce pelas pastas.',
    receita: 'Para entrar numa pasta, de dois cliques rapidos nela. Para voltar uma pasta, ' +
      'use o botao Acima ou a tecla Backspace. Compare o que esta na barra de cima com o ' +
      'caminho que a missao pediu.'
  },
  abrir_arquivo: {
    conceito: 'Abrir um arquivo mostra o conteudo dele. Documento de texto abre no Bloco ' +
      'de Notas, onde da para escrever.',
    receita: 'Ache o arquivo no Explorador e de dois cliques rapidos nele, sem mover o ' +
      'mouse entre os cliques.'
  },
  editar_texto: {
    conceito: 'Editar e escrever dentro de um documento ja existente. O texto so muda de ' +
      'verdade no arquivo depois que voce salva.',
    receita: 'Com o documento aberto no Bloco de Notas, clique dentro da area branca para ' +
      'o cursor piscar ali. Use as setas ou o clique para chegar onde quer escrever. ' +
      'Para acrescentar uma linha no fim, clique depois da ultima palavra e aperte Enter.'
  },
  salvar_arquivo: {
    conceito: 'Salvar grava no computador o que voce escreveu. Sem salvar, o texto se perde.',
    receita: 'No Bloco de Notas, clique em Salvar na barra de cima. Se o documento for novo, ' +
      'ele pede o nome: escreva com a terminacao .txt e confirme.'
  },
  salvar_desenho: {
    conceito: 'Salvar transforma o desenho da tela num arquivo de imagem dentro do computador.',
    receita: 'No Pinguim Pincel, clique em Salvar como na barra de cima, escreva o nome ' +
      'terminando em .png e confirme. O arquivo vai para /lar/cadete/imagens.'
  },
  desenhar: {
    conceito: 'Desenhar exige manter o botao do mouse pressionado enquanto move.',
    receita: 'Coloque o ponteiro na area branca, aperte o botao esquerdo e NAO solte. ' +
      'Mova o mouse com o botao ainda apertado. Solte so quando terminar o traco.'
  },
  duplo_clique: {
    conceito: 'Um clique seleciona. Dois cliques abrem. Sao coisas diferentes.',
    receita: 'Aponte no icone, clique duas vezes rapido com o botao esquerdo e nao mova o ' +
      'mouse entre os dois cliques. Se abrir so a selecao, foi devagar demais.'
  },
  menu_contexto: {
    conceito: 'O botao direito abre uma lista com o que da para fazer com aquele item.',
    receita: 'Coloque o ponteiro exatamente em cima do item e clique com o botao direito, ' +
      'o do outro lado do que voce usa normalmente. A lista aparece ali mesmo.'
  },
  hover_tooltip: {
    conceito: 'Etiqueta e o nome completo que aparece quando o mouse fica parado sobre um icone.',
    receita: 'Encoste o ponteiro no icone e nao clique. Espere cerca de um segundo sem ' +
      'mover o mouse. A etiqueta aparece sozinha.'
  },
  rolar: {
    conceito: 'Rolar mostra o que nao coube na tela. Existe conteudo abaixo do que voce ve.',
    receita: 'Coloque o ponteiro dentro da area que quer rolar e gire a rodinha do meio do ' +
      'mouse para baixo. Sem rodinha, arraste a barra cinza da lateral direita.'
  },
  atalho: {
    conceito: 'Atalho e apertar duas teclas juntas: uma segurando e outra batendo.',
    receita: 'Segure a tecla Ctrl com um dedo e, sem soltar, bata na letra. Nao e apertar ' +
      'uma depois da outra. Ctrl+C copia, Ctrl+X recorta, Ctrl+V cola, Ctrl+A seleciona tudo. ' +
      'F2 renomeia e Delete manda para a lixeira, essas duas sozinhas.'
  },
  selecionar: {
    conceito: 'Selecionar marca em qual item a proxima acao vai valer.',
    receita: 'Um clique marca um item. Para marcar varios, clique no primeiro, segure a ' +
      'tecla Ctrl e clique nos outros. Para marcar todos, aperte Ctrl+A.'
  },
  comando_terminal: {
    conceito: 'No terminal voce escreve o que quer em vez de clicar. O texto so vale depois ' +
      'de apertar Enter.',
    receita: 'Clique dentro da area preta do terminal para o cursor piscar. Digite o comando ' +
      'exatamente como esta escrito na dica, com os espacos no lugar, e aperte Enter. ' +
      'Se errar, digite ajuda e aperte Enter para ver a lista de comandos.'
  },
  clonar_repo: {
    conceito: 'Repositorio e uma pasta com historico de mudancas. Clonar traz uma copia dele ' +
      'para o seu computador.',
    receita: 'No terminal escreva git clone, um espaco, e o endereco do repositorio. ' +
      'Depois use ls para ver a pasta nova que apareceu.'
  },
  instalar_pacote: {
    conceito: 'Instalar coloca um programa novo no computador. Da para fazer pela janela ou ' +
      'pelo terminal: os dois caminhos levam ao mesmo lugar.',
    receita: 'Pela janela: abra a Central de Pacotes, escreva parte do nome na busca e clique ' +
      'em Instalar. Pelo terminal: escreva apt install e o nome do pacote.'
  },
  remover_pacote: {
    conceito: 'Remover tira o programa do computador e libera espaco.',
    receita: 'Abra a Central de Pacotes, ache o programa na lista e clique em Remover. ' +
      'O botao so aparece assim quando ele ja esta instalado.'
  },
  enviar_email: {
    conceito: 'Enviar mensagem precisa de um destinatario. O campo Para tem que ter o ' +
      'endereco escrito exatamente igual.',
    receita: 'Abra o Correio Orbital e clique em Nova mensagem. No campo Para escreva o ' +
      'endereco que a missao pediu, letra por letra. Preencha o assunto e clique em Enviar.'
  },
  anexar_arquivo: {
    conceito: 'Anexo e um arquivo que vai junto com a mensagem.',
    receita: 'Em Nova mensagem, ache o campo Anexo. Ele e uma lista: clique nela e procure ' +
      'o arquivo pelo caminho. Escolha e depois clique em Enviar.'
  },
  marcar_golpe: {
    conceito: 'Mensagem de golpe costuma ter pressa, premio facil, erro de escrita, remetente ' +
      'estranho e pedido de senha.',
    receita: 'No Correio Orbital, clique com o botao direito em cima da mensagem suspeita e ' +
      'escolha Marcar como golpe.'
  },
  ler_email: {
    conceito: 'Ler abre o conteudo da mensagem na parte de baixo da janela.',
    receita: 'Abra o Correio Orbital e clique uma vez na mensagem da lista de cima. ' +
      'O texto aparece embaixo.'
  },
  navegar_url: {
    conceito: 'Endereco e o nome do site. Digitado errado, a pagina nao abre, e isso nao ' +
      'e defeito nem virus.',
    receita: 'No Orbital Explorer, clique na caixa de endereco em cima, apague o que estiver ' +
      'la, escreva o endereco exatamente como a missao pediu e aperte Enter.'
  },
  abrir_inspetor: {
    conceito: 'Inspecionar mostra o codigo por tras da pagina, onde as vezes ha comentarios ' +
      'que nao aparecem na tela.',
    receita: 'Com a pagina aberta, clique com o botao direito em cima do texto dela e escolha ' +
      'Inspecionar codigo.'
  },
  ftp_conectar: {
    conceito: 'Servidor e um computador em outro lugar. Para entrar e preciso credencial: ' +
      'usuario e senha.',
    receita: 'Abra o Transmissor Orbital, escolha o servidor na lista, escreva a senha no ' +
      'campo Senha e clique em Conectar. Se a rede estiver desligada, ligue antes nas ' +
      'Configuracoes do Sistema.'
  },
  ftp_enviar: {
    conceito: 'Enviar leva um arquivo do seu computador para o servidor.',
    receita: 'Conectado, clique uma vez no arquivo da lista da ESQUERDA, que e a sua, e ' +
      'depois no botao Enviar, no meio da janela.'
  },
  ftp_baixar: {
    conceito: 'Baixar traz um arquivo do servidor para o seu computador.',
    receita: 'Conectado, clique uma vez no arquivo da lista da DIREITA, que e a do servidor, ' +
      'e depois no botao Baixar, no meio da janela. Ele chega em /lar/cadete/documentos.'
  },
  alternar_rede: {
    conceito: 'Sem rede, nenhum programa que fala com outro computador funciona.',
    receita: 'Abra as Configuracoes do Sistema, fique na aba Rede e clique no botao Conectar.'
  },
  bluetooth: {
    conceito: 'Bluetooth conecta aparelhos que estao perto, como fone e teclado. Rede e ' +
      'para longe, bluetooth e para perto.',
    receita: 'Configuracoes do Sistema, aba Bluetooth, botao Ligar radio.'
  },
  parear: {
    conceito: 'Parear e apresentar dois aparelhos um ao outro para que passem a se reconhecer.',
    receita: 'Com o radio ligado, ache o aparelho na lista e clique em Parear na linha dele.'
  },
  config_ver: {
    conceito: 'A ficha tecnica diz o que a maquina tem dentro e ajuda a entender por que ' +
      'ela esta lenta.',
    receita: 'Configuracoes do Sistema, aba Sobre o computador.'
  },
  atualizar_sistema: {
    conceito: 'Atualizar corrige falhas e fecha brechas de seguranca.',
    receita: 'Configuracoes do Sistema, aba Manutencao, botao Atualizar sistema.'
  },
  reiniciar: {
    conceito: 'Reiniciar desliga e liga o sistema, encerrando tudo que estava aberto.',
    receita: 'Configuracoes do Sistema, aba Manutencao, botao Reiniciar computador, e confirme.'
  },
  abrir_app: {
    conceito: 'Programa se abre pelo icone da area de trabalho ou pelo menu Iniciar.',
    receita: 'De dois cliques rapidos no icone da area de trabalho. Ou clique no botao ' +
      'Iniciar, escreva parte do nome na busca e clique no programa na lista.'
  },
  minimizar: {
    conceito: 'Minimizar esconde a janela sem fechar. Ela continua aberta na barra de baixo.',
    receita: 'Clique no primeiro dos tres botoes do canto de cima da janela, o do tracinho baixo. ' +
      'Para trazer de volta, clique no nome da janela na barra de tarefas.'
  },
  maximizar: {
    conceito: 'Maximizar faz a janela ocupar a tela toda do sistema.',
    receita: 'Clique no botao do meio, com o quadradinho, no canto de cima da janela.'
  },
  fechar_app: {
    conceito: 'Fechar encerra o programa. Diferente de minimizar, que so esconde.',
    receita: 'Clique no botao X, o ultimo dos tres no canto de cima da janela.'
  }
};

/* Lista, sem repetir, o que a missao fez o aluno praticar. */
export function habilidadesDaMissao(missao) {
  if (Array.isArray(missao.praticou) && missao.praticou.length) return missao.praticou;
  const vistas = new Set();
  const lista = [];
  for (const passo of missao.passos) {
    const texto = HABILIDADES[passo.acao];
    if (texto && !vistas.has(texto)) { vistas.add(texto); lista.push(texto); }
  }
  return lista;
}

/* Traduz os campos do passo em alvos concretos: nome do arquivo, pasta, endereco. */
export function alvosDoPasso(passo) {
  const limpo = (v) => String(v).replace(/^contem:/, '').replace(/^re:/, '').replace(/^min:/, '');
  const partes = [];
  if (passo.nome && passo.nome !== '*') partes.push('o item procurado tem "' + limpo(passo.nome) + '" no nome');
  if (passo.para) partes.push('o nome novo precisa conter "' + limpo(passo.para) + '"');
  if (passo.destino && passo.destino !== '*') partes.push('a pasta de destino e ' + limpo(passo.destino));
  if (passo.caminho && passo.caminho !== '*') partes.push('o caminho envolvido e ' + limpo(passo.caminho));
  if (passo.app) partes.push('o programa e o ' + passo.app);
  if (passo.alvo) partes.push('o alvo e ' + limpo(passo.alvo));
  if (passo.para && passo.acao === 'enviar_email') partes.push('o destinatario e ' + passo.para);
  if (passo.pacote) partes.push('o pacote se chama ' + passo.pacote);
  if (passo.servidor) partes.push('o servidor e ' + passo.servidor);
  if (passo.url) partes.push('o endereco e ' + limpo(passo.url));
  if (passo.tecla) partes.push('o atalho e ' + String(passo.tecla).toUpperCase());
  if (passo.comando) partes.push('e um comando de terminal');
  if (passo.dispositivo) partes.push('o aparelho e o ' + passo.dispositivo);
  if (passo.anexo) partes.push('o anexo precisa ser ' + passo.anexo);
  return partes;
}

export function conceitoDe(passo) { return EXPLICACOES[passo.acao]?.conceito || null; }
export function receitaDe(passo) { return EXPLICACOES[passo.acao]?.receita || null; }
