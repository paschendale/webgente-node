const express = require('express');
const app = new express(); // Inicializando objeto do express para execução do servidor HTTP
const bodyParser = require("body-parser");
const { Op } = require("sequelize"); 
const session = require("express-session");
const bcrypt = require("bcrypt");
const conn = require("./database/connection.js")
const Layers = require("./database/models/Layers.js")
const Users = require("./database/models/User.js")
const Config = require("./database/models/Config.js")
const fetch = require('node-fetch');
const sanitize = require('sanitize')
const { query } = require('./database/connection.js');

/* Cabeçalho de autenticação do usuário com o Geoserver 

A chave de autenticação após 'Basic' é uma codificação Base64 no formato usuario:senha

Sendo um usuário do Geoserver configurado adequadamente para acesso aos serviços */

var headers = {
	authorization: 'Basic Z2Vvc2VydmVyOkB6aCVJcUxRRnBjeg==' 
};

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

app.use(session({
	secret: "segredo_webgente", 
	resave: false,
	saveUninitialized: true,
	cookie: {maxAge: 7200000 /*120 min*/ }
}))

app.use(express.static('public'));

app.use("/img", express.static(__dirname + "public/img"));

/* Habilitando bodyparser para extender a leitura de parametros na URL no req.body */
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

/* Inicializando o servidor HTTP */
port = 3000; // Porta de inicialização do servidor
app.listen(port,() => {
    console.log('WebGENTE started at http://localhost:'+port)
});

/* Habilitando CORS headers para todas as respostas dadas pelo backend */
app.use(function(req,res,next) {
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
	next();
})

/* Rota da página inicial */
app.get('/',(req,res) => {
	var buttons = true;
    res.render("index", {buttons: buttons})
})

/* Rota da tela de Login */
app.get('/login', (req, res) => {
	var buttons = false;
	var error = '';
	res.render("login", { buttons: buttons, error: error })
});

/* Autenticação do usuário */
app.post('/authenticate', (req, res) => {
	const email = req.body.email;
	const password = req.body.senha;

	Users.findOne({ where:{ email: email }}).then((user) => {
		if(user != undefined){
			if(bcrypt.compareSync(password, user.password)){
				req.session.user = {
					name: user.userName,
					group: user.group,
					email: user.email
				}
				//Definindo o redirecionamento conforme o grupo do usuário
				if(req.session.user.group == 'admin'){
					res.redirect('/admin');
				}
				/*else if(req.session.user.group == 'publico'){
					res.redirect('/');
				}*/
			}
			else{
				//$('#errorMessage').append("Senha errada");
				var error = "Wrong username or password";
				var buttons = false;
				res.render("login", { buttons, error });
			}
		}
		else{
			//$('#errorMessage').append("Usuario nao encontrado");
			var error = "Wrong username or password";
			var buttons = false;
			res.render("login", { buttons, error });
		}
	})
})

/* Rota de logout do usuário */
app.get('/logout', (req, res) => {
	req.session.user = undefined;
	res.redirect('/');
})

/* Rotas da Interface de administração - Rota protegida pela sessão*/
app.get('/admin', (req, res) => {
	if(req.session.user){
		res.render("home")
	}
	else{
		res.redirect('/');
	}
})

/* Rota para página de gerenciamento de camadas - Rota protegida pela sessão */
app.route('/layers')
	.get((req, res) => {
		if(req.session.user){
			res.render("layers")
		} else {
			res.redirect('/')
		}		
	})

/* Rota para adição de novas camadas - Rotas protegidas pela sessão */	
app.route('/layers/add')
	.get((req,res) => {
		if(req.session.user){
			res.render("add_layer.ejs")
		} else {
			res.redirect('/')
		}		
	})
	.post((req,res) => { //TODO: verificar se dados estão ok antes de dar entrada no banco usando o node-sanitize
		if(req.session.user){
			Layers.create(
				{
					type: req.body.type,
					layerName:  req.body.layerName, 
					group:  req.body.group,
					host:  req.body.host,
					layer:  req.body.layer,
					defaultBaseLayer:  req.body.defaultBaseLayer,
					allowedFields:  req.body.allowedFields,
					queryFields:  req.body.queryFields,
					fieldAlias:  req.body.fieldAlias
				}
				).then(console.log('Succesfully inserted data into database!', req.body))
				.then(res.render("layers"))
		} else {
			res.redirect('/')
		}
	})

/* Rota para obtênção de lista de camadas */
app.get('/listlayers', (req,res) => {
	Layers.findAll({raw: true,
	attributes: ['id','type','layerName','group','layer','attribution','defaultBaseLayer','host','fieldAlias']})
	.then(
		result => {
			res.send(result)
		}
	)
})

/* TODO: Popular o campo Layer.fields com a lista de campos através da rota describeFeatureType na inicialização do sistema */



/*Rota para obter a lista dos usuários - Rota protegida pela sessão*/
app.get('/listusers', (req,res) => {
	if(req.session.user){
		Users.findAll({raw: true,
		attributes: ['userName', 'birthDate', 'email', 'group']})
		.then(
			result => {
				res.send(result)
			}
		)
	}
	else{
		res.redirect('/');
	}
})

/* Rota para página de gerenciamento de usuários - Rota protegida pela sessão*/
app.get('/users', (req, res) => {
	if(req.session.user){
		Users.findAll({raw: true})
		.then(
			result => {
				res.render("users", { 
					users: result 
				});
			}
		)	
	}
	else{
		res.redirect('/');
	}	
})

/* Rota para página 'Sobre' na interface de administração - Rota protegida pela sessão */
app.get('/about', (req, res) => {
	if(req.session.user){
		res.render('about')	
	}
	else{
		res.redirect('/');
	}
})

