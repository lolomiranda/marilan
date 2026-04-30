const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuarioModel');

function getCurrentUser(req) {
  return req.user || null;
}

const ROLES_VALIDOS = ['operador', 'admin', 'manutentor'];

const usuarioController = {
  async list(req, res, next) {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ error: 'Permissão insuficiente para listar usuários' });
      }

      const users = await Usuario.findAll();
      res.json(users);
    } catch (error) {
      next(error);
    }
  },

  async register(req, res, next) {
    try {
      const currentUser = getCurrentUser(req);

      const {
        nome,
        cracha,
        senha,
        role = 'operador',
        ativo = 1
      } = req.body;

      if (!nome || !cracha || !senha) {
        return res.status(400).json({ error: 'Campos nome, cracha e senha são obrigatórios' });
      }

      // valida role
      if (!ROLES_VALIDOS.includes(role)) {
        return res.status(400).json({ error: 'Tipo de usuário inválido' });
      }

      // somente admin pode criar admin
      if (role === 'admin' && (!currentUser || currentUser.role !== 'admin')) {
        return res.status(403).json({
          error: 'Somente admin pode cadastrar usuários com perfil admin'
        });
      }

      const existingUser = await Usuario.findByCracha(cracha);
      if (existingUser) {
        return res.status(409).json({ error: 'Crachá já cadastrado' });
      }

      const senha_hash = await bcrypt.hash(senha, 10);

      const user = await Usuario.create({
        nome,
        cracha,
        senha_hash,
        role,
        ativo
      });

      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ error: 'Permissão insuficiente' });
      }

      const userId = Number(req.params.id);
      if (!userId) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const targetUser = await Usuario.findById(userId);
      if (!targetUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const { nome, role, ativo, senha } = req.body;
      const updateFields = {};

      if (nome !== undefined) updateFields.nome = nome;

      if (role !== undefined) {
        if (!ROLES_VALIDOS.includes(role)) {
          return res.status(400).json({ error: 'Tipo de usuário inválido' });
        }
        updateFields.role = role;
      }

      if (ativo !== undefined) updateFields.ativo = ativo;

      if (senha) {
        updateFields.senha_hash = await bcrypt.hash(senha, 10);
      }

      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ error: 'Nada para atualizar' });
      }

      const updatedUser = await Usuario.update(userId, updateFields);
      res.json(updatedUser);

    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ error: 'Permissão insuficiente' });
      }

      const userId = Number(req.params.id);
      if (!userId) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      if (currentUser.id === userId) {
        return res.status(403).json({ error: 'Admin não pode excluir a si mesmo' });
      }

      const targetUser = await Usuario.findById(userId);
      if (!targetUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await Usuario.delete(userId);
      res.status(204).end();

    } catch (error) {
      next(error);
    }
  },
};

module.exports = usuarioController;