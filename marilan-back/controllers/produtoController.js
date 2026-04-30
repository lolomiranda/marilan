const Produto = require('../models/produtoModel');

const produtoController = {
  async list(req, res, next) {
    try {
      const produtos = await Produto.findAll();
      res.json(produtos);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { nome, preco } = req.body;
      if (!nome || preco == null) {
        return res.status(400).json({ error: 'Campos nome e preco são obrigatórios' });
      }

      const produto = await Produto.create({ nome, preco });
      res.status(201).json(produto);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = produtoController;
