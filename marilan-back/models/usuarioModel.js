const db = require('../db');
const { DataTypes } = require('sequelize');

const UsuarioModel = db.define(
  'Usuario',
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
    cracha: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    senha_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'usuarios',
    timestamps: false,
    freezeTableName: true,
  }
);

const Usuario = {
  async findByCracha(cracha) {
    return await UsuarioModel.findOne({ where: { cracha }, raw: true });
  },

  async findAll() {
    return await UsuarioModel.findAll({
      attributes: ['id', 'nome', 'cracha', 'role', 'ativo', 'created_at'],
      order: [['id', 'DESC']],
      raw: true,
    });
  },

  async create({ nome, cracha, senha_hash, role, ativo }) {
    const usuario = await UsuarioModel.create({
      nome,
      cracha,
      senha_hash,
      role,
      ativo: ativo ? 1 : 0,
    });
    return usuario.get({ plain: true });
  },

  async findById(id) {
    return await UsuarioModel.findOne({
      where: { id },
      attributes: ['id', 'nome', 'cracha', 'role', 'ativo', 'created_at'],
      raw: true,
    });
  },

  async update(id, fields) {
    const updateFields = {};
    if (fields.nome !== undefined) updateFields.nome = fields.nome;
    if (fields.role !== undefined) updateFields.role = fields.role;
    if (fields.ativo !== undefined) updateFields.ativo = fields.ativo ? 1 : 0;
    if (fields.senha_hash !== undefined) updateFields.senha_hash = fields.senha_hash;

    if (Object.keys(updateFields).length > 0) {
      await UsuarioModel.update(updateFields, { where: { id } });
    }
    return this.findById(id);
  },

  async delete(id) {
    await UsuarioModel.destroy({ where: { id } });
  },
};

module.exports = Usuario;
