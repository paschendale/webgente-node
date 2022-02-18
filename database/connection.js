const moment = require('moment');
const stdio = require('stdio')

function logTime() {
    return moment().format('MMMM Do YYYY, h:mm:ss a') + ' | '
}

const { Sequelize } = require('sequelize')

var args = stdio.getopt({
  'database': {key: 'd', args: 1, description: 'Database relative path', default: './database/webgente.db'}
});

console.log(logTime() + 'Base de dados localizada em: ' + args.database)

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: args.database || './database/webgente.db',
    logging: false
});

try {
    sequelize.authenticate();
    console.log(logTime() + 'Conexão com a base de dados realizada com sucesso.');
  } catch (error) {
    console.error(logTime() + 'Não foi possível conectar com a base de dados:', error);
  };

module.exports = sequelize;
