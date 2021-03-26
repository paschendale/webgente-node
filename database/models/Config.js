const Sequelize = require('sequelize');
const connection = require('../connection');

const Config = connection.define('config', {
    profile: {
        type: Sequelize.STRING,
        allowNull: false
    },
    serverUser: {
        type: Sequelize.STRING,
        allowNull: false
    },
    serverPassword : {
        type: Sequelize.STRING,
        allowNull: false
    },
    serverHost : {
        type: Sequelize.STRING,
        allowNull: false
    },
    startupLat : {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    startupLong : {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    startupZoom : {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    cityName: {
        type: Sequelize.STRING
    }
})

/* Dados padrão para serem inseridos na inicialização limpa do WebGENTE */
var dummyData = [{
    profile: 'webgente-default',
    serverUser: 'geoserver',
    serverPassword: '@zh%IqLQFpcz',
    serverHost: 'https://mapas.genteufv.com.br/geoserver/gianetti/wms?',
    startupLat: -20.754649,
    startupLong: -42.873321,
    startupZoom: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
    cityName: 'Universidade Federal de Viçosa'
}];

/* Sincroniza o modelo com a base de dados, não substituindo tabelas existentes */
Config.sync({force: false}).then(() => {
    /* Insere dados padrão do WebGENTE */
    connection.query('SELECT COUNT() AS count FROM configs') // Verifica se existem dados na base do WebGENTE
    .then(results => {
        if (results[0][0].count == 0) {
            console.log('Inserindo dados padrão do WebGENTE')
            Config.bulkCreate(dummyData)
        }
    });
});

module.exports = Config;