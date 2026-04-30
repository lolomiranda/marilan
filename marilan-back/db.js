const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_DATABASE || 'marilan_intervencoes',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: false,
    define: {
      timestamps: false,
      
      freezeTableName: true,
    },
  }
);

module.exports = sequelize;
