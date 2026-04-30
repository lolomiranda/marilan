const OrdemServico = require('../models/ordemServicoModel');

const validPriorities = ['baixa', 'normal', 'alta'];
const validMotivos = ['Quebra', 'Set-up', 'Troca fer.', 'Produção', 'Pequenas paradas', 'Velocidade', 'Defeito', 'Programada', 'Gestão', 'Movimento operacionais', 'Organização', 'Logística', 'Medições e ajuste'];
const validTarefas = ['Inspeção', 'Lubrificação', 'Ajuste', 'Substituição', 'Calibração', 'Limpeza', 'Reparo', 'Instalação'];
const validAreas = ['Mecânica', 'Elétrica', 'Eletrônica'];
const validCausas = ['Desgaste', 'Falha elétrica', 'Sobrecarga', 'Falta de lubrificação', 'Vibração excessiva', 'Contaminação', 'Erro de operação', 'Falta de manutenção', 'Defeito de fabricação', 'Envelhecimento', 'Choque térmico', 'Outros'];

function getCurrentUser(req) {
  return req.user || null;
}

const ordemServicoController = {
  async create(req, res, next) {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || !['admin', 'operador'].includes(currentUser.role)) {
        return res.status(403).json({ error: 'Permissão insuficiente para criar ordens de serviço' });
      }

      const { maquina_id, linha_lote, descricao_problema, operador_id: requestedOperadorId, prioridade = 'normal', motivo, data_abertura } = req.body;
      const operador_id = currentUser.role === 'operador' ? currentUser.id : requestedOperadorId;

      if (!maquina_id || !descricao_problema || !operador_id || !motivo || !linha_lote) {
        return res.status(400).json({ error: 'Campos maquina_id, linha_lote, descricao_problema, operador_id e motivo são obrigatórios' });
      }

      if (!validPriorities.includes(prioridade)) {
        return res.status(400).json({ error: `Prioridade inválida. Valores válidos: ${validPriorities.join(', ')}` });
      }

      if (!validMotivos.includes(motivo)) {
        return res.status(400).json({ error: `Motivo inválido. Valores válidos: ${validMotivos.join(', ')}` });
      }

      const parsedDataAbertura = data_abertura ? new Date(data_abertura) : undefined;
      if (data_abertura && Number.isNaN(parsedDataAbertura.getTime())) {
        return res.status(400).json({ error: 'data_abertura inválida' });
      }

      const ordem = await OrdemServico.create({
        maquina_id,
        linha_lote,
        descricao_problema,
        operador_id,
        prioridade,
        motivo,
        data_abertura: parsedDataAbertura,
      });
      res.status(201).json(ordem);
    } catch (error) {
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ error: 'Autenticação necessária' });
      }

      let ordens;
      if (currentUser.role === 'admin') {
        ordens = await OrdemServico.findAll();
      } else if (currentUser.role === 'operador') {
        ordens = await OrdemServico.findAllForOperador(currentUser.id);
      } else if (currentUser.role === 'manutentor') {
        ordens = await OrdemServico.findAllForManutentor(currentUser.id);
      } else {
        return res.status(403).json({ error: 'Permissão insuficiente para listar ordens de serviço' });
      }

      res.json(ordens);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const ordem = await OrdemServico.findById(req.params.id);
      if (!ordem) {
        return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      }
      res.json(ordem);
    } catch (error) {
      next(error);
    }
  },

  async assign(req, res, next) {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || !['admin', 'manutentor'].includes(currentUser.role)) {
        return res.status(403).json({ error: 'Permissão insuficiente para atribuir ordens de serviço' });
      }

      const { manutentor_id } = req.body;
      if (!manutentor_id) {
        return res.status(400).json({ error: 'Campo manutentor_id é obrigatório' });
      }

      if (currentUser.role === 'manutentor' && manutentor_id !== currentUser.id) {
        return res.status(403).json({ error: 'Manutentor só pode aceitar ordens para si mesmo' });
      }

      const ordem = await OrdemServico.assign(req.params.id, manutentor_id);
      if (!ordem) {
        return res.status(400).json({ error: 'Ordem deve estar com status aberta para ser atribuída' });
      }

      res.json(ordem);
    } catch (error) {
      next(error);
    }
  },

  async start(req, res, next) {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser || !['admin', 'manutentor'].includes(currentUser.role)) {
        return res.status(403).json({ error: 'Permissão insuficiente para iniciar ordens de serviço' });
      }

      const ordem = await OrdemServico.findById(req.params.id);
      if (!ordem) {
        return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      }

      if (currentUser.role === 'manutentor' && ordem.manutentor_id !== currentUser.id) {
        return res.status(403).json({ error: 'Apenas o manutentor responsável pode iniciar esta ordem' });
      }

      const ordemIniciada = await OrdemServico.start(req.params.id);
      if (!ordemIniciada) {
        return res.status(400).json({ error: 'Ordem deve estar atribuída para iniciar o reparo' });
      }

      res.json(ordemIniciada);
    } catch (error) {
      next(error);
    }
  },

  async conclude(req, res, next) {
    try {
      const { acao_realizada, tarefa, area, causa, observacoes, status_liberacao } = req.body;
      if (!acao_realizada) {
        return res.status(400).json({ error: 'Campo acao_realizada é obrigatório' });
      }

      if (tarefa && !validTarefas.includes(tarefa)) {
        return res.status(400).json({ error: `Tarefa inválida. Valores válidos: ${validTarefas.join(', ')}` });
      }

      if (area && !validAreas.includes(area)) {
        return res.status(400).json({ error: `Área inválida. Valores válidos: ${validAreas.join(', ')}` });
      }

      if (causa && !validCausas.includes(causa)) {
        return res.status(400).json({ error: `Causa inválida. Valores válidos: ${validCausas.join(', ')}` });
      }

      if (status_liberacao && !['liberada', 'nao_liberada', 'liberada_com_restricoes'].includes(status_liberacao)) {
        return res.status(400).json({ error: 'Status de liberação inválido' });
      }

      const ordem = await OrdemServico.conclude(req.params.id, { acao_realizada, tarefa, area, causa, observacoes, status_liberacao });
      if (!ordem) {
        return res.status(400).json({ error: 'Ordem deve estar em andamento para ser concluída' });
      }

      res.json(ordem);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = ordemServicoController;
