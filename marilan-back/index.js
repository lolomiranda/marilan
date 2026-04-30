require('dotenv').config();

const app = require('./app');
const db = require('./db');

const port = process.env.PORT || 3001;

async function startServer() {
  try {
    await db.authenticate();
    await db.sync({ alter: true });
    console.log('Conexão com MySQL estabelecida com sucesso');

    app.listen(port, () => {
      console.log(`Servidor iniciado em http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Falha ao conectar ao MySQL:', error.message || error);
    process.exit(1);
  }
}
console.log('Iniciando o servidor...');

startServer();
