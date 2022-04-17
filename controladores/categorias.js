const conexao = require('../conexao');

const listarCategorias = async (req, res) => {
    try {
        const { rows: categorias } = await conexao.query('select * from categorias');

        return res.status(200).json(categorias);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    listarCategorias
};