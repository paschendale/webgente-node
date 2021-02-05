const express = require('express');
const app = new express(); // Inicializando objeto do express para execução do servidor HTTP
const bodyParser = require("body-parser");
const { Op } = require("sequelize"); 
const conn = require("./database/connection.js")
const Layers = require("./database/models/Layers.js")
const Users = require("./database/models/User.js")
const fetch = require('node-fetch');
const { query } = require('./database/connection.js');

/* Estrutura de pastas do WebGENTE:

database > Contém bases de dados e modelos utilizados pelo Sequelize. Para cada tabela deve-se criar um novo arquivo .js 
dentro de 'models' com o a primeira letra Maiuscula, indicando o nome da tabela criada.

node_modules > Contém as dependências do WebGENTE

public > Contém dados estáticos e expostos ao navegador como alguns códigos Javascript carregados externamente, arquivos CSS e imagens.
public >> css > Contem arquivos CSS
public >> img > Contém arquivos IMG
public >> js > Contém arquivos Javascript

views > Contém as views (páginas) do sistema.
views >> partials > Contem as partials do EJS criadas para as views.

index.js > Arquivo de inicialização do WebGENTE

*/

/* Setando repositório de vias estáticas do EJS na pasta 'public'. Todas as views .ejs devem ser criadas lá. */
app.set('view engine','ejs');
app.use(express.static('public'));

/* Habilitando bodyparser para extender a leitura de parametros na URL no req.body */
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

/* Inicializando o servidor HTTP */
port = 3000; // Porta de inicialização do servidor
app.listen(port,() => {
    console.log('WebGENTE started at http://localhost:'+port)
});

/* Habilitando CORS headers para todos os recursos */
app.use(function(req,res,next) {
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
	next();
})

/* Rota da página inicial */
app.get('/',(req,res) => {
    res.render("index")
})

/* Rotas da Interface de administração */
app.get('/admin', (req, res) => {
	res.render("admin")
})

app.get('/camadas', (req, res) => {
	res.render("partials/admin/camadas")
})

// Rota para obtenção da lista de camadas
app.get('/listlayers', (req,res) => {
	Layers.findAll({raw: true,
	attributes: ['type','layerName','group','layer','attribution','defaultBaseLayer','host','fieldAlias']})
	.then(
		result => {
			res.send(result)
		}
	)
})

app.get('/usuarios', (req, res) => {
	res.render("partials/admin/usuarios")
})

app.get('/contato', (req, res) => {
	res.render("partials/admin/contato")
})

app.get('/sobre', (req, res) => {
	res.render("partials/admin/sobre")
})

/* GetFeatureInfo e filtragem de informações */

app.get('/gfi/:service/:request/:version/:feature_count/:srs/:bbox/:width/:heigth/:x/:y/:layers/:query_layers',(req,res) => {

	params = { // https://docs.geoserver.org/stable/en/user/services/wms/reference.html
		service: 'WMS',
		version: '1.1.1',
		request: 'GetFeatureInfo',		
		layers: req.params.layers,
		srs: req.params.srs,
		bbox: req.params.bbox,
		width: req.params.width,
		height: req.params.heigth,
		query_layers: req.params.layers,
		info_format: 'text/html', // Formato de resposta do GetFeatureInfo
		feature_count: '50', // Puxar até 50 feições
		x: req.params.x,
		y: req.params.y
	};

	let urlParameters = Object.entries(params).map(e => e.join('=')).join('&');

	var url = 'http://nuvem.genteufv.com.br:8080/geoserver/gianetti/wms?'

	console.log('GetFeatureInfo requisition sent, querying layers: ' + params.query_layers)

	fetch(url+urlParameters)
    .then(res => res.text())
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.send(err);
    });
})
