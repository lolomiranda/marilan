require('dotenv').config();

const bcrypt = require('bcryptjs');
const db = require('./db');
const Usuario = require('./models/usuarioModel');
const Maquina = require('./models/maquinaModel');
const Produto = require('./models/produtoModel');
const OrdemServico = require('./models/ordemServicoModel');

async function ensureUser(cracha, data) {
  const UsuarioModel = db.models.Usuario;
  const [user] = await UsuarioModel.findOrCreate({
    where: { cracha },
    defaults: data,
  });
  return user.get({ plain: true });
}

async function ensureMachine(nome, data) {
  const MaquinaModel = db.models.Maquina;
  const [maquina] = await MaquinaModel.findOrCreate({
    where: { nome },
    defaults: data,
  });
  return maquina.get({ plain: true });
}

async function ensureProduto(nome, data) {
  const ProdutoModel = db.models.Produto;
  const [produto] = await ProdutoModel.findOrCreate({
    where: { nome },
    defaults: data,
  });
  return produto.get({ plain: true });
}

async function ensureOrdemUnique(descricao, operador_id, maquina_id, defaults) {
  const OrdemServicoModel = db.models.OrdemServico;
  const [ordem] = await OrdemServicoModel.findOrCreate({
    where: {
      descricao_problema: descricao,
      operador_id,
      maquina_id,
    },
    defaults,
  });
  return ordem.get({ plain: true });
}

async function seed() {
  try {
    await db.authenticate();
    await db.sync({ alter: true });

    const senhaAdmin = await bcrypt.hash('123456', 10);

    const admin = await ensureUser('2154', {
      nome: 'Administrador do Sistema',
      cracha: '2154',
      senha_hash: senhaAdmin,
      role: 'admin',
      ativo: true,
    });

    const operador = await ensureUser('1001', {
      nome: 'Operador Exemplo',
      cracha: '1001',
      senha_hash: await bcrypt.hash('operador123', 10),
      role: 'operador',
      ativo: true,
    });

    const manutentor = await ensureUser('2001', {
      nome: 'Manutentor Exemplo',
      cracha: '2001',
      senha_hash: await bcrypt.hash('manutentor123', 10),
      role: 'manutentor',
      ativo: true,
    });

    const pcm = await ensureUser('3001', {
      nome: 'Planejamento e Controle de Manutenção',
      cracha: '3001',
      senha_hash: await bcrypt.hash('pcm123', 10),
      role: 'pcm',
      ativo: true,
    });

    const maquina1 = await ensureMachine('Cortadeira A', {
      nome: 'Cortadeira A',
      localizacao: 'Linha 1 - Prédio A',
      descricao: 'Máquina de corte de chapas com alto volume de produção.',
    });

    const maquina2 = await ensureMachine('Prensa B', {
      nome: 'Prensa B',
      localizacao: 'Linha 2 - Prédio A',
      descricao: 'Prensa hidráulica usada para conformação de peças.',
    });

    const maquina3 = await ensureMachine('Extrusora C', {
      nome: 'Extrusora C',
      localizacao: 'Linha 3 - Prédio B',
      descricao: 'Extrusora para perfis plásticos e componentes.',
    });

    const produto1 = await ensureProduto('Óleo Lubrificante', {
      nome: 'Óleo Lubrificante',
      preco: 42.50,
    });

    const produto2 = await ensureProduto('Filtro de Ar', {
      nome: 'Filtro de Ar',
      preco: 18.90,
    });

    const OrdemServicoModel = db.models.OrdemServico;

    await ensureOrdemUnique(
      'A máquina parou sozinha durante a troca de ferramenta e não reinicia.',
      operador.id,
      maquina1.id,
      {
        maquina_id: maquina1.id,
        descricao_problema: 'A máquina parou sozinha durante a troca de ferramenta e não reinicia.',
        operador_id: operador.id,
        prioridade: 'alta',
        motivo: 'Quebra',
        status: 'aberta',
      }
    );

    await ensureOrdemUnique(
      'Ajuste de pressão da prensa fora do padrão.',
      operador.id,
      maquina2.id,
      {
        maquina_id: maquina2.id,
        descricao_problema: 'Ajuste de pressão da prensa fora do padrão.',
        operador_id: operador.id,
        prioridade: 'normal',
        motivo: 'Produção',
        status: 'atribuida',
        manutentor_id: manutentor.id,
        data_atribuicao: new Date(),
      }
    );

    await ensureOrdemUnique(
      'Vazamento na linha de extrusão que causa instabilidade no produto.',
      operador.id,
      maquina3.id,
      {
        maquina_id: maquina3.id,
        descricao_problema: 'Vazamento na linha de extrusão que causa instabilidade no produto.',
        operador_id: operador.id,
        prioridade: 'alta',
        motivo: 'Defeito',
        status: 'em_andamento',
        manutentor_id: manutentor.id,
        data_atribuicao: new Date(Date.now() - 3600 * 1000 * 5),
        data_inicio: new Date(Date.now() - 3600 * 1000 * 2),
      }
    );

    await ensureOrdemUnique(
      'Substituição de filtro preventivo e lubrificação geral.',
      operador.id,
      maquina1.id,
      {
        maquina_id: maquina1.id,
        descricao_problema: 'Substituição de filtro preventivo e lubrificação geral.',
        operador_id: operador.id,
        prioridade: 'baixa',
        motivo: 'Programada',
        status: 'concluida',
        manutentor_id: manutentor.id,
        data_atribuicao: new Date(Date.now() - 3600 * 1000 * 30),
        data_inicio: new Date(Date.now() - 3600 * 1000 * 28),
        data_conclusao: new Date(Date.now() - 3600 * 1000 * 24),
        acao_realizada: 'Trocado filtro e feita lubrificação conforme checklist.',
        observacoes: 'Máquina voltou a operar sem falhas após manutenção.',
      }
    );

    console.log('Seed concluída com sucesso. Usuários criados:');
    console.log('Admin: cracha=2154 senha=123456');
    console.log('Operador: cracha=1001 senha=operador123');
    console.log('Manutentor: cracha=2001 senha=manutentor123');
    console.log('PCM: cracha=3001 senha=pcm123');
    process.exit(0);
  } catch (error) {
    console.error('Falha ao rodar a seed:', error);
    process.exit(1);
  }
}

seed();
