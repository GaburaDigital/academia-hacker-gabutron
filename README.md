# Academia Hacker GabuTRON

Aplicação web de treinamento em operação de computador para estudantes de 11 a 16 anos.
Roda inteiramente no navegador, sem servidor e sem instalação obrigatória.

O aluno é um cadete treinado por uma IA chamada GabuTRON. Ela passa missões que
só podem ser cumpridas usando um sistema operacional simulado, o **Pinguim 95x**,
que roda dentro da própria página. A temática é sabotagem espacial cômica; o
conteúdo real é uso de mouse, janelas, arquivos, terminal e noções de segurança.

**Publicado em:** https://gaburadigital.github.io/academia-hacker-gabutron/

---

## O que a aplicação treina

| Área | O que o aluno pratica |
|---|---|
| Mouse | clique simples, clique duplo, botão direito, arrastar, seleção múltipla, roda de rolagem, etiquetas ao passar o mouse |
| Janelas | minimizar, maximizar, fechar, mover pela barra de título, barra de tarefas, menu iniciar |
| Arquivos | criar, renomear, mover, copiar, colar, recortar, excluir, lixeira, restaurar, caminhos |
| Teclado | Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+A, F2, Delete, Backspace |
| Terminal | pwd, ls, cd, cat, mkdir, touch, mv, cp, rm, apt, git, ip, ping |
| Rede e sistema | ligar e desligar rede, parear bluetooth, ver hardware, atualizar, reiniciar |
| Segurança | reconhecer golpe por email, senha fraca, anexo suspeito, inspecionar código de página |

Os comandos de terminal são reais e operam sobre o mesmo sistema de arquivos que
as janelas mostram. As ferramentas de "ataque" (`worminator`, `frota-scan`,
`quebra-senha3000`) são fictícias e propositalmente cômicas: a aplicação não
ensina invasão, ela usa a fantasia para forçar o aluno a operar o computador.

---

## Uso em sala

- Requer computador com mouse e teclado. Em aparelho sem ponteiro fino ou tela
  abaixo de 800 pixels a aplicação mostra um aviso e não abre.
- Turnos de 10, 25 ou 60 minutos, ou tempo livre sem cronômetro.
- O progresso das missões **não** é salvo, porque vários alunos usam a mesma
  máquina. Ficam guardados apenas os ajustes e o Placar da Máquina.
- O Placar guarda os 5 melhores codinomes daquele computador e tem botão de zerar.
- Cada aluno pode escrever um codinome em Ajustes antes de começar.
- Som ligado por padrão, com efeitos curtos gerados pelo próprio navegador.
  A voz do GabuTRON só toca quando o aluno clica em Ouvir.

---

## Como adicionar conteúdo

Todo o conteúdo vive em `ATIVIDADES/`. Nada de código precisa mudar.

```
ATIVIDADES/
├── catalogo.json          arquivo que você edita para registrar o que existe
├── missoes/               pacotes de missões (o nome do arquivo vira uma opção)
│   ├── mouse-e-janelas.json
│   ├── arquivos-e-organizacao.json
│   ├── terminal-primeiros-passos.json
│   └── rede-email-e-golpes.json
└── cenarios/              estados iniciais do Pinguim 95x, reutilizáveis
    ├── nave-alpha.json
    ├── estacao-sucata.json
    └── laboratorio-beta.json
```

### 1. Registrar no catálogo

```json
{
  "arquivo": "meu-pacote-novo.json",
  "nome": "Meu Pacote Novo",
  "descricao": "Do que trata este pacote.",
  "dificuldade": "normal",
  "trilhas": ["arquivos", "geral"]
}
```

Cenários novos entram na lista `"cenarios"` do mesmo arquivo.

### 2. Escrever a missão

Uma missão é dado, não código. O verificador compara os eventos que o sistema
simulado emite com a lista de passos.

