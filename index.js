const express = require('express');
const app = new express(); // Inicializando objeto do express para execução do servidor HTTP
const bodyParser = require("body-parser");
const { Op } = require("sequelize"); 

/* Estrutura de pastas do WebGENTE:

database > Contém bases de dados e modelos utilizados pelo Sequelize. Para cada modelo deve-se criar um novo arquivo .js com o a primeira letra Maiuscula, indicando o nome da tabela criada.

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
porta = 3000; // Porta de inicialização do servidor
app.listen(porta,() => {
    console.log('WebGENTE iniciado no endereço http://localhost:'+porta)
});

/* Criando rota da página inicial */
app.get('/',(req,res) => {
    res.render("index")
})