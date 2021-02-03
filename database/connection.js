const { Sequelize } = require('sequelize')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database/webgente.db'
});

try {
    sequelize.authenticate();
    console.log('Conexão com a base de dados realizada com sucesso.');
  } catch (error) {
    console.error('Não foi possível conectar com a base de dados:', error);
  };

module.exports = sequelize;
