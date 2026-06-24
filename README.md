[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/jOw_Hzd7)

# Almoxarifado - Enfermagem

## Descrição do sistema

Aplicativo mobile desenvolvido para o controle de insumos médicos do almoxarifado de enfermagem. O sistema conecta-se a uma API REST (MockAPI) e permite gerenciar o inventário de materiais de forma prática e segura.

Principais recursos:

- Consulta do inventário em tempo real
- Cadastro de novos materiais
- Busca dinâmica por nome
- Totalizador de itens exibidos na lista
- Retirada de estoque com validação de regras de negócio
- Exclusão de materiais
- Indicador visual de estoque crítico (quantidade menor que 10 unidades)
- Tratamento de erros de rede com mensagens amigáveis ao usuário

## Tecnologias utilizadas

- **React Native** — construção da interface mobile
- **Expo** — ambiente de desenvolvimento e execução do aplicativo
- **React** — gerenciamento de estado e componentes
- **Fetch API** — comunicação HTTP com a MockAPI
- **@expo/vector-icons** — ícones da interface
- **Jest** e **React Native Testing Library** — testes automatizados

## Instalação

Pré-requisitos:

- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- npm (incluído com o Node.js)
- [Expo Go](https://expo.dev/go) no dispositivo móvel (opcional, para testes em aparelho físico)

Passos:

1. Clone o repositório e acesse a pasta do projeto:

```bash
git clone <url-do-repositorio>
cd prova-2b-dev-mobile-SrLinku
```

2. Instale as dependências:

```bash
npm install
```

## Como executar via Expo

1. Inicie o servidor de desenvolvimento:

```bash
npm start
```

2. Com o Expo em execução, escolha uma das opções:

- Escaneie o QR Code com o app **Expo Go** (Android ou iOS)
- Pressione `a` no terminal para abrir no emulador Android
- Pressione `i` no terminal para abrir no simulador iOS
- Pressione `w` no terminal para abrir no navegador (web)

Também é possível iniciar diretamente em uma plataforma:

```bash
npm run android
npm run ios
npm run web
```

3. Para executar os testes automatizados:

```bash
npm test
```

## Endpoint da MockAPI

Base URL utilizada pelo aplicativo:

```
http://6a2b3e66b687a7d5cbc501c6.mockapi.io/materiais
```

| Método   | Rota                    | Descrição                                              |
|----------|-------------------------|--------------------------------------------------------|
| `GET`    | `/materiais`            | Lista todos os materiais cadastrados                   |
| `POST`   | `/materiais`            | Cadastra um novo material (`nome`, `quantidade`)       |
| `PUT`    | `/materiais/{id}`       | Atualiza a quantidade de um material após retirada     |
| `DELETE` | `/materiais/{id}`       | Remove um material do inventário                       |

## Regras de negócio

As validações de retirada ficam isoladas em `src/utils/validacoes.js`, exportando a função pura `validarRetirada(estoqueAtual, quantidadeRetirada)`.

A função retorna `true` quando a retirada é válida e `false` nos seguintes casos:

- quantidade de retirada maior que o estoque disponível
- quantidade de retirada negativa ou igual a zero
- estoque atual negativo

## Funcionalidades implementadas

### Inventário e cadastro

- Carregamento automático da lista de materiais ao abrir o app
- Formulário de cadastro com campos de nome e quantidade
- Validação básica que impede envio com campos vazios
- Cadastro de material via requisição `POST`
- Limpeza dos inputs após cadastro bem-sucedido
- Atualização da lista após o cadastro
- Exibição dos materiais em `FlatList` com nome, quantidade, tipo e validade
- Indicador de carregamento (`ActivityIndicator`) durante requisições

### Busca e totalizador

- Campo de busca em tempo real por nome do material (sem distinção de maiúsculas/minúsculas)
- Totalizador de itens exibidos após aplicação do filtro

### Retirada de materiais (baixa de estoque)

- Campo `input-retirada` em cada item da lista para informar a quantidade a retirar
- Estado `retiradas` para armazenar o valor digitado por material
- Botão `btn-baixar` em cada card para confirmar a baixa
- Validação com `validarRetirada` antes de qualquer atualização
- Cancelamento da operação quando a validação falha, sem alterar estado nem chamar a API
- Atualização da quantidade via requisição `PUT` na MockAPI
- Limpeza do input de retirada e sincronização da lista após sucesso

### Exclusão de materiais

- Botão `btn-excluir` em cada item da lista
- Remoção do material via requisição `DELETE` na MockAPI
- Atualização da lista exibida após exclusão bem-sucedida

### Alertas visuais e tratamento de erros

- Destaque visual para itens com estoque crítico (quantidade menor que 10)
- `accessibilityLabel="estoque-critico"` nos cards em situação crítica
- Tratamento de erros em todas as requisições (`GET`, `POST`, `PUT`, `DELETE`) com `try/catch`
- Logs técnicos via `console.error`
- Mensagens amigáveis ao usuário com `Alert.alert` em falhas de conexão
