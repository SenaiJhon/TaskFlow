/**
 * TaskFlow Front-end Logic (app.js)
 * Gerencia a interação do usuário, as requisições AJAX (fetch) para a API
 * e a manipulação do DOM. Implementa um modal customizado para confirmação.
 */

// Garante que o código seja executado apenas após o DOM estar totalmente carregado
document.addEventListener('DOMContentLoaded', () => {
    // --- VARIÁVEIS DE ESTADO E REFERÊNCIAS DO DOM ---
    
    // Referências aos elementos do formulário e da lista
    const taskForm = document.getElementById('task-form');
    const tasksList = document.getElementById('tasks-list');
    const sortButton = document.getElementById('sort-button');

    // Variável de estado para controlar a ordenação (padrão: false, ordenado por criação)
    let isSortedByDate = false;
    
    // URL base da API do Node.js/Express
    const API_URL = 'http://localhost:3030/tasks'; 

    // --- FUNÇÃO DE FEEDBACK ---
    // Exibe mensagens no console (em um projeto real, seria substituído por toasts/popups na tela)
    function displayFeedback(message, isError = false) {
        if (isError) {
             console.error(`Feedback (Erro): ${message}`);
        } else {
             console.log(`Feedback (Sucesso): ${message}`);
        }
    }

    // --- FUNÇÃO CUSTOMIZADA DE CONFIRMAÇÃO (Substitui confirm()) ---
    // Cria um comportamento assíncrono para o modal de confirmação.
    function showCustomConfirm(message) {
        // Referências aos elementos do modal customizado
        const modal = document.getElementById('custom-modal');
        const msgElement = document.getElementById('modal-message');
        const confirmBtn = document.getElementById('modal-confirm-btn');
        const cancelBtn = document.getElementById('modal-cancel-btn');

        // Fallback: se o modal não for encontrado, usa o confirm nativo do navegador
        if (!modal || !msgElement || !confirmBtn || !cancelBtn) {
            return Promise.resolve(confirm(message));
        }

        msgElement.textContent = message;
        modal.style.display = 'flex'; // Torna o modal visível

        // Retorna uma Promise que resolve quando o usuário clica em Confirmar (true) ou Cancelar (false)
        return new Promise(resolve => {
            // Função que esconde o modal e remove os listeners
            const cleanup = (result) => {
                modal.style.display = 'none';
                confirmBtn.removeEventListener('click', onConfirm);
                cancelBtn.removeEventListener('click', onCancel);
                resolve(result); // Resolve a Promise com o resultado (true ou false)
            };

            const onConfirm = () => cleanup(true);
            const onCancel = () => cleanup(false);

            // Adiciona listeners de clique temporários para o modal
            confirmBtn.addEventListener('click', onConfirm);
            cancelBtn.addEventListener('click', onCancel);
        });
    }
    
    // ------------------------------------------------------
    // 1. CARREGAR E EXIBIR TAREFAS (Requisito 2: Leitura; Requisito 6: Ordenação)
    // ------------------------------------------------------

    /**
     * Faz a requisição GET para a API e renderiza a lista.
     * @param {boolean} sort - Se deve ordenar por data prevista (true) ou por criação (false).
     */
    async function loadTasks(sort = false) {
        // Constrói a URL para ordenar se 'sort' for true
        const url = sort ? `${API_URL}?sort=date` : API_URL;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Falha ao buscar tarefas');
            }
            const tasks = await response.json();
            renderTasks(tasks); // Chama a função que desenha o HTML
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            displayFeedback('Não foi possível carregar as tarefas.', true);
        }
    }

    /**
     * Renderiza o array de tarefas no DOM (Cria os elementos <li>).
     * @param {Array} tasks - Lista de objetos tarefa retornados pela API.
     */
    function renderTasks(tasks) {
        tasksList.innerHTML = ''; // Limpa a lista existente

        if (tasks.length === 0) {
            tasksList.innerHTML = '<p>Nenhuma tarefa cadastrada.</p>';
            return;
        }

        tasks.forEach(task => {
            const li = document.createElement('li');
            const isCompleted = task.status === 'COMPLETED';
            // Define a classe CSS para estilização condicional
            const statusClass = isCompleted ? 'completed' : 'pending';

            // Formatação das datas para o formato brasileiro (DD/MM/AAAA)
            const createdDate = new Date(task.created_at).toLocaleDateString('pt-BR');
            const dueDate = new Date(task.due_date).toLocaleDateString('pt-BR'); 

            li.className = `task-item ${statusClass}`;
            li.dataset.id = task.id; // Armazena o ID da tarefa para uso nas ações

            // Injeta o HTML do item de lista
            li.innerHTML = `
                <div class="task-info">
                    <span class="task-title" data-editable="true">${task.title}</span>
                    <small>Data Criação: ${createdDate}</small>
                    <small class="due-date">Prevista: <span data-editable-date="true">${dueDate}</span></small>
                    <span class="status-badge">${isCompleted ? 'CONCLUÍDA' : 'PENDENTE'}</span>
                </div>
                <div class="task-actions">
                    ${!isCompleted ? `<button class="action-btn done-btn" data-id="${task.id}">Concluir</button>` : ''}
                    <button class="action-btn edit-btn" data-id="${task.id}">Editar</button>
                    <button class="action-btn delete-btn" data-id="${task.id}">Excluir</button>
                </div>
            `;
            
            tasksList.appendChild(li);
        });
    }

    // ------------------------------------------------------
    // 2. ADICIONAR NOVA TAREFA (Requisito 1: Criação)
    // ------------------------------------------------------

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o envio padrão do formulário (reloading)
        
        const title = document.getElementById('title').value;
        const dueDate = document.getElementById('due-date').value;

        if (!title || !dueDate) return; // Validação básica no front-end

        try {
            // Faz a requisição POST para a API
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, due_date: dueDate }) // Envia os dados como JSON
            });

            if (!response.ok) {
                throw new Error('Erro ao adicionar tarefa.');
            }

            // Ação de sucesso: limpa, recarrega e notifica
            taskForm.reset();
            loadTasks(isSortedByDate); // Recarrega a lista mantendo a ordenação atual
            displayFeedback('Tarefa cadastrada com sucesso!');

        } catch (error) {
            console.error('Erro POST:', error);
            displayFeedback('Falha ao adicionar a tarefa.', true);
        }
    });
    
    // ------------------------------------------------------
    // 3. EVENT DELEGATION E ORDENAÇÃO
    // ------------------------------------------------------

    // Event Delegation: Ouvinte na lista principal que trata os cliques nos botões internos
    tasksList.addEventListener('click', (e) => {
        const target = e.target;
        const taskId = target.dataset.id; // Pega o ID da tarefa do atributo data-id

        if (!taskId) return; // Se o clique não foi em um botão com ID, ignora

        if (target.classList.contains('done-btn')) {
            markAsDone(taskId); // Chama a função para concluir
        } else if (target.classList.contains('delete-btn')) {
            deleteTask(taskId); // Chama a função para excluir
        } else if (target.classList.contains('edit-btn')) {
            if (target.textContent === 'Editar') {
                enableEdit(target.closest('.task-item'), taskId, target); // Ativa o modo de edição
            } else { // Se o texto do botão for 'Salvar'
                saveEdit(target.closest('.task-item'), taskId, target); // Salva as alterações
            }
        }
    });

    // Ordenação (Requisito 6)
    sortButton.addEventListener('click', () => {
        isSortedByDate = !isSortedByDate; // Alterna o estado da ordenação
        // Atualiza o texto do botão para refletir o estado atual
        sortButton.textContent = isSortedByDate ? 'Desativar Ordenação' : 'Ordenar por Data Prevista';
        loadTasks(isSortedByDate); // Recarrega a lista com o novo critério
    });

    // ------------------------------------------------------
    // 4. FUNÇÕES DE AÇÃO INDIVIDUAIS (CRUD Update/Delete)
    // ------------------------------------------------------

    // Marcar como Concluída (Requisito 4)
    async function markAsDone(taskId) {
        // 1. Confirmação customizada
        const userConfirmed = await showCustomConfirm('Tem certeza que deseja marcar esta tarefa como concluída?');
        if (!userConfirmed) return; // Se o usuário cancelar, interrompe

        try {
            // 2. Requisição PUT para a API
            const response = await fetch(`${API_URL}/${taskId}/done`, { method: 'PUT' });
            if (!response.ok) {
                throw new Error('Erro ao concluir tarefa.');
            }
            // 3. Sucesso: Recarrega a lista e notifica
            loadTasks(isSortedByDate);
            displayFeedback('Tarefa marcada como concluída.');
        } catch (error) {
            console.error('Erro PUT /done:', error);
            displayFeedback('Falha ao concluir a tarefa.', true);
        }
    }

    // Excluir Tarefa (Requisito 5)
    async function deleteTask(taskId) {
        // 1. Confirmação customizada
        const userConfirmed = await showCustomConfirm('Tem certeza que deseja excluir esta tarefa?');
        if (!userConfirmed) return; // Se o usuário cancelar, interrompe

        try {
            // 2. Requisição DELETE para a API
            const response = await fetch(`${API_URL}/${taskId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Erro ao excluir tarefa.');
            }
            // 3. Sucesso: Recarrega a lista e notifica
            loadTasks(isSortedByDate);
            displayFeedback('Tarefa excluída com sucesso.');
        } catch (error) {
            console.error('Erro DELETE:', error);
            displayFeedback('Falha ao excluir a tarefa.', true);
        }
    }

    // Habilitar Edição (Requisito 3)
    function enableEdit(taskItem, taskId, editButton) {
        const titleSpan = taskItem.querySelector('.task-title');
        const dueDateSpan = taskItem.querySelector('.due-date span[data-editable-date="true"]');
        
        // 1. Edição do Título: substitui <span> por <input type="text">
        const currentTitle = titleSpan.textContent;
        titleSpan.innerHTML = `<input type="text" class="edit-title-input" value="${currentTitle}">`;
        
        // 2. Edição da Data: substitui <span> por <input type="date">
        // É necessário converter a data do formato exibido (DD/MM/YYYY) para o formato de input (YYYY-MM-DD)
        const parts = dueDateSpan.textContent.split('/');
        const currentDueDate = `${parts[2]}-${parts[1]}-${parts[0]}`; 
        dueDateSpan.innerHTML = `<input type="date" class="edit-date-input" value="${currentDueDate}">`;

        // 3. Altera o botão de "Editar" para "Salvar"
        editButton.textContent = 'Salvar';
    }

    // Salvar Edição (Requisito 3)
    async function saveEdit(taskItem, taskId, saveButton) {
        const titleInput = taskItem.querySelector('.edit-title-input');
        const dateInput = taskItem.querySelector('.edit-date-input');

        const newTitle = titleInput.value;
        const newDueDate = dateInput.value; // Formato YYYY-MM-DD (pronto para API)

        if (!newTitle || !newDueDate) {
            displayFeedback('Título e Data não podem estar vazios.', true);
            return;
        }

        try {
            // 1. Requisição PUT para a API com os novos dados
            const response = await fetch(`${API_URL}/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle, due_date: newDueDate })
            });
            
            if (!response.ok) {
                throw new Error('Erro ao salvar edição.');
            }

            // 2. Sucesso: Recarrega a lista para mostrar o estado não-editável atualizado
            loadTasks(isSortedByDate); 
            displayFeedback('Tarefa editada com sucesso!');

        } catch (error) {
            console.error('Erro PUT /edit:', error);
            displayFeedback('Falha ao editar a tarefa.', true);
        }
    }


    // --- Inicialização ---
    // Inicia o carregamento das tarefas quando a página carrega
    loadTasks();
});
