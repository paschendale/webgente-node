const moment = require('moment');

function logTime() {
    return moment().format('MMMM Do YYYY, h:mm:ss a') + ' | '
}

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
    },
    referenceSystem: {
        type: Sequelize.INTEGER,
        defaultValue: 31983
    },
    home_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    select_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    information_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    search_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    legend_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    custom_legend_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    geolocation_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    measurement_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false     
    },
    coordinates_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    download_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    darkMode_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
})

/* Dados padrão para serem inseridos na inicialização limpa do WebGENTE */
var dummyData = [{
    profile: 'webgente-default',
    serverUser: 'webgente',
    serverPassword: 'webgente',
    serverHost: 'https://maps.genteufv.com.br/geoserver/ufv/wms?',
    startupLat: -20.754649,
    startupLong: -42.873321,
    startupZoom: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
    cityName: 'Universidade Federal de Viçosa',
    referenceSystem: 31983,
    home_enabled: true,
    select_enabled: true,
    information_enabled: true,
    search_enabled: false,
    legend_enabled: true,
    geolocation_enabled: true,
    measurement_enabled: true,
    custom_legend_enabled: false,
    coordinates_enabled: true,
    download_enabled: true,
    darkMode_enabled: true
}];

/* Sincroniza o modelo com a base de dados, não substituindo tabelas existentes */
Config.sync({
    force: false,
    alter: true
}).then(() => {
    /* Insere dados padrão do WebGENTE */
    connection.query('SELECT COUNT() AS count FROM configs') // Verifica se existem dados na base do WebGENTE
    .then(results => {
        if (results[0][0].count == 0) {
            console.log(logTime() + 'Inserindo configurações padrão do WebGENTE')
            Config.bulkCreate(dummyData).then(() => {
                console.log(logTime() + 'Inserindo configurações padrão do WebGENTE...OK')
            })
        }
    })
    .then(() => {console.log(logTime() + 'Model de Configurações sincronizado com sucesso.')})    
    .catch(error => {
        console.error(logTime(),error)
    });
});

module.exports = Config;

