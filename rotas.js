const express = require('express');
const categorias = require('./controladores/categorias');
const usuarios = require('./controladores/usuarios');
const transacoes = require('./controladores/transacoes');
const verificarToken = require('./intermediários/verificarToken');

const rotas = express();

rotas.post('/usuario', usuarios.cadastrarUsuario);
rotas.post('/login', usuarios.fazerLogin);

rotas.use(verificarToken.verificarToken);
rotas.get('/usuario', usuarios.detalharPerfil);
rotas.put('/usuario', usuarios.editarPerfil);

rotas.get('/categoria', categorias.listarCategorias);

rotas.get('/transacao', transacoes.listarTransacoes);
rotas.get('/transacao/extrato', transacoes.extratoTransacao);
rotas.get('/transacao/:id', transacoes.detalharTransacao);
rotas.post('/transacao', transacoes.cadastrarTransacao);
rotas.put('/transacao/:id', transacoes.editarTransacao);
rotas.delete('/transacao/:id', transacoes.removerTransacao);

module.exports = rotas;