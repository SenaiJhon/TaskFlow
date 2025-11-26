-- Insere múltiplos registros na tabela tasks
-- A coluna 'created_at' e 'id' são preenchidas automaticamente pelo banco de dados.

create database TaskFlow;
use TaskFlow;

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status ENUM('PENDING', 'COMPLETED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE NOT NULL
);

select * from tasks;
INSERT INTO tasks (title, due_date, status) VALUES
('Implementar o Modal Customizado (Front-end)', '2025-12-05', 'COMPLETED'),
('Revisar os Comentários do server.js', '2025-11-25', 'COMPLETED'),
('Finalizar o README do Projeto', '2025-11-20', 'PENDING');