const conexao = require('../conexao');
const securePassword = require('secure-password');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../jwt_secret');

const pwd = securePassword();

const cadastrarUsuario = async (req, res) => {

    const { nome, email, senha } = req.body;

    if (!nome) {
        return res.status(400).json('O campo nome é obrigatório!');
    }

    if (!email) {
        return res.status(400).json('O campo email é obrigatório!');
    }

    if (!senha) {
        return res.status(400).json('O campo senha é obrigatório!');
    }
    try {
        const usuario = await conexao.query('select * from usuarios where email = $1', [email]);

        if (usuario.rowCount > 0) {
            return res.status(400).json('Já existe usuário cadastrado com o e-mail informado.')
        }
    } catch (error) {
        return res.status(400).json(error.message);
    }
    try {
        const hash = (await pwd.hash(Buffer.from(senha))).toString("hex");

        const usuario = await conexao.query('insert into usuarios (nome, email, senha) values ($1, $2, $3) returning id, nome, email', [nome, email, hash]);
        if (usuario.rowCount === 0) {
            return res.status(400).json('Não foi possível cadastrar o usuário.');
        }
        return res.status(201).json(usuario.rows[0]);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const fazerLogin = async (req, res) => {
    const { email, senha } = req.body;

    if (!email) {
        return res.status(400).json('O campo email é obrigatório!');
    }

    if (!senha) {
        return res.status(400).json('O campo senha é obrigatório!');
    }

    try {
        const usuarios = await conexao.query('select * from usuarios where email = $1', [email]);

        if (usuarios.rowCount == 0) {
            return res.status(400).json('Usuário e/ou senha inválido(s).')
        }

        const usuario = usuarios.rows[0];

        const result = await pwd.verify(Buffer.from(senha), Buffer.from(usuario.senha, "hex"));

        switch (result) {
            case securePassword.INVALID_UNRECOGNIZED_HASH:
            case securePassword.INVALID:
                return res.status(400).json('Usuário e/ou senha inválido(s).');
            case securePassword.VALID:
                break;
            case securePassword.VALID_NEEDS_REHASH:
                try {
                    const hash = (await pwd.hash(Buffer.from(senha))).toString("hex");

                    await conexao.query('update usuarios set senha = $1 where email = $2', [hash, email]);
                } catch {
                }
                break;
        }

        const token = jwt.sign({
            id: usuario.id,
        }, jwtSecret, { expiresIn: '2h' });

        const { senha: senhaUsuario, ...demaisDados } = usuario;

        return res.status(200).json({ usuario: demaisDados, token });

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const detalharPerfil = async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization.replace('Bearer', '').trim();
    const { id } = await jwt.verify(token, jwtSecret);

    try {
        const perfilEncontrado = await conexao.query('select * from usuarios where id = $1', [id]);

        if (perfilEncontrado.rowCount === 0) {
            return res.status(404).json('Perfil não encontrado.');
        }

        const perfil = perfilEncontrado.rows[0];

        const { senha: senhaUsuario, ...demaisDados } = perfil;

        return res.status(200).json(demaisDados);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const editarPerfil = async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization.replace('Bearer', '').trim();
    const { id } = await jwt.verify(token, jwtSecret);
    const { nome, email, senha } = req.body;

    try {
        const perfil = await conexao.query('select * from usuarios where id = $1', [id]);

        if (perfil.rowCount === 0) {
            return res.status(404).json('Perfil não encontrado.');
        }

        if (!nome) {
            return res.status(400).json('O campo nome é obrigatório!');
        }

        if (!email) {
            return res.status(400).json('O campo email é obrigatório!');
        }

        if (!senha) {
            return res.status(400).json('O campo senha é obrigatório!');
        }

        try {
            const usuario = await conexao.query('select * from usuarios where email = $1', [email]);

            if (usuario.rowCount > 0) {
                return res.status(400).json('Já existe usuário cadastrado com o e-mail informado.')
            }
        } catch (error) {
            return res.status(400).json(error.message);
        }

        try {
            const hash = (await pwd.hash(Buffer.from(senha))).toString("hex");

            const perfilEditado = await conexao.query('update usuarios set nome = $1, email = $2, senha = $3 where id = $4', [nome, email, hash, id]);

            if (perfilEditado.rowCount === 0) {
                return res.status(404).json('Não foi possível editar o perfil.');
            }

            return res.status(200).json();
        } catch (error) {
            return res.status(400).json(error.message);
        }


    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    cadastrarUsuario,
    fazerLogin,
    detalharPerfil,
    editarPerfil
};