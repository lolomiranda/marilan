const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_DATABASE || process.env.MYSQLDATABASE || 'marilan_intervencoes',
  process.env.DB_USER || process.env.MYSQLUSER || 'root',
  process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || 'root',
  {
    host: process.env.DB_HOST || process.env.MYSQLHOST || '127.0.0.1',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : (process.env.MYSQLPORT ? Number(process.env.MYSQLPORT) : 3306),
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
