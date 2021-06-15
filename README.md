## WebGENTE - Um WebGIS para Cadastro

O WebGENTE é um projeto de cartografia cadastral na Web desenvolvido por [Victor Marotta](#Coordenação) e o [Grupo de Engenharia para Gestão Territorial da Universidade Federal de Viçosa](www.genteufv.com.br), tem como objetivo criar um framework para a disponibilização de dados cadastrais e criação de ferramentas para a administração pública de forma rápida e eficiente.

O sistema, lançado em 2020, teve sua primeira versão desenvolvida como um framework Javascript de navegador voltado para hospedagem em servidores HTTP como o Apache, Nginx e etc. Em 2021 a equipe de desenvolvimento optou por lançar uma segunda versão baseada no interpretador Javascript Node.js, implementando além da lógica de programação voltada ao navegador do WebGENTE 0 diversas funções de segurança, processamento do lado do servidor e rearquitetando o sistema ainda mais conforme as diretrizes de Arquitetura Orientada a Serviços.

Com o lançamento do WebGENTE 1 o desenvolvimento do WebGENTE 0 foi descontinuado, entretanto, caso você tenha interesse na aplicação acesse o [Repositório do WebGENTE 0](https://github.com/paschendale/webgente).

A documentação, bem como a página oficial do sistema está disponível no [site oficial do sistema](https://webgente.genteufv.com.br/), é lá também que divulgamos as novidades e tutoriais de uso do WebGENTE. O desenvolvimento do WebGENTE é direcionado pelo [nosso Roadmap](https://trello.com/b/m0kp6VkF), lá você pode conferir o que está por vir nas próximas atualizações do framework. 

Caso tenha interesse em contribuir com nosso sistema não deixe de conferir nossas [diretrizes de contribuição para este projeto](CONTRIBUTING.md)

## Como instalar

Para instalar o WebGENTE basta clonar nosso repositório ou baixar a versão desejada e instalar as dependências utilizando seu gerenciador de pacotes do Node.js favorito. Nós recomendamos o uso do `yarn` devido à alguns problemas com dependências no repositório do `npm`.

1. Faça download e instale o [Node.js](https://nodejs.org/en/) em seu computador, caso deseje utilizar o `yarn` faça o download e instale através do gerenciador de pacotes `npm`

`npm install -g yarn`

2. Clone o repositório, alterando o <tagname> para o nome da versão que quer instalar (confira nosso sistema de versionamento [aqui](CONTRIBUTING.md))

`git clone -b <tagname> https://github.com/paschendale/webgente-node.git`

ou faça download do arquivo compactado [aqui](https://github.com/paschendale/webgente-node/releases).

3. Instale as dependências do WebGENTE

`yarn install` ou `npm install --save`

4. Inicialize o WebGENTE

`node index.js`

5. Acesse o sistema através de seu navegador pelo endereço [http://localhost:3000](http://localhost:3000)

## Equipe de Desenvolvimento

A equipe de desenvolvimento do WebGENTE é composta por:

### Coordenação
[**Victor Marotta - @paschendale**](https://github.com/paschendale)

MSc. Engenheiro Civil e Engº Agrimensor e Cartógrafo 

### Desenvolvimento
[**Carlos Henrique Tavares - @TavaresCarlos**](https://github.com/TavaresCarlos)
Bacharel em Ciência da Computação pela UFV

[**Sabrina Roberta - @sabrin577**]((https://github.com/sabrin577))
Estudante de Engenharia de Agrimensura e Cartográfica na UFV

[**Brenda Batista de Almeida - @brendalmeida**]((https://github.com/brendalmeida))
Estudante de Engenharia de Agrimensura e Cartográfica na UFV

[**Guilherme Rosemberg Fernandes - @guirosemberg**]((https://github.com/guirosemberg))
Estudante de Engenharia de Agrimensura e Cartográfica na UFV

## Referências

[Repositório do WebGENTE 0 - Descontinuado](https://github.com/paschendale/webgente)

[Site oficial do WebGENTE](https://www.webgente.genteufv.com.br/)

[Marotta et al, 2020 - WebGENTE - Desenvolvimento de um framework open source para um WebGIS cadastral](https://www.researchgate.net/publication/344570062_WEBGENTE_DESENVOLVIMENTO_DE_UM_FRAMEWORK_OPEN_SOURCE_PARA_UM_WEBGIS_CADASTRAL)

