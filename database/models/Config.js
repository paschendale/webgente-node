const Sequelize = require('sequelize');
const connection = require('../connection');

const Config = connection.define('config', {
    key: {
        type: Sequelize.STRING,
        allowNull: false
    },
    value: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

/* Dados padrão para serem inseridos na inicialização limpa do WebGENTE */
var dummyData = [{
    key: 'mapServerHost',
    value: 'http://nuvem.genteufv.com.br:8080/geoserver/gianetti/wms?',
    createdAt: new Date(),
    updatedAt: new Date()
},{
    key: 'mapServerUser',
    value: 'webgente',
    createdAt: new Date(),
    updatedAt: new Date()
},{
    key: 'mapServerPassword',
    value: 'webgente@ufv',
    createdAt: new Date(),
    updatedAt: new Date()
},

];

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