/**
 * TaskFlow API - Back-end em Node.js com Express e MySQL
 * Este servidor implementa as operações CRUD (Create, Read, Update, Delete)
 * para gerenciar tarefas, atendendo aos requisitos do projeto.
 */

// --- 1. CONFIGURAÇÃO DE DEPENDÊNCIAS E SERVIDOR ---
const express = require('express');
const mysql2 = require('mysql2');
const path = require('path');
const PORT = 3030; // Porta de escuta da API

const app = express();

// Middleware para processar JSON no corpo das requisições (POST/PUT)
app.use(express.json());

// Serve o conteúdo estático do front-end (HTML, CSS, JS) a partir da pasta 'frontend'
app.use(express.static(path.join(__dirname, '../frontend')));



// --- 2. CONFIGURAÇÃO E CONEXÃO COM O BANCO DE DADOS (MySQL) ---
const connection = mysql2.createConnection({
    host: 'localhost', // Endereço do servidor MySQL
    user: 'root',      // Usuário do banco de dados
    password:'cimatec',// Senha do banco de dados
    database:'TaskFlow'// Nome do banco de dados do projeto
})

connection.connect(err=>{
    if (err){
        console.error('Erro ao conectar ao MySQL:', err.message);
        return; // Encerra a execução em caso de falha na conexão
    }
    console.log('Conexão com MySQL estabelecida com sucesso!')
});

// -----------------------------------------------------------------
// --- 3. ROTAS DA API REST (Endpoints) ---
// -----------------------------------------------------------------

/**
 * 3.1. GET /tasks
 * REQUISITOS: Listar tarefas (R2) e Ordenar (R6).
 * Retorna todas as tarefas. Permite ordenação por data prevista via query string.
 */
app.get('/tasks', (req, res) => {
    // Verifica se o parâmetro 'sort=date' está presente na URL
    const orderBy = req.query.sort === 'date' ? 'ORDER BY due_date ASC' : 'ORDER BY created_at DESC';
    const query = `SELECT * FROM tasks ${orderBy}`;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao listar tarefas:', err);
            return res.status(500).send('Erro interno do servidor ao listar tarefas.');
        }
        // Retorna a lista de tarefas como JSON
        res.json(results);
    });
});

/**
 * 3.2. POST /tasks
 * REQUISITO: Criar tarefa (R1).
 * Recebe 'title' e 'due_date' no body e insere uma nova tarefa no banco com status 'PENDING'.
 */
app.post('/tasks', (req, res) => {
    const { title, due_date } = req.body;

    // Validação básica dos dados recebidos
    if (!title || !due_date) {
        return res.status(400).send('Título e Data de Conclusão são obrigatórios.');
    }

    const query = 'INSERT INTO tasks (title, due_date, status) VALUES (?, ?, "PENDING")';

    connection.query(query, [title, due_date], (err, result) => {
        if (err) {
            console.error('Erro ao criar tarefa:', err);
            return res.status(500).send('Erro interno do servidor ao criar tarefa.');
        }
        // Retorna o ID da tarefa recém-criada (result.insertId)
        res.status(201).json({ id: result.insertId, message: 'Tarefa criada com sucesso!' });
    });
});

/**
 * 3.3. PUT /tasks/:id/done
 * REQUISITO: Marcar como concluída (R4).
 * Atualiza o 'status' de uma tarefa específica para 'COMPLETED'.
 */
app.put('/tasks/:id/done', (req, res) => {
    const taskId = req.params.id;
    const query = 'UPDATE tasks SET status = "COMPLETED" WHERE id = ?';

    connection.query(query, taskId, (err, result) => {
        if (err) {
            console.error('Erro ao concluir tarefa:', err);
            return res.status(500).send('Erro interno do servidor ao concluir tarefa.');
        }
        // Verifica se alguma linha foi afetada
        if (result.affectedRows === 0) {
             return res.status(404).send('Tarefa não encontrada.');
        }
        res.status(200).send('Tarefa marcada como concluída.');
    });
});

/**
 * 3.4. PUT /tasks/:id
 * REQUISITO: Editar tarefa (R3).
 * Atualiza o 'title' e/ou 'due_date' de uma tarefa específica.
 */
app.put('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const { title, due_date } = req.body;
    
    if (!title || !due_date) {
        return res.status(400).send('Título e Data de Conclusão são obrigatórios para edição.');
    }

    const query = 'UPDATE tasks SET title = ?, due_date = ? WHERE id = ?';

    connection.query(query, [title, due_date, taskId], (err, result) => {
        if (err) {
            console.error('Erro ao editar tarefa:', err);
            return res.status(500).send('Erro interno do servidor ao editar tarefa.');
        }
        // Verifica se alguma linha foi afetada
        if (result.affectedRows === 0) {
             return res.status(404).send('Tarefa não encontrada.');
        }
        res.status(200).send('Tarefa editada com sucesso.');
    });
});

/**
 * 3.5. DELETE /tasks/:id
 * REQUISITO: Excluir tarefa (R5).
 * Remove uma tarefa específica do banco de dados.
 */
app.delete('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const query = 'DELETE FROM tasks WHERE id = ?';

    connection.query(query, taskId, (err, result) => {
        if (err) {
            console.error('Erro ao deletar tarefa:', err);
            return res.status(500).send('Erro interno do servidor ao deletar tarefa.');
        }
        // Verifica se alguma linha foi afetada
        if (result.affectedRows === 0) {
             return res.status(404).send('Tarefa não encontrada.');
        }
        res.status(200).send('Tarefa excluída com sucesso.');
    });
});


// --- 4. INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));