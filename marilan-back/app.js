const path = require('path');
const express = require('express');
const usuarioRoutes = require('./routes/usuarioRoutes');
const authRoutes = require('./routes/authRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const maquinaRoutes = require('./routes/maquinaRoutes');
const ordemServicoRoutes = require('./routes/ordemServicoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-User-Id, X-User-Role'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use((req, res, next) => {
  const userId = Number(req.header('x-user-id'));
  const role = req.header('x-user-role');

  if (userId && role) {
    req.user = { id: userId, role };
  }

  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'API Marilan conectada ao MySQL', status: 'ok' });
});

app.use('/usuarios', usuarioRoutes);
app.use('/', authRoutes);
app.use('/produtos', produtoRoutes);
app.use('/maquinas', maquinaRoutes);
app.use('/ordens-servico', ordemServicoRoutes);
app.use('/dashboard', dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

module.exports = app;