```json
{
  "id": "a11",
  "dificuldade": "normal",
  "cenario": "nave-alpha",
  "trilhas": ["arquivos"],
  "titulo": "Sabotagem no Refeitório",
  "fala_intro": "Cadete, o robô-cozinheiro serve sopa de parafuso há 400 ciclos...",
  "fala_sucesso": "Amanhã a tripulação almoça poesia.",
  "pontos_base": 60,
  "ordem": "livre",
  "passos": [
    {
      "acao": "renomear",
      "para": "contem:INFECTADA",
      "texto": "Renomear sopa.txt incluindo INFECTADA",
      "dica": "Selecione e aperte F2.",
      "dica2": "Clique uma vez no arquivo, aperte F2, escreva o nome novo e dê Enter."
    },
    {
      "acao": "mover",
      "destino": "/midia/pendrive",
      "texto": "Mover o arquivo para o pendrive",
      "dica": "Arraste até o ícone do pendrive."
    }
  ]
}
```

Campos da missão:

- `id` precisa ser único em todos os pacotes.
- `dificuldade` é `facil`, `normal` ou `dificil`. A regra de bolso é a
  quantidade de passos: 2 a 4 fácil, 5 a 8 normal, 9 ou mais difícil.
- `ordem` aceita `"livre"` para permitir qualquer sequência. Sem esse campo,
  os passos precisam ser feitos na ordem escrita.
- `pontos_base` é opcional; sem ele o valor é 10 por passo.
- `dica` e `dica2` alimentam o sistema de dicas em três níveis. Escreva sempre
  as duas: a primeira aponta a direção, a segunda ensina o clique exato.

Comparação de valores nos passos:

| Escrita | Significado |
|---|---|
| `"receitas"` | precisa ser igual, sem diferenciar maiúsculas |
| `"contem:INFECTADA"` | precisa conter esse trecho |
| `"re:^cd\\s+documentos"` | precisa casar com a expressão regular |
| `"min:10"` | número igual ou maior |
| `"*"` | qualquer valor não vazio |

### 3. Vocabulário de ações

O sistema simulado emite estes eventos. Use o nome exato em `"acao"`.

| Ação | Campos disponíveis |
|---|---|
| `abrir_app`, `fechar_app`, `minimizar` | `app` |
| `maximizar` | `app`, `estado` |
| `duplo_clique`, `selecionar_icone`, `hover_tooltip` | `alvo`, `caminho` |
| `menu_contexto`, `abrir_menu_iniciar`, `menu_iniciar` | `alvo` |
| `navegar_pasta` | `caminho` |
| `selecionar` | `nome`, `caminho`, `quantidade` |
| `abrir_arquivo`, `ler_arquivo`, `copiar_texto` | `caminho`, `nome` |
| `criar_pasta`, `criar_arquivo` | `caminho`, `nome` |
| `renomear` | `caminho`, `nome` (antigo), `para`, `pasta` |
| `mover`, `colar` | `caminho`, `nome`, `destino` |
| `copiar`, `recortar`, `excluir` | `caminho`, `nome` |
| `restaurar` | `nome`, `destino` |
| `esvaziar_lixeira` | `quantidade` |
| `atalho` | `tecla` (`ctrl+c`, `ctrl+v`, `ctrl+x`, `ctrl+a`, `f2`, `delete`) |
| `rolar` | `area` (`explorador`, `email`, `navegador`) |
| `comando_terminal` | `comando`, `pasta` |
| `instalar_pacote` | `pacote` |
| `clonar_repo` | `url`, `nome` |
| `git_pull`, `git_commit`, `git_push` | — |
| `ferramenta_ficticia` | `nome`, `alvo` |
| `ler_email`, `excluir_email` | `id`, `de` |
| `marcar_golpe` | `id`, `de`, `correto` |
| `enviar_email` | `para`, `assunto`, `corpo`, `anexo` |
| `anexar_arquivo` | `caminho`, `nome` |
| `navegar_url`, `abrir_inspetor` | `url` |
| `clicar_link`, `achar_segredo` | `alvo`, `valor` |
| `alternar_rede`, `bluetooth` | `estado` |
| `parear`, `desparear` | `dispositivo` |
| `config_ver` | `secao` |
| `atualizar_sistema`, `reiniciar`, `ler_manual`, `mover_janela` | — |

