CREATE TABLE usuarios (
      id serial primary key,
      nome text not null,
      email text not null unique,
      senha text not null
);

CREATE TABLE categorias (
      id serial primary key,
      descricao text not null
);

CREATE TABLE transacoes (
      id serial primary key,
      descricao text not null,
      valor integer not null,
      data timestamptz not null,
      categoria_id integer not null,
      foreign key (categoria_id) references categorias (id),
      usuario_id integer not null,
      foreign key (usuario_id) references usuarios (id),
      tipo varchar (20) not null
);

INSERT INTO categorias (descricao) 
VALUES 
('Alimentação'),
('Assinaturas e Serviços'),
('Casa'),
('Mercado'),
('Cuidados Pessoais'),
('Educação'),
('Família'),
('Lazer'),
('Pets'),
('Presentes'),
('Roupas'),
('Saúde'),
('Transporte'),
('Salário'),
('Vendas'),
('Outras receitas'),
('Outras despesas')