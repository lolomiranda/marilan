const db = require('../db');
const { DataTypes } = require('sequelize');

const MaquinaModel = db.define(
  'Maquina',
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
    localizacao: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    horas_funcionamento: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'maquinas',
    timestamps: false,
    freezeTableName: true,
  }
);

const Maquina = {
  async findAll() {
    return await MaquinaModel.findAll({ raw: true });
  },

  async findById(id) {
    return await MaquinaModel.findOne({ where: { id }, raw: true });
  },

  async create({ nome, localizacao, descricao, horas_funcionamento }) {
    const maquina = await MaquinaModel.create({ nome, localizacao, descricao, horas_funcionamento });
    return maquina.get({ plain: true });
  },

  async update(id, fields) {
    const updateFields = {};
    if (fields.nome !== undefined) updateFields.nome = fields.nome;
    if (fields.localizacao !== undefined) updateFields.localizacao = fields.localizacao;
    if (fields.descricao !== undefined) updateFields.descricao = fields.descricao;

    if (Object.keys(updateFields).length > 0) {
      await MaquinaModel.update(updateFields, { where: { id } });
    }
    return this.findById(id);
  },

  async delete(id) {
    await MaquinaModel.destroy({ where: { id } });
  },
};

module.exports = Maquina;
