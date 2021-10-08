const moment = require('moment');

function logTime() {
    return moment().format('MMMM Do YYYY, h:mm:ss a') + ' | '
}

const Sequelize = require('sequelize');
const connection = require('../connection');
const { sequelize } = require('./User');

const Layers = connection.define('Layers', {
    type: { // Tipo da camada: 1 -> Camada Base, 2 -> Camada Overlay, 3 -> Modelo Digital de Elevação
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
        defaultValue: '<a href="https://www.github.com/paschendale/webgente-node" target="_blank">WebGENTE</a>'
    },
    defaultBaseLayer: {
        type: Sequelize.BOOLEAN
    },
    host: {
        type: Sequelize.STRING,
        allowNull: false
    },
    publicLayer: {
        type: Sequelize.BOOLEAN
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
    },
    metadata: {// Link para metadados de acordo com perfil MGB
        type: Sequelize.STRING
    }
})

/* Dados padrão para serem inseridos na inicialização limpa do WebGENTE */
var dummyData = [{
    type: 1 ,
    layerName: 'Imageamento Aéreo e Orbital',
    group: 'Camadas Base',
    defaultBaseLayer: true,
    publicLayer: true,
    layer: 'ufv:imageamento_vicosa',
    host: 'https://maps.genteufv.com.br/geoserver/ufv/wms?',
    attribution: 'GENTE (2017)',
    metadata: '/metadata/Ortofoto.html',
    createdAt: new Date(),
    updatedAt: new Date()
},{
    type: 3 ,
    layerName: 'Modelo Digital de Elevação',
    group: 'Camadas Base',
    defaultBaseLayer: false,
    publicLayer: true,
    layer: 'ufv:mde_vicosa',
    host: 'https://maps.genteufv.com.br/geoserver/ufv/wms?',
    attribution: 'GENTE (2021)',
    metadata: 'metadata/MDE.html',
    createdAt: new Date(),
    updatedAt: new Date()
},{
    type: 2 ,
    layerName: 'Lotes',
    group: 'Cadastro',
    layer: 'ufv:CAD_Lote',
    publicLayer: true,
    host: 'https://maps.genteufv.com.br/geoserver/ufv/wms?',    
    metadata: '/metadata/CAD_Lote.html',
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
    layer: 'ufv:CAD_Edificacao',
    publicLayer: true,
    host: 'https://maps.genteufv.com.br/geoserver/ufv/wms?',    
    metadata: '/metadata/CAD_Edificacao.html',
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
    layer: 'ufv:CAD_Geocodificacao',
    publicLayer: false,
    host: 'https://maps.genteufv.com.br/geoserver/ufv/wms?',    
    metadata: '/metadata/CAD_Geocodificacao.html',
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
    layer: 'ufv:CAD_Secao_Logradouro',
    publicLayer: true,
    host: 'https://maps.genteufv.com.br/geoserver/ufv/wms?',    
    metadata: '/metadata/CAD_Secao_Logradouro.html',
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
    publicLayer: true,
    layer: 'ufv:PTO_Panoramas',
    allowedFields: 'false,false,false,true',
    queryFields: 'false,false,false,false',
    fieldAlias: ',,,',
    fields: 'id,geom,path_360,path_360_min',
    host: 'https://maps.genteufv.com.br/geoserver/ufv/wms?',    
    metadata: '/metadata/PTO_Panoramas.html',
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
            console.log(logTime() + 'Inserindo Camadas padrão do WebGENTE')
            Layers.bulkCreate(dummyData).then(() => {
                console.log(logTime() + 'Inserindo Camadas padrão do WebGENTE...OK')
            })
        }
    })    
    .then(() => {console.log(logTime() + 'Model de Camadas sincronizado com sucesso.')})
    .catch(error => (console.error(error)));
    ;
});

module.exports = Layers;