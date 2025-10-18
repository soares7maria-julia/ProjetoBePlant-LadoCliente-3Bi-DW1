-- Criar o banco de dados
CREATE DATABASE beplant;
\c beplant;

-- =========================
-- CRIAÇÃO DAS TABELAS
-- =========================

CREATE TABLE Pessoa (
    idPessoa SERIAL PRIMARY KEY,
    cpfPessoa VARCHAR(14) UNIQUE NOT NULL,
    nomePessoa VARCHAR(100) NOT NULL,
    emailPessoa VARCHAR(100) NOT NULL,
    senhaPessoa VARCHAR(100) NOT NULL,
    enderecoPessoa VARCHAR(150)
);

CREATE TABLE Cliente (
    idPessoa INT PRIMARY KEY,
    dataCadastro DATE NOT NULL,
    CONSTRAINT fk_cliente_pessoa FOREIGN KEY (idPessoa) REFERENCES Pessoa(idPessoa)
);

CREATE TABLE Cargo (
    idCargo SERIAL PRIMARY KEY,
    nomeCargo VARCHAR(50) NOT NULL
);

CREATE TABLE Funcionario (
    idPessoa INT PRIMARY KEY,
    salario NUMERIC(10,2) NOT NULL,
    fkCargo INT NOT NULL,
    CONSTRAINT fk_funcionario_pessoa FOREIGN KEY (idPessoa) REFERENCES Pessoa(idPessoa),
    CONSTRAINT fk_funcionario_cargo FOREIGN KEY (fkCargo) REFERENCES Cargo(idCargo)
);

CREATE TABLE Categoria (
    idCategoria SERIAL PRIMARY KEY,
    nomeCategoria VARCHAR(50) NOT NULL
);

CREATE TABLE Item (
    idItem SERIAL PRIMARY KEY,
    nomeItem VARCHAR(100) NOT NULL,
    estoqueItem INT NOT NULL,
    valorUnitario NUMERIC(10,2) NOT NULL,
    fkCategoria INT NOT NULL,
    CONSTRAINT fk_item_categoria FOREIGN KEY (fkCategoria) REFERENCES Categoria(idCategoria)
);

CREATE TABLE Pedido (
    idPedido SERIAL PRIMARY KEY,
    dataPedido DATE NOT NULL,
    idPessoa INT NOT NULL,
    valorTotal NUMERIC(10,2),
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (idPessoa) REFERENCES Cliente(idPessoa)
);

CREATE TABLE Pedido_Item (
    idPedido INT NOT NULL,
    idItem INT NOT NULL,
    quantidade INT NOT NULL,
    valorUnitario NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (idPedido, idItem),
    CONSTRAINT fk_pi_pedido FOREIGN KEY (idPedido) REFERENCES Pedido(idPedido),
    CONSTRAINT fk_pi_item FOREIGN KEY (idItem) REFERENCES Item(idItem)
);

CREATE TABLE PedidoPago (
    idPedido INT PRIMARY KEY,
    idPessoa INT NOT NULL,
    dataPagamento DATE NOT NULL,
    valorTotal NUMERIC(10,2) NOT NULL,
    CONSTRAINT fk_pagopedido FOREIGN KEY (idPedido) REFERENCES Pedido(idPedido),
    CONSTRAINT fk_pagopessoa FOREIGN KEY (idPessoa) REFERENCES Pessoa(idPessoa)
);

-- =========================
-- POPULAÇÃO DAS TABELAS
-- =========================

-- PESSOA (4 registros)
INSERT INTO Pessoa (cpfPessoa, nomePessoa, emailPessoa, senhaPessoa, enderecoPessoa) VALUES
('111.111.111-11', 'Maria Silva', 'maria@email.com', 'senha1', 'Rua das Flores, 123'),
('222.222.222-22', 'João Souza', 'joao@email.com', 'senha2', 'Av. Brasil, 456'),
('333.333.333-33', 'Ana Costa', 'ana@email.com', 'senha3', 'Rua Verde, 789'),
('444.444.444-44', 'Carlos Lima', 'carlos@email.com', 'senha4', 'Travessa Azul, 321');

-- CLIENTE (2 registros)
INSERT INTO Cliente (idPessoa, dataCadastro) VALUES
(1, '2025-01-10'),
(2, '2025-02-15');

-- CARGO (4 registros)
INSERT INTO Cargo (nomeCargo) VALUES
('Vendedor'),
('Gerente'),
('Atendente'),
('Caixa');

-- FUNCIONARIO (2 registros)
INSERT INTO Funcionario (idPessoa, salario, fkCargo) VALUES
(3, 2500.00, 1),
(4, 4000.00, 2);

-- CATEGORIA (4 registros)
INSERT INTO Categoria (nomeCategoria) VALUES
('Plantas Ornamentais'),
('Suculentas'),
('Árvores'),
('Flores');

-- ITEM (4 registros)
INSERT INTO Item (nomeItem, estoqueItem, valorUnitario, fkCategoria) VALUES
('Samambaia', 10, 25.00, 1),
('Cacto', 20, 15.00, 2),
('Bonsai', 5, 120.00, 3),
('Orquídea', 8, 45.00, 4);

-- PEDIDO (4 registros)
INSERT INTO Pedido (dataPedido, idPessoa, valorTotal) VALUES
('2025-09-01', 1, 50.00),
('2025-09-05', 2, 120.00),
('2025-09-10', 1, 45.00),
('2025-09-12', 2, 135.00);

-- PEDIDO_ITEM (2 registros)
INSERT INTO Pedido_Item (idPedido, idItem, quantidade, valorUnitario) VALUES
(1, 1, 2, 25.00),  -- Pedido 1 com 2 Samambaias
(2, 3, 1, 120.00); -- Pedido 2 com 1 Bonsai

-- PEDIDO_PAGO (2 registros)
INSERT INTO PedidoPago (idPedido, idPessoa, dataPagamento, valorTotal) VALUES
(1, 1, '2025-09-02', 50.00),
(2, 2, '2025-09-06', 120.00);
