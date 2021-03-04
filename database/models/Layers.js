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
    attribution: {
        type: Sequelize.STRING,
        defaultValue: '<a href="https://www.github.com/paschendale/webgente" target="_blank">WebGENTE</a>'
    },
    defaultBaseLayer: {
        type: Sequelize.BOOLEAN
    },
    host: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fields : {
        type: Sequelize.STRING
    },
    allowedFields: { // Nome dos campos liberados nas interfaces anônimas, separados por vírgula
        type: Sequelize.STRING
    },
    queryFields: { // Nome dos campos pesquisáveis da camada, separados por vírgula
        type: Sequelize.STRING
    },
    fieldAlias: { // Apelidos para a exibição dos nomes no placeholder do formulário de pesquisa, deve ser definido na mesma ordem de queryFields, separados por vírgula
        type: Sequelize.STRING
    },
    fieldType: { // Tipo do campo para designar o tipo de formulário de pesquisa
        type: Sequelize.STRING
    }
})

/* Dados padrão para serem inseridos na inicialização limpa do WebGENTE */
var dummyData = [{
    type: 1 ,
    layerName: 'Ortofoto',
    group: 'Camadas Base',
    defaultBaseLayer: true,
    layer: 'gianetti:ortofoto_gianetti',
    host: 'http://nuvem.genteufv.com.br:8080/geoserver/gianetti/wms?',
    createdAt: new Date(),
    updatedAt: new Date()
},{
    type: 2 ,
    layerName: 'Lotes',
    group: 'Cadastro',
    layer: 'gianetti:CAD_Lote',
    host: 'http://nuvem.genteufv.com.br:8080/geoserver/gianetti/wms?',
    fields: 'id,geom,distrito,setor,quadra,lote,inscricao_lote',
    allowedFields: 'true,true,false,false,false,false,true',
    queryFields: 'false,false,false,false,false,false,true',
    fieldAlias: ',,,,,,Inscrição do Lote',
    fieldType:'int,Geometry,int,int,int,int,string',
    createdAt: new Date(),
    updatedAt: new Date()
},{
    type: 2 ,
    layerName: 'Edificações',
    group: 'Cadastro',
    layer: 'gianetti:CAD_Edificacao',
    host: 'http://nuvem.genteufv.com.br:8080/geoserver/gianetti/wms?',
    fields: 'id,geom,inscricao',
    allowedFields: 'false,false,true',
    queryFields: 'false,false,true',
    fieldAlias: ',,Inscrição Cadastral',
    fieldType: 'int,MultiPolygon,string',
    createdAt: new Date(),
    updatedAt: new Date()
},{
    type: 2 ,
    layerName: 'Geocodificações',
    group: 'Cadastro',
    layer: 'gianetti:CAD_Geocodificacao',
    host: 'http://nuvem.genteufv.com.br:8080/geoserver/gianetti/wms?',
    fields: 'id,geom,distrito,setor,quadra,lote,unidade,inscricao,inscricao_anterior,proprietario_,cpf,logradouro_correspondencia,numero_correspondencia,complemento_correspondencia,bairro_correspondencia,cep_correspondencia,ocupacao,utilizacao,patrimonio,imune_isento_iptu,imune_isento_tsu,foto',
    allowedFields: 'false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false',
    queryFields: 'false,false,false,false,false,false,false,true,true,true,true,false,false,false,false,false,false,false,false,false,false,false',
    fieldAlias: ',,,,,,,Inscrição Cadastral,Inscrição Anterior,Nome do Proprietário,CPF do Proprietário,,,,,,,,,,,',
    fieldType:'int,Point,int,int,int,int,int,string,string,string,int,string,int,string,string,int,int,int,int,int,int,string',
    createdAt: new Date(),
    updatedAt: new Date()
},{
    type: 2 ,
    layerName: 'Seções de Logradouro',
    group: 'Cadastro',
    layer: 'gianetti:CAD_Secao_Logradouro',
    host: 'http://nuvem.genteufv.com.br:8080/geoserver/gianetti/wms?',
    fields: 'id,geom,tipo,nome_logradouro,codigo,secao_e,secao_d',
    allowedFields: 'false,false,true,true,true,true,true',
    queryFields: 'false,false,true,true,true,true,true',
    fieldAlias: ',,Tipo,Nome,Código,Seção Esquerda,Seção Direita',
    fieldType: 'int,MultiLineString,string,string,int,int,int',
    createdAt: new Date(),
    updatedAt: new Date()
},{
    type: 2 ,
    layerName: 'Panoramas 360°',
    group: 'Panoramas 360°',
    layer: 'gianetti:PTO_Panoramas',
    allowedFields: 'false,false,false,true',
    queryFields: 'false,false,false,false',
    fieldAlias: ',,,',
    fields: 'id,geom,path_360,path_360_min',
    host: 'http://nuvem.genteufv.com.br:8080/geoserver/gianetti/wms?',
    fieldType: 'int,Point,string,string',
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