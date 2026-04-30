const Maquina = require('../models/maquinaModel');

const maquinaController = {
  async list(req, res, next) {
    try {
      const maquinas = await Maquina.findAll();
      res.json(maquinas);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const currentUser = req.user || null;
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ error: 'Permissão insuficiente para cadastrar máquinas' });
      }

      const { nome, localizacao, descricao, horas_funcionamento } = req.body;
      if (!nome || !localizacao) {
        return res.status(400).json({ error: 'Campos nome e localizacao são obrigatórios' });
      }

      const maquina = await Maquina.create({ nome, localizacao, descricao, horas_funcionamento });
      res.status(201).json(maquina);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const currentUser = req.user || null;
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ error: 'Permissão insuficiente para editar máquinas' });
      }

      const id = Number(req.params.id);
      if (!id) {
        return res.status(400).json({ error: 'ID de máquina inválido' });
      }

      const maquina = await Maquina.findById(id);
      if (!maquina) {
        return res.status(404).json({ error: 'Máquina não encontrada' });
      }

      const { nome, localizacao, descricao, horas_funcionamento } = req.body;
      const updatedMachine = await Maquina.update(id, { nome, localizacao, descricao, horas_funcionamento });
      res.json(updatedMachine);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const currentUser = req.user || null;
      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ error: 'Permissão insuficiente para excluir máquinas' });
      }

      const id = Number(req.params.id);
      if (!id) {
        return res.status(400).json({ error: 'ID de máquina inválido' });
      }

      const maquina = await Maquina.findById(id);
      if (!maquina) {
        return res.status(404).json({ error: 'Máquina não encontrada' });
      }

      await Maquina.delete(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = maquinaController;
