const db = require('../db');
const { DataTypes, QueryTypes } = require('sequelize');

const OrdemServicoModel = db.define(
  'OrdemServico',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    maquina_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    linha_lote: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    descricao_problema: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    operador_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    prioridade: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'normal',
    },
    motivo: {
      type: DataTypes.ENUM('Quebra', 'Set-up', 'Troca fer.', 'Produção', 'Pequenas paradas', 'Velocidade', 'Defeito', 'Programada', 'Gestão', 'Movimento operacionais', 'Organização', 'Logística', 'Medições e ajuste'),
      allowNull: false,
    },
    tarefa: {
      type: DataTypes.ENUM('Inspeção', 'Lubrificação', 'Ajuste', 'Substituição', 'Calibração', 'Limpeza', 'Reparo', 'Instalação'),
      allowNull: true,
    },
    area: {
      type: DataTypes.ENUM('Mecânica', 'Elétrica', 'Eletrônica'),
      allowNull: true,
    },
    causa: {
      type: DataTypes.ENUM('Desgaste', 'Falha elétrica', 'Sobrecarga', 'Falta de lubrificação', 'Vibração excessiva', 'Contaminação', 'Erro de operação', 'Falta de manutenção', 'Defeito de fabricação', 'Envelhecimento', 'Choque térmico', 'Outros'),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'aberta',
    },
    data_abertura: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    manutentor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    data_atribuicao: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    data_inicio: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    data_conclusao: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    acao_realizada: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status_liberacao: {
      type: DataTypes.ENUM('liberada', 'nao_liberada', 'liberada_com_restricoes'),
      allowNull: true,
    },
    insumos: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    video_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'ordens_servico',
    timestamps: false,
    freezeTableName: true,
  }
);

const OrdemServico = {
  async create({ maquina_id, linha_lote, descricao_problema, operador_id, prioridade = 'normal', motivo, data_abertura }) {
    const ordem = await OrdemServicoModel.create({
      maquina_id,
      linha_lote,
      descricao_problema,
      operador_id,
      prioridade,
      motivo,
      status: 'aberta',
      data_abertura: data_abertura || undefined,
    });
    return this.findById(ordem.id);
  },

  async findAll() {
    const rows = await db.query(
      `SELECT o.*, o.linha_lote, o.data_abertura, o.data_inicio, o.data_conclusao, m.nome AS maquina_nome, m.localizacao AS maquina_localizacao,
        u.nome AS operador_nome, um.id AS manutentor_id, um.nome AS manutentor_nome
      FROM ordens_servico o
      JOIN maquinas m ON o.maquina_id = m.id
      JOIN usuarios u ON o.operador_id = u.id
      LEFT JOIN usuarios um ON o.manutentor_id = um.id
      ORDER BY o.data_abertura DESC`,
      { type: QueryTypes.SELECT }
    );
    return rows;
  },

  async findAllForOperador(operador_id) {
    const rows = await db.query(
      `SELECT o.*, o.linha_lote, o.data_abertura, o.data_inicio, o.data_conclusao, m.nome AS maquina_nome, m.localizacao AS maquina_localizacao,
        u.nome AS operador_nome, um.id AS manutentor_id, um.nome AS manutentor_nome
      FROM ordens_servico o
      JOIN maquinas m ON o.maquina_id = m.id
      JOIN usuarios u ON o.operador_id = u.id
      LEFT JOIN usuarios um ON o.manutentor_id = um.id
      WHERE o.operador_id = ?
      ORDER BY o.data_abertura DESC`,
      {
        replacements: [operador_id],
        type: QueryTypes.SELECT,
      }
    );
    return rows;
  },

  async findAllForManutentor(manutentor_id) {
    const rows = await db.query(
      `SELECT o.*, o.linha_lote, o.data_abertura, o.data_inicio, o.data_conclusao, m.nome AS maquina_nome, m.localizacao AS maquina_localizacao,
        u.nome AS operador_nome, um.id AS manutentor_id, um.nome AS manutentor_nome
      FROM ordens_servico o
      JOIN maquinas m ON o.maquina_id = m.id
      JOIN usuarios u ON o.operador_id = u.id
      LEFT JOIN usuarios um ON o.manutentor_id = um.id
      WHERE o.status = 'aberta' OR o.manutentor_id = ?
      ORDER BY o.data_abertura DESC`,
      {
        replacements: [manutentor_id],
        type: QueryTypes.SELECT,
      }
    );
    return rows;
  },

  async findById(id) {
    const rows = await db.query(
      `SELECT o.*, o.linha_lote, o.data_abertura, o.data_inicio, o.data_conclusao, m.nome AS maquina_nome, m.localizacao AS maquina_localizacao,
        u.nome AS operador_nome, um.id AS manutentor_id, um.nome AS manutentor_nome
      FROM ordens_servico o
      JOIN maquinas m ON o.maquina_id = m.id
      JOIN usuarios u ON o.operador_id = u.id
      LEFT JOIN usuarios um ON o.manutentor_id = um.id
      WHERE o.id = ?`,
      {
        replacements: [id],
        type: QueryTypes.SELECT,
      }
    );
    return rows[0] || null;
  },

  async assign(id, manutentor_id) {
    const [result] = await db.query(
      `UPDATE ordens_servico
      SET manutentor_id = ?, status = 'atribuida', data_atribuicao = NOW()
      WHERE id = ? AND status = 'aberta'`,
      {
        replacements: [manutentor_id, id],
      }
    );
    return result && result.affectedRows > 0 ? this.findById(id) : null;
  },

  async start(id) {
    const [result] = await db.query(
      `UPDATE ordens_servico
      SET status = 'em_andamento', data_inicio = NOW()
      WHERE id = ? AND status = 'atribuida'`,
      {
        replacements: [id],
      }
    );
    return result && result.affectedRows > 0 ? this.findById(id) : null;
  },

  async findHistoricoByMaquina(maquina_id) {
    const rows = await db.query(
      `SELECT o.*, m.nome AS maquina_nome, m.localizacao AS maquina_localizacao,
        u.nome AS operador_nome, um.id AS manutentor_id, um.nome AS manutentor_nome
      FROM ordens_servico o
      JOIN maquinas m ON o.maquina_id = m.id
      JOIN usuarios u ON o.operador_id = u.id
      LEFT JOIN usuarios um ON o.manutentor_id = um.id
      WHERE o.maquina_id = ?
      ORDER BY o.data_abertura DESC`,
      { replacements: [maquina_id], type: QueryTypes.SELECT }
    );
    return rows;
  },

  async conclude(id, { acao_realizada, tarefa, area, causa, observacoes, status_liberacao, hora_retorno, insumos, video_url }) {
    const dataConc = hora_retorno ? new Date(hora_retorno) : new Date();
    const [result] = await db.query(
      `UPDATE ordens_servico
      SET status = 'concluida', acao_realizada = ?, tarefa = ?, area = ?, causa = ?, observacoes = ?, status_liberacao = ?, data_conclusao = ?, insumos = ?, video_url = ?
      WHERE id = ? AND status = 'em_andamento'`,
      {
        replacements: [acao_realizada, tarefa, area, causa, observacoes || null, status_liberacao, dataConc, insumos || null, video_url || null, id],
      }
    );
    return result && result.affectedRows > 0 ? this.findById(id) : null;
  },
};

module.exports = OrdemServico;
