const db = require('../db');
const { DataTypes } = require('sequelize');

const ProdutoModel = db.define(
  'Produto',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    preco: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: 'produtos',
    timestamps: false,
    freezeTableName: true,
  }
);

const Produto = {
  async findAll() {
    return await ProdutoModel.findAll({ raw: true });
  },

  async create({ nome, preco }) {
    const produto = await ProdutoModel.create({ nome, preco });
    return produto.get({ plain: true });
  },
};

module.exports = Produto;
