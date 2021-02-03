const Sequelize = require('sequelize');
const connection = require('../connection');
const { sequelize } = require('./User');

const Layers = connection.define('Layers', {
    type: { // Tipo da camada: 1 -> Camada Base, 2 -> Camada Overlay
        type: Sequelize.INTEGER
    },
    layerName: { // Nome de exibição da camada
        type: Sequelize.STRING,
        allowNull: false
    },
    group: { // Grupo da camada no menu de camadas
        type: Sequelize.STRING,
        allowNull: false
    },
    layer: { // Nome da camada definido no servidor 
        type: Sequelize.STRING,
        allowNull: false
    },
    host: {
        type: Sequelize.STRING,
        allowNull: false
    },
    restrictedFields: { // Nome dos campos a serem restringidos, separados por vírgula
        type: Sequelize.STRING
    },
    queryFields: { // Nome dos campos pesquisáveis da camada, separados por vírgula
        type: Sequelize.STRING
    },
    fieldAlias: { // Apelidos para a exibição dos nomes no placeholder do formulário de pesquisa, deve ser definido na mesma ordem de queryFields, separados por vírgula
        type: Sequelize.STRING
    },
    maxZoom: { // Zoom máximo da camada, por padrão definido como 22
        type: Sequelize.INTEGER,
        defaultValue: 22
    },
    format: { // Formato de resposta da requisição WMS, por padrão 'image/png'. Pode ser definido como 'image/jpeg' caso a camada seja tipo 1.
        type: Sequelize.STRING,
        defaultValue: 'image/png'
    },
    transparent: { // Especificação do formato de resposta, definido como padrão para 'true' para compatibilizar camadas overlay. Pode ser definido como 'false' somente em camadas base.
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    tiled: { // EEspecifica ou não o uso da camada como Tile Map Service. Por padrão definido como 'true'.
        type: Sequelize.BOOLEAN,
        defaultValue: true
    }
})

/* Dados padrão para serem inseridos na inicialização limpa do WebGENTE */
var dummyData = [{
    type: 1 ,
    layerName: 'Ortofoto',
    group: 'Camadas Base',
    layer: 'gianetti:ortofoto_gianetti',
    host: 'https://geoserver.genteufv.com.br/geoserver/gianetti/wms?',
    createdAt: new Date(),
    updatedAt: new Date()
},{
    type: 2 ,
    layerName: 'Lotes',
    group: 'Cadastro',
    layer: 'gianetti:CAD_Lote',
    host: 'https://geoserver.genteufv.com.br/geoserver/gianetti/wms?',
    createdAt: new Date(),
    updatedAt: new Date()
},{
    type: 2 ,
    layerName: 'Edificações',
    group: 'Cadastro',
    layer: 'gianetti:CAD_Edificacao',
    host: 'https://geoserver.genteufv.com.br/geoserver/gianetti/wms?',
    createdAt: new Date(),
    updatedAt: new Date()
}];

/* Sincroniza o modelo com a base de dados, não substituindo tabelas existentes */
Layers.sync({force: false}).then(() => {
    /* Insere dados padrão do WebGENTE */
    connection.query('SELECT COUNT() AS count FROM Layers') // Verifica se existem dados na base do WebGENTE
    .then(results => {
        if (results[0][0].count == 0) {
            console.log('Inserindo dados padrão do WebGENTE')
            Layers.bulkCreate(dummyData)
        }
    });
});

module.exports = Layers;