[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/jOw_Hzd7)

# Almoxarifado - Enfermagem

Aplicativo mobile para controle de insumos médicos do almoxarifado de enfermagem.

## Objetivo do sistema

Modernizar o controle de insumos médicos do almoxarifado por meio de uma interface mobile conectada a uma API. O sistema permite consultar o inventário em tempo real, cadastrar novos materiais, registrar retiradas de estoque e excluir itens de forma simples e segura.

## Tecnologias utilizadas

- **React Native** — interface mobile
- **Expo** — execução e desenvolvimento do app
- **React** — gerenciamento de estado e componentes
- **Fetch API** — comunicação com a MockAPI
- **Jest** e **React Native Testing Library** — testes automatizados

## Como executar

1. Instale as dependências:

```bash
npm install
```

2. Inicie o projeto:

```bash
npm start
```

3. Escolha a plataforma desejada no terminal do Expo ou use:

```bash
npm run android
npm run ios
npm run web
```

4. Para executar os testes:

```bash
npm test
```

## Endpoint da MockAPI

Base URL dos materiais:

```
http://6a2b3e66b687a7d5cbc501c6.mockapi.io/materiais
```

| Método | Descrição |
|--------|-----------|
| `GET`  | Lista todos os materiais cadastrados |
| `POST` | Cadastra um novo material (`nome`, `quantidade`) |
| `PUT`  | Atualiza a quantidade de um material após retirada (`/materiais/{id}`) |
| `DELETE` | Remove um material do inventário (`/materiais/{id}`) |

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
- Tratamento básico de erros nas requisições `GET` e `POST` com `try/catch` e `console.error`

### Retirada de materiais (baixa de estoque)

- Campo `input-retirada` em cada item da lista para informar a quantidade a retirar
- Estado `retiradas` para armazenar o valor digitado por material
- Botão `btn-baixar` em cada card para confirmar a baixa
- Validação com `validarRetirada` antes de qualquer atualização
- Cancelamento da operação quando a validação falha, sem alterar estado nem chamar a API
- Atualização da quantidade via requisição `PUT` na MockAPI
- Limpeza do input de retirada e sincronização da lista após sucesso
- Impossibilidade de estoque negativo: retiradas inválidas são bloqueadas antes do `PUT`

### Exclusão de materiais

- Botão `btn-excluir` em cada item da lista
- Remoção do material via requisição `DELETE` na MockAPI
- Atualização da lista exibida após exclusão bem-sucedida
- Tratamento de erros na requisição `DELETE` com `try/catch` e `console.error`
