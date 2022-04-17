const conexao = require('../conexao');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../jwt_secret');

const verificarToken = async (req, res, next) => {
    const {authorization} = req.headers;

    if(!authorization){
        res.status(401).json('O usuário precisa estar logado e com um token válido.');
    }

    try {
        const token = authorization.replace('Bearer', '').trim();

        const {id} = await jwt.verify(token, jwtSecret);

        const {rowCount, rows} = await conexao.query('select * from usuarios where id = $1', [id]);

        if(rowCount == 0){
            return res.status(404).json('Usuário não encontrado');
        }

        const {senha:_, ...demaisDados} = rows[0];
        next();

        req.usuario = demaisDados;
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {verificarToken};