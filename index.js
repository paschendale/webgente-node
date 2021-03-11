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
const { query, config } = require('./database/connection.js');

/* Cabeçalho de autenticação do usuário com o Geoserver 

A chave de autenticação após 'Basic' é uma codificação Base64 no formato usuario:senha

Sendo um usuário do Geoserver configurado adequadamente para acesso aos serviços */

var headers = {};

Config.findOne({
	raw:true,
	attributes: ['serverUser','serverPassword']
}).then(results => {
	headers['authorization'] = 'Basic ' + Buffer.from(results.serverUser + ':' + results.serverPassword).toString('base64')
	console.log(headers.authorization)
})

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
	Config.findOne({raw: true})
	.then(results => {
		console.log(results)
		res.render("index", {
			buttons: buttons,
			startupLat: results.startupLat,
			startupLong: results.startupLong,
			startupZoom: results.startupZoom
		})
	})
    
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
			res.render("layer_details.ejs",{edit: false})
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
					fields: req.body.fields,
					allowedFields:  req.body.allowedFields,
					queryFields:  req.body.queryFields,
					fieldAlias:  req.body.fieldAlias,
					fieldType: req.body.fieldType
				}
				).then(console.log('Succesfully inserted data into database!', req.body))
				.then(res.render("layers"))
				.catch((error) => {console.log('Failed to insert data into database. '+error)})
		} else {
			res.redirect('/')
		}
	})

/* Rota para adicionar novo usuário - Rotas protegidas pela sessão */
app.route('/user/add')
.get((req,res) => {
		if(req.session.user){
			res.render("add_user.ejs")
		} else {
			res.redirect('/')
		}		
	})
.post((req,res) => { //TODO: verificar se dados estão ok antes de dar entrada no banco usando o node-sanitize
	if(req.session.user){
		/* Hash na senha digitada pelo usuário */
		const password = bcrypt.hashSync(req.body.password, 10);
		Users.create(
			{
				userName: req.body.userName,
				password:  password, 
				birthDate:  req.body.birthDate,
				email:  req.body.email,
				group: 'admin'
			}
			).then(console.log('Succesfully inserted data into database!', req.body))
			.then(res.render("users"))
	} else {
		res.redirect('/')
	}
})

app.route('/layers/edit/:id')
	.get((req,res) => {	
		if(req.session.user){
			Layers.findOne({
				raw:true,
				where: {
					id: req.params.id
				}
			})
			.then(layerData => {
				console.log('Dados enviados da layer '+layerData.layer+' com id: '+layerData.id)
				res.render('layer_details.ejs',{
					edit: true,
					id: layerData.id,
					layerName: layerData.layerName,
					group: layerData.group,
					layer: layerData.layer,
					type: layerData.type,
					host: layerData.host,
					defaultBaseLayer: layerData.defaultBaseLayer,
					allowedFields: layerData.allowedFields,
					fieldAlias: layerData.fieldAlias,
					queryFields: layerData.queryFields,
					metadata: layerData.metadata
				})
			})
			.catch(() => {
				res.redirect('/layers')
			})			
		} else {
			res.redirect('/')
		}
	})
	.post((req,res) => { //TODO: verificar se dados estão ok antes de dar entrada no banco usando o node-sanitize
		if(req.session.user){
			Layers.update(
				{
					type: req.body.type,
					layerName:  req.body.layerName, 
					group:  req.body.group,
					host:  req.body.host,
					layer:  req.body.layer,
					defaultBaseLayer:  req.body.defaultBaseLayer,
					fields: req.body.fields,
					allowedFields:  req.body.allowedFields,
					queryFields:  req.body.queryFields,
					fieldAlias:  req.body.fieldAlias,
					fieldType: req.body.fieldType,
					metadata: req.body.metadata
				},
				{
					where: {
						id: req.params.id
					}
				}
				).then(console.log('Succesfully inserted data into database!', req.body))
				.then(res.render("layers"))
				.catch((error) => {console.log('Failed to update database. '+error)})
		} else {
			res.redirect('/')
		}
	})

/* Rota para obtênção de lista de camadas */
app.get('/listlayers', (req,res) => {
	Layers.findAll({raw: true,
	attributes: ['id','type','layerName','group','layer','attribution','defaultBaseLayer','host','fieldAlias', 'metadata']})
	.then(
		result => {
			res.send(result)
		}
	)
})