/* Rota para configurações gerais do WebGENTE na interface de administração */
app.route('/config')
	.get((req, res) => {
		if(req.session.user){
			Config.findAll({raw:true})
			.then( results => {
				res.render("config",
				{config: results})
			})	
		}
		else{
			res.redirect('/');
		}
	})
	.post((req, res) => { 
		if(req.session.user){
			console.log(req.params.mapServerUser);	
		}
		else{
			res.redirect('/');
		}		
	});

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
		info_format: 'application/json', // Formato de resposta do GetFeatureInfo
		feature_count: '50', // Puxar até 50 feições
		x: Math.round(req.params.x),
		y: Math.round(req.params.y)
	};

	let urlParameters = Object.entries(params).map(e => e.join('=')).join('&');
	var url = 'http://nuvem.genteufv.com.br:8080/geoserver/gianetti/wms?' // TODO: Puxar este link da configuração

	console.log('GetFeatureInfo requisition sent, querying layers: ' + params.query_layers)
	console.log(url+urlParameters)
	fetch(url+urlParameters, {method : 'GET', headers: headers})
	.then(res => res.text())
	.then(data => {
		if(req.session.user){  // Caso o usuário esteja logado, repassa a requisição do GFI sem restrições
			console.log('Usuário logado, getFeatureInfo enviado!')
			data = JSON.parse(data)
			res.send(data); 
		} else {
			console.log('Usuário requisitou getFeatureInfo sem login')
			data = JSON.parse(data)
			//restrição de dados		
			restrictAttributes(data.features,'id','properties')
			.then(result => {
				if( result[0]!=undefined){
					data.features=result
					res.send(data)
				} else { // Envia um array vazio caso a resposta do GFI seja nula
					data.features = [];
					res.send(data)
				}
			})		
		}	
	})
	.catch(err => {
		res.send(err);
	});	
})

//Recolher campos pesquisáveis no banco de dados 
app.get('/listqueryable',(req,res)=>{
	Layers.findAll({ 
		raw: true,
		attributes: ['layerName','layer','queryFields','fieldAlias', 'fieldType'],
		where: { type: '2',
		[Op.not]:{queryFields: null}
	}

	}).then(results => {
	
	//Função para adaptar retorno do banco de dados	
	for(var n=0;n<results.length;n++){
		var results_order= new Array()
		var querys= (results[n].queryFields).split(',')
		var alias= (results[n].fieldAlias).split(',')
		var type= (results[n].fieldType).split(',')
		for(var n2=0;n2<querys.length;n2++){
			var inter= new Object()
			inter[querys[n2]]= {
				'fieldAlias': alias[n2],
				'fieldType':type[n2]
			}
			results_order.push(inter)
		
		}
		results[n]= {
			'layerName': results[n].layerName,
			'layer': results[n].layer,
			'queryFields': results_order
		}
	
	}

	if(req.session.user){
		res.send(results)
	}else{
		//results=restrictAttributes(results,'layer','queryFields')
		res.send(results)
	}
	
	})
})


/* Restringindo atributos de uma única feição */
async function restrictAttributes (features,layerKey,fieldKey){

	var restrictedData = new Array(); 
	
	for (feature of features){ // Itera em cada camada

		// Função para recuperar os campos permitidos de cada camada
		async function getAllowedFields (feature){ 

			var restrict= new Object();

			//Recuperando campos permitidos para a camada do banco de dados
			await Layers.findOne({ 
				raw: true,
				attributes: ['fields','allowedFields'],
				where: { 
				layer:{
					[Op.like]: '%'+(((feature[layerKey]).split('.'))[0])+'%'} 
				}
			}).then(results => {
				fields = results.fields.split(',')
				allowedFields = results.allowedFields.split(',')
			})
			console.log(feature)

			if(allowedFields.indexOf('true') != -1){ 
				/* TODO: Caso a camada não possua nenhum campo permitido ela deve ser excluída  */
				for(i = 0; i < fields.length; i++){
					if(getBool(allowedFields[i])) {
						restrict[fields[i]] = feature[fieldKey][fields[i]]
					}
				}
				feature[fieldKey] = restrict
				return feature
			} else {
				feature[fieldKey] = [];
				return feature
			}
		}

		restrictedData.push(await getAllowedFields(feature))	

	}

	return restrictedData
}

// Transforma uma string true or false em um elemento boolean
function getBool(val) {
    return !!JSON.parse(String(val).toLowerCase());
}

// Check se a variavel de host é uma URL válida
function isURL(string) {
	let url;
	
	try {
		url = new URL(string);
	} catch (_) {
		return false;  
	}
	
	return url.protocol === "http:" || url.protocol === "https:";
}

/* Rota para requisição WFS describeFeatureType */
app.get('/describeLayer/:layer/:host',(req,res) => {



	if(req.session.user){
		params = {
			service: 'WFS',
			version: '1.3.0',
			request: 'describeFeatureType',	
			typeName: req.params.layer,	
			outputFormat: 'application/json',
			exceptions: 'application/json'
		}

		if (isURL(req.params.host) ==  false) {res.send('Não foi possível completar a requisição')}
		
		let urlParameters = Object.entries(params).map(e => e.join('=')).join('&');
	
		console.log('describeFeatureType requisition sent, querying layers: ' + params.typeName)
		console.log(req.params.host+urlParameters)
	
		fetch(req.params.host+urlParameters, {method : 'GET', headers: headers})
		.then(res => res.text())
		.then(data => res.send(data))
	}
	else{
		res.redirect('/');
	}
})