### 4. Criar um cenário

```json
{
  "id": "minha-nave",
  "nome": "Minha Nave",
  "rede": true,
  "bluetooth": false,
  "atualizado": false,
  "icones": ["computador", "explorador", "terminal", "email", "lixeira"],
  "arvore": [
    { "nome": "lar", "tipo": "pasta", "filhos": [
      { "nome": "cadete", "tipo": "pasta", "filhos": [
        { "nome": "notas.txt", "tipo": "arquivo", "conteudo": "texto do arquivo" }
      ]}
    ]}
  ],
  "emails": [
    { "id": "x1", "de": "alguem@frota.orb", "assunto": "Assunto",
      "corpo": "Texto da mensagem.", "golpe": false }
  ]
}
```

Ícones de arquivo disponíveis: `arquivo`, `imagem`, `pacote`, `executavel`, `pasta`.
Ícones de área de trabalho: qualquer chave de `APPS` em `js/apps/index.js`.
A pasta `/lixeira` é criada sozinha. Marque `"protegido": true` no que não pode
ser apagado nem renomeado.

### 5. Publicar a atualização

Depois de mudar qualquer arquivo, abra `sw.js` e incremente a constante `VERSAO`
(por exemplo de `gabutron-v1` para `gabutron-v2`). Sem isso, quem já abriu a
aplicação antes continua vendo a versão guardada em cache. Se você acrescentou
arquivos novos em `ATIVIDADES/`, adicione o caminho deles na lista `ARQUIVOS` do
mesmo `sw.js` para que continuem funcionando offline.

---

## Estrutura do código

```
index.html              casca da Academia e contêiner do Pinguim 95x
manifest.webmanifest    dados de instalação como aplicativo
sw.js                   funcionamento offline

css/core.css            variáveis, reset, rodapé, componentes comuns
css/shell.css           interface da Academia: boot, GabuTRON, painéis
css/p95.css             Pinguim 95x, todo escopado em #p95
css/themes.css          modo claro (muda só a casca, de propósito)

js/bus.js               barramento de eventos
js/vfs.js               sistema de arquivos virtual
js/wm.js                gerenciador de janelas e diálogos
js/ctxmenu.js           menu de botão direito
js/p95.js               área de trabalho, barra de tarefas, menu iniciar
js/gabutron.js          rosto ASCII, fala, humores
js/mission.js           carrega, sorteia, monta cenário e verifica missões
js/score.js             pontuação da sessão e Placar da Máquina
js/settings.js          preferências no navegador
js/sound.js             bipes gerados por Web Audio e voz opcional
js/icons.js             dois conjuntos de ícones SVG, um para cada estética
js/boot.js              sequência de inicialização
js/main.js              liga tudo
js/apps/                explorador, terminal, email, navegador, configurações
```

O ponto central do desenho é que os aplicativos não conhecem as missões. Eles
apenas publicam no barramento o que o aluno fez. O verificador escuta. Por isso
missão nova é arquivo JSON, não código.

A casca e o Pinguim 95x usam conjuntos de estilo e de ícones separados de
propósito: o aluno precisa perceber que a caixa cinza do meio é o computador
que ele está operando, e não a página inteira. O modo claro muda apenas a casca
para preservar esse contraste.

---

## Para desenvolver localmente

Como a aplicação usa módulos ES e carrega JSON por `fetch`, abrir o
`index.html` direto do disco não funciona. Suba um servidor local:

```bash
python3 -m http.server 8000
```

E abra `http://localhost:8000`.

---

## Compatibilidade

Testado em Chrome e Safari em computador. Requer navegador com suporte a
módulos ES, Web Audio e service worker. A voz do GabuTRON depende de haver uma
voz em português instalada no sistema; quando não há, a aplicação avisa e segue
funcionando com o texto na tela.

---

## Licença

MIT.

---

Criado por GABURA. Mais exercícios em
https://sites.google.com/view/links-gabura
