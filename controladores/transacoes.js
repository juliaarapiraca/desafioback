const conexao = require('../conexao');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../jwt_secret');

const listarTransacoes = async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization.replace('Bearer', '').trim();
    const { id } = await jwt.verify(token, jwtSecret);

    try {
        const { rows: transacoes } = await conexao.query('select transacoes.*, categorias.descricao as categoria_nome from transacoes inner join categorias on transacoes.categoria_id = categorias.id where usuario_id = $1', [id]);

        return res.status(200).json(transacoes);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const detalharTransacao = async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization.replace('Bearer', '').trim();
    const { id } = await jwt.verify(token, jwtSecret);
    const { id: transacao_id } = req.params;

    try {
        const perfil = await conexao.query('select * from usuarios where id = $1', [id]);

        if (perfil.rowCount === 0) {
            return res.status(404).json('Perfil não encontrado.');
        }

        const transacaoFormatada = await conexao.query('select transacoes.*, categorias.descricao as categoria_nome from transacoes inner join categorias on transacoes.categoria_id = categorias.id where transacoes.id = $1', [transacao_id]);

        if (transacaoFormatada.rowCount === 0) {
            return res.status(404).json('Transação não encontrada.');
        }

        return res.status(200).json(transacaoFormatada.rows[0]);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const cadastrarTransacao = async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization.replace('Bearer', '').trim();
    const { id } = await jwt.verify(token, jwtSecret);
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    try {

        const perfil = await conexao.query('select * from usuarios where id = $1', [id]);

        if (perfil.rowCount === 0) {
            return res.status(404).json('Perfil não encontrado.');
        }

        if (!descricao) {
            return res.status(400).json('O campo descrição é obrigatório!');
        }

        if (!valor) {
            return res.status(400).json('O campo valor é obrigatório!');
        }

        if (!data) {
            return res.status(400).json('O campo data é obrigatório!');
        }

        if (!categoria_id) {
            return res.status(400).json('O campo categoria é obrigatório!');
        }

        if (!tipo) {
            return res.status(400).json('O campo tipo é obrigatório!');
        }

        const transacao = await conexao.query('insert into transacoes (descricao, valor, data, categoria_id, tipo, usuario_id) values ($1, $2, $3, $4, $5, $6) returning *', [descricao, valor, data, categoria_id, tipo, id]);

        if (transacao.rowCount === 0) {
            return res.status(400).json('Não foi possível cadastrar a transação.');
        }

        const categoria_descricao = await conexao.query('select descricao from categorias where id = $1',[categoria_id]);

        const respostaTransacao = {
            id,
            tipo,
            descricao,
            valor,
            data,
            categoria_id,
            categoria_nome:categoria_descricao.rows[0].descricao
        }
        return res.status(200).json(respostaTransacao);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const editarTransacao = async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization.replace('Bearer', '').trim();
    const { id } = await jwt.verify(token, jwtSecret);
    const { id: transacao_id } = req.params;
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    try {
        const perfil = await conexao.query('select * from usuarios where id = $1', [id]);

        if (perfil.rowCount === 0) {
            return res.status(404).json('Perfil não encontrado.');
        }

        const transacao = await conexao.query('select * from transacoes where id = $1', [transacao_id]);

        if (transacao.rowCount === 0) {
            return res.status(404).json('Transação não encontrada.');
        }

        if (!descricao) {
            return res.status(400).json('O campo descrição é obrigatório!');
        }

        if (!valor) {
            return res.status(400).json('O campo valor é obrigatório!');
        }

        if (!data) {
            return res.status(400).json('O campo data é obrigatório!');
        }

        if (!categoria_id) {
            return res.status(400).json('O campo categoria é obrigatório!');
        }

        if (!tipo) {
            return res.status(400).json('O campo tipo é obrigatório!');
        }

        const transacaoEditada = await conexao.query('update transacoes set descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5 where id = $6', [descricao, valor, data, categoria_id, tipo, transacao_id]);

        if (transacaoEditada.rowCount === 0) {
            return res.status(404).json('Não foi possível editar a transação.');
        }

        return res.status(200).json();
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const removerTransacao = async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization.replace('Bearer', '').trim();
    const { id } = await jwt.verify(token, jwtSecret);
    const { id: transacao_id } = req.params;

    try {
        const perfil = await conexao.query('select * from usuarios where id = $1', [id]);

        if (perfil.rowCount === 0) {
            return res.status(404).json('Perfil não encontrado.');
        }

        const transacao = await conexao.query('select * from transacoes where id = $1', [transacao_id]);

        if (transacao.rowCount === 0) {
            return res.status(404).json('Transação não encontrada.');
        }

        const transacaoRemovida = await conexao.query('delete from transacoes where id = $1', [transacao_id]);

        if (transacaoRemovida.rowCount === 0) {
            return res.status(404).json('Não foi possível remover a transação.');
        }

        return res.status(200).json();
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const extratoTransacao = async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization.replace('Bearer', '').trim();
    const { id } = await jwt.verify(token, jwtSecret);

    try {
        const { rows: totalEntrada } = await conexao.query('SELECT SUM(valor) FROM transacoes where tipo = $1 AND usuario_id = $2', ['entrada', id]);
        const { rows: totalSaida } = await conexao.query('SELECT SUM(valor) FROM transacoes where tipo = $1 AND usuario_id = $2', ['saida', id]);

        let entrada = totalEntrada[0];
        let saida = totalSaida[0];

        if (!entrada.sum) {
            entrada = 0;
            return res.status(200).json({ entrada: entrada, saida: saida.sum });
        }

        if (!saida.sum) {
            saida = 0;
            return res.status(200).json({ entrada: entrada.sum, saida: saida });
        }

        return res.status(200).json({ entrada: entrada.sum, saida: saida.sum });
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    listarTransacoes,
    detalharTransacao,
    cadastrarTransacao,
    editarTransacao,
    removerTransacao,
    extratoTransacao
};