/*Rota para obter a lista dos usuários - Rota protegida pela sessão*/
/*Os usuários que a rota retorna são todos os diferentes daquele que estar logado no momento*/
app.get('/listusers', (req,res) => {
	if(req.session.user){
		console.log(req.session.user.name);
		Users.findAll({raw: true,
		where: { userName:{ [Op.ne]: req.session.user.name }},
		attributes: ['id', 'userName', 'birthDate', 'email', 'group']})
		.then(
			result => {
				console.log(result);
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

/* Rota para excluir um usuário do sistema - Rota protegida pela sessão */
app.route('/users/delete/:id')
	.get((req,res) => {	
		if(req.session.user){
			Users.destroy({
				raw:true,
				where: {
					id: req.params.id
				}
			})
			.catch(() => {
				res.redirect('/users')
			})			
		} else {
			res.redirect('/')
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
			Config.findOne({raw:true})
			.then( results => {
				res.render("config",
				{
					serverUser: results.serverUser,
					serverPassword: results.serverPassword,
					serverHost: results.serverHost,
					startupLat: results.startupLat,
					startupLong: results.startupLong,
					startupZoom: results.startupZoom
				})
			})	
		}
		else{
			res.redirect('/');
		}
	})
	.post((req, res) => { 
		console.log(req.body)
		if(req.session.user){
			Config.update(
				{
					serverUser: req.body.serverUser,
					serverPassword: req.body.serverPassword,
					serverHost: req.body.serverHost,
					startupLat: req.body.startupLat,
					startupLong: req.body.startupLong,
					startupZoom: req.body.startupZoom
				},
				{
					where: {
						profile: 'webgente-default'
					}
				}
			).then(() => {
				console.log('Dados de configuração atualizados com sucesso')
				res.redirect('/config')
			}).catch((error) => {
				console.log('Não foi possível atualizar as configurações. Motivo: ' + error)
				res.send('Ocorreu algum erro')
			})
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
	
	Config.findOne({
		raw:true,
		attributes: ['serverHost']
	})
	.then(results => {
		console.log('GetFeatureInfo requisition sent, querying layers: ' + params.query_layers)
		console.log(results.serverHost+urlParameters)
		fetch(results.serverHost+urlParameters, {method : 'GET', headers: headers})
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
					console.log(result)
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
})

/* Recolher campos pesquisáveis no banco de dados */
app.get('/listqueryable',(req,res)=>{
	Layers.findAll({ 
		raw: true,
		attributes: ['layerName','layer','queryFields' ,'fields','fieldAlias', 'fieldType'],
		where: { type: '2',
		[Op.not]:{queryFields: null}
	}

	}).then(results => {
	
	//Função para adaptar retorno do banco de dados	
	for(var n=0;n<results.length;n++){
	//Objeto com o retorno ordenadado por propriedade:	
		var fields= {
			field:((results[n].fields).split(',')),
			queryFields: ((results[n].queryFields).split(',')),
			fieldAlias: ((results[n].fieldAlias).split(',')),
			fieldType: ((results[n].fieldType).split(','))
    	}
		var properties_order= new Object()
	
		for(var n2=0;n2<fields.field.length;n2++){
		//Objeto com retorno ordenado pela chave e campos pesquisáveis definidos 		
			if(getBool(fields.queryFields[n2])){
				properties_order[fields.field[n2]]= {
				'fieldAlias': fields.fieldAlias [n2],
				'fieldType':fields.fieldType[n2]
				}
		}
		
		}
		results[n]= {
			'layerName': results[n].layerName,
			'layer': results[n].layer,
			'queryFields': properties_order
		}
		//Restrição de atributos para usuário restrito
		if(req.session.user==false){
			restrictAttributes(new Array (results[n]),'layer','queryFields')
			.then(result => {
				results[n]=result
			})	
			
		}

		//Remove camadas que possuam queryFields vazio 
		if( !Object.entries(results[n].queryFields).length){
			results.splice(n,1)
		}
	}

	res.send(results)
	
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

/* Requisições WFS */
app.get('/wfs/:layer/:properties/:format/:cql_filter/:host',(req,res)=>{

	// TODO: Implementar verificação se resultado apresenta todas as restrições necessárias ao seu token

		params = {
			service: 'WFS',
			version: '1.3.0',
			request: 'GetFeature',	
			typeName: req.params.layer,
			outputFormat: req.params.format,
			exceptions: 'application/json',
			propertyName: req.params.properties,
			SrsName : 'EPSG:4326',
			cql_filter: req.params.cql_filter
		}
		
		var urlWfs = Object.entries(params).map(e => e.join('=')).join('&');
		
		fetch(req.params.host+encodeURI(urlWfs), {method : 'GET', headers: headers})
		.then(res => res.text())
		.then(data => {
			console.log('WFS requisition sent, querying layers: ' + req.params.layer)
			console.log(req.params.host+encodeURI(urlWfs))
			res.send(data)
		})
})

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
