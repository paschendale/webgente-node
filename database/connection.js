const moment = require('moment');

function logTime() {
    return moment().format('MMMM Do YYYY, h:mm:ss a') + ' | '
}

const { Sequelize } = require('sequelize')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database/webgente.db',
    logging: false
});

try {
    sequelize.authenticate();
    console.log(logTime() + 'Conexão com a base de dados realizada com sucesso.');
  } catch (error) {
    console.error(logTime() + 'Não foi possível conectar com a base de dados:', error);
  };

module.exports = sequelize;
