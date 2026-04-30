const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuarioModel');

const authController = {
  async login(req, res, next) {
    try {
      const { cracha, senha } = req.body;

      if (!cracha || !senha) {
        return res.status(400).json({ error: 'Campos cracha e senha são obrigatórios' });
      }

      const user = await Usuario.findByCracha(cracha);
      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const senhaValida = await bcrypt.compare(senha, user.senha_hash);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      if (!user.ativo) {
        return res.status(403).json({ error: 'Usuário inativo' });
      }

      res.json({
        id: user.id,
        nome: user.nome,
        cracha: user.cracha,
        role: user.role,
        ativo: Boolean(user.ativo),
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
