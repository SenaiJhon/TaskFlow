## 🚀 TaskFlow Solutions: Gerenciador de Tarefas CRUD 

Este projeto é uma aplicação web completa de gerenciamento de tarefas, implementando o padrão **CRUD (Criar, Ler, Atualizar e Excluir)** e recursos de ordenação. O projeto é estruturado em duas camadas principais: um **Back-end (API REST)** em Node.js com Express e MySQL, e um **Front-end** simples em HTML, CSS e JavaScript puro (Vanilla JS).

-----

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Propósito |
| :--- | :--- | :--- |
| **Back-end** | **Node.js** | Ambiente de execução do servidor. |
| **API** | **Express.js** | Framework web para construir a API REST. |
| **Banco de Dados** | **MySQL** | Sistema de gerenciamento de banco de dados para persistência dos dados. |
| **Driver MySQL** | `mysql2` | Conexão e interação com o MySQL. |
| **Front-end** | **HTML5/CSS3/JS** | Interface do usuário e lógica de manipulação do DOM. |
| **Comunicação** | **Fetch API** | Comunicação assíncrona (AJAX) entre o Front-end e o Back-end. |

-----

## ✨ Requisitos Funcionais Implementados

O projeto atende a todos os requisitos solicitados, incluindo melhorias na experiência do usuário (UX):

| Requisito | Funcionalidade | Implementação |
| :--- | :--- | :--- |
| **R1** | Adicionar Tarefa | Rota `POST /tasks` e formulário de criação. |
| **R2** | Exibir Tarefas | Rota `GET /tasks` e renderização dinâmica (`app.js`). |
| **R3** | Editar Tarefa | Rota `PUT /tasks/:id` e modo de edição no item da lista. |
| **R4** | Concluir Tarefa | Rota `PUT /tasks/:id/done` para alterar o status. |
| **R5** | Remover Tarefa | Rota `DELETE /tasks/:id`. |
| **R6** | Ordenação | Parâmetro `?sort=date` na rota GET, ordenando por data prevista. |
| **R (UX)**| Confirmação | **Modal Customizado** em JavaScript (`showCustomConfirm`), substituindo o `window.confirm()` nativo. |

-----

## ⚙️ Configuração e Execução

### 1\. Estrutura do Projeto

O projeto é modularizado, separando Front-end e Back-end em diretórios distintos:

```
TaskFlow-Solutions/
├── backend/                  # API REST
│   ├── node_modules/         # Dependências do Node.js
│   ├── server.js             # Lógica principal da API e conexão DB
│   ├── package.json          
│   ├── dados.json            # Base de dados (JSON, para referência)
│   └── database.sql          # Script SQL para criação da tabela e inserts iniciais
└── frontend/                 # Interface do Usuário
    ├── index.html            # Estrutura HTML
    ├── style.css             # Estilização
    └── app.js                # Lógica de Interação
```

### 2\. Configuração do Banco de Dados

1.  Certifique-se de que o **MySQL** esteja instalado e em execução.
2.  Crie o banco de dados chamado `TaskFlow`.
3.  Utilize o script **`backend/database.sql`** para criar a tabela `tasks` e popular o banco com dados iniciais.
4.  No arquivo **`backend/server.js`**, ajuste as credenciais de conexão do MySQL se necessário:
    ```javascript
    const connection = mysql2.createConnection({
        host: 'localhost', 
        user: 'root',      
        password:'sua_senha_aqui', // <-- ATUALIZE
        database:'TaskFlow'
    })
    ```

### 3\. Execução do Back-end (API)

1.  Navegue até o diretório **`backend`**:
    ```bash
    cd backend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie o servidor Node.js:
    ```bash
    node server.js
    ```
    O servidor será iniciado na porta **3030**.

### 4\. Acesso ao Front-end

1.  Com o servidor rodando, abra seu navegador.
2.  Acesse:
    ```
    http://localhost:3030
    ```
    A aplicação carregará o `index.html` estático e se comunicará com a API para exibir as tarefas.