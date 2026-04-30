const db = require('../db');
const { QueryTypes } = require('sequelize');

const dashboardController = {
  async resumo(req, res, next) {
    try {
      const [statusRows] = await db.query(
        'SELECT status, COUNT(*) AS total FROM ordens_servico GROUP BY status'
      );

      const [topMaquinas] = await db.query(
        `SELECT m.id, m.nome, COUNT(o.id) AS total_paradas
         FROM ordens_servico o
         JOIN maquinas m ON o.maquina_id = m.id
         GROUP BY m.id
         ORDER BY total_paradas DESC
         LIMIT 5`
      );

      const [topManutentores] = await db.query(
        `SELECT u.id, u.nome, COUNT(o.id) AS total_reparos
         FROM ordens_servico o
         JOIN usuarios u ON o.manutentor_id = u.id
         WHERE o.status = 'concluida'
         GROUP BY u.id
         ORDER BY total_reparos DESC
         LIMIT 5`
      );

      const [topMotivos] = await db.query(
        `SELECT motivo, COUNT(*) AS total
         FROM ordens_servico
         GROUP BY motivo
         ORDER BY total DESC
         LIMIT 5`
      );

      const [setoresProblema] = await db.query(
        `SELECT m.localizacao AS setor, COUNT(o.id) AS total_problemas
         FROM ordens_servico o
         JOIN maquinas m ON o.maquina_id = m.id
         GROUP BY m.localizacao
         ORDER BY total_problemas DESC
         LIMIT 5`
      );

      const [durationRows] = await db.query(
        `SELECT AVG(TIMESTAMPDIFF(MINUTE, data_inicio, data_conclusao)) AS tempo_medio_minutos
         FROM ordens_servico
         WHERE data_inicio IS NOT NULL AND data_conclusao IS NOT NULL`
      );

      res.json({
        status: statusRows,
        topMaquinas,
        topManutentores,
        topMotivos,
        setoresProblema,
        tempoMedioConsertoMinutos: durationRows[0]?.tempo_medio_minutos || 0,
      });
    } catch (error) {
      next(error);
    }
  },

  async pcmRelatorio(req, res, next) {
    try {
      const rows = await db.query(
        `SELECT o.id, o.data_abertura, o.linha_lote, o.motivo, o.descricao_problema,
                o.data_inicio, o.data_conclusao, m.nome AS nome_equipamento, 
                u.nome AS manutentor_nome, m.id AS maquina_id
         FROM ordens_servico o
         JOIN maquinas m ON o.maquina_id = m.id
         LEFT JOIN usuarios u ON o.manutentor_id = u.id
         WHERE o.motivo = 'Quebra' AND o.status = 'concluida'
         ORDER BY o.data_abertura DESC`,
        { type: QueryTypes.SELECT }
      );
      res.json(rows);
    } catch (error) {
      next(error);
    }
  },

  async pcmMetricas(req, res, next) {
    try {
      // MTTR por Manutentor (tempo médio de reparo)
      const [mttrManutentor] = await db.query(
        `SELECT u.id, u.nome, 
                AVG(TIMESTAMPDIFF(MINUTE, o.data_inicio, o.data_conclusao)) AS mttr_minutos,
                COUNT(o.id) AS total_reparos
         FROM ordens_servico o
         JOIN usuarios u ON o.manutentor_id = u.id
         WHERE o.status = 'concluida' AND o.data_inicio IS NOT NULL AND o.data_conclusao IS NOT NULL
         GROUP BY u.id, u.nome
         ORDER BY mttr_minutos ASC`
      );

      // MTBF por Máquina (tempo médio entre falhas)
      const [mtbfMaquina] = await db.query(
        `SELECT m.id, m.nome, m.localizacao,
                AVG(TIMESTAMPDIFF(HOUR, o1.data_conclusao, o2.data_abertura)) AS mtbf_horas,
                COUNT(o1.id) AS total_paradas
         FROM maquinas m
         LEFT JOIN ordens_servico o1 ON m.id = o1.maquina_id AND o1.status = 'concluida'
         LEFT JOIN ordens_servico o2 ON m.id = o2.maquina_id AND o2.data_abertura > o1.data_conclusao
         WHERE o1.id IS NOT NULL
         GROUP BY m.id, m.nome, m.localizacao
         ORDER BY mtbf_horas DESC`
      );

      // Disponibilidade e Indisponibilidade global
      const [availabilityData] = await db.query(
        `SELECT 
           COALESCE(SUM(TIMESTAMPDIFF(MINUTE, o.data_abertura, o.data_conclusao)), 0) AS tempo_parada_minutos
         FROM ordens_servico o
         WHERE o.status = 'concluida'`
      );

      // Tempo total de operação (últimos 30 dias)
      const totalMinutosDisponiveis = 30 * 24 * 60; // 30 dias
      const tempoParadaMinutos = availabilityData[0]?.tempo_parada_minutos || 0;
      const disponibilidadePercent = Math.max(0, ((totalMinutosDisponiveis - tempoParadaMinutos) / totalMinutosDisponiveis) * 100);
      const indisponibilidadePercent = Math.min(100, (tempoParadaMinutos / totalMinutosDisponiveis) * 100);

      // Proporção MTBF vs MTTR
      const [proporcao] = await db.query(
        `SELECT 
           AVG(TIMESTAMPDIFF(HOUR, o1.data_conclusao, o2.data_abertura)) AS mtbf_horas,
           AVG(TIMESTAMPDIFF(MINUTE, o.data_inicio, o.data_conclusao)) AS mttr_minutos
         FROM ordens_servico o
         LEFT JOIN ordens_servico o1 ON o.maquina_id = o1.maquina_id AND o1.status = 'concluida'
         LEFT JOIN ordens_servico o2 ON o.maquina_id = o2.maquina_id AND o2.data_abertura > o1.data_conclusao
         WHERE o.status = 'concluida' AND o.data_inicio IS NOT NULL AND o.data_conclusao IS NOT NULL`
      );

      const mtbfHoras = proporcao[0]?.mtbf_horas || 0;
      const mttrMinutos = proporcao[0]?.mttr_minutos || 0;
      const mtbfPercent = mtbfHoras > 0 ? (mtbfHoras / (mtbfHoras + mttrMinutos / 60)) * 100 : 0;
      const mttrPercent = 100 - mtbfPercent;

      res.json({
        mttrPorManutentor: mttrManutentor,
        mtbfPorMaquina: mtbfMaquina,
        disponibilidadePercent: Math.round(disponibilidadePercent * 100) / 100,
        indisponibilidadePercent: Math.round(indisponibilidadePercent * 100) / 100,
        mtbfVsMttr: {
          mtbfPercent: Math.round(mtbfPercent * 100) / 100,
          mttrPercent: Math.round(mttrPercent * 100) / 100,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async planilha(req, res, next) {
    try {
      const rows = await db.query(
        `SELECT 
           o.id AS nro_relatorio,
           DATE_FORMAT(o.data_abertura, '%d/%m/%Y') AS data,
           o.linha_lote AS linha,
           o.motivo AS cod,
           m.nome AS nome_equipamento,
           o.descricao_problema AS descricao,
           TIME_FORMAT(o.data_inicio, '%H:%i:%s') AS inicio_ocorrencia,
           TIME_FORMAT(o.data_conclusao, '%H:%i:%s') AS fim_ocorrencia,
           u.nome AS manutentor_1,
           NULL AS manutentor_2,
           NULL AS manutentor_3,
           CASE 
             WHEN o.data_inicio IS NOT NULL AND o.data_conclusao IS NOT NULL 
             THEN TIMESTAMPDIFF(HOUR, o.data_inicio, o.data_conclusao)
             ELSE 0
           END AS duracao_horas,
           CASE 
             WHEN o.data_inicio IS NOT NULL AND o.data_conclusao IS NOT NULL 
             THEN MOD(TIMESTAMPDIFF(MINUTE, o.data_inicio, o.data_conclusao), 60)
             ELSE 0
           END AS duracao_minutos,
           TIME_FORMAT(o.data_abertura, '%H:%i:%s') AS hora_abertura,
           'Manutenção' AS oficina,
           m.localizacao AS localizacao
         FROM ordens_servico o
         LEFT JOIN maquinas m ON o.maquina_id = m.id
         LEFT JOIN usuarios u ON o.manutentor_id = u.id
         WHERE o.status = 'concluida'
         ORDER BY o.data_abertura DESC`,
        { type: require('sequelize').QueryTypes.SELECT }
      );
      res.json(rows);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = dashboardController;
