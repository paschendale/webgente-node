## WebGENTE 

O WebGENTE é um projeto de cartografia cadastral na Web desenvolvido pelo [Grupo de Engenharia para Gestão Territorial da Universidade Federal de Viçosa](www.genteufv.com.br), tem como objetivo criar um framework para a disponibilização de dados cadastrais e criação de ferramentas para a gestão territorial de forma rápida e eficiente.

O sistema, lançado em 2020, teve sua primeira versão desenvolvida como um framework Javascript de navegador voltado para hospedagem em servidores HTTP como o Apache, Nginx e etc. Em 2021 a equipe de desenvolvimento optou por lançar uma segunda versão baseada no interpretador Javascript Node.js, implementando além da lógica de programação voltada ao navegador do WebGENTE 0 diversas funções de segurança, processamento do lado do servidor e rearquitetando o sistema ainda mais conforme as diretrizes de Arquitetura Orientada a Serviços.

Com o lançamento do WebGENTE 1 o desenvolvimento do WebGENTE 0 foi descontinuado, entretanto, caso você tenha interesse na aplicação acesse o [Repositório do WebGENTE 0](https://github.com/paschendale/webgente).

A documentação, bem como a página oficial do sistema está disponível no [site oficial do sistema](https://webgente.genteufv.com.br/), é lá também que divulgamos as novidades e tutoriais de uso do WebGENTE. 

Caso tenha interesse em contribuir com nosso sistema não deixe de conferir nossas [diretrizes de contribuição para este projeto](CONTRIBUTING.md)

## Como Instalar

O WebGENTE agora pode ser utilizado tanto via `Docker` quanto pelo `Node` e `npm`. 

[Instalando via Docker](#instalação-via-docker)

[Instalando via npm](#instalação-via-npm)

## Instalação via Docker

1. Para instalar o WebGENTE via Docker você primeiro deverá ter o Docker instalado em seu computador. Acesse a [documentação oficial do Docker](https://docs.docker.com/get-started/#download-and-install-docker) e siga os passos antes de iniciar a instalação do WebGENTE.

2. Uma vez instalado o Docker, inicialize o WebGENTE através do comando:

```
docker run -d -p 3000:3000 paschendale/webgente:latest
``` 

3. Acesse o sistema pelo endereço [http://localhost:3000](http://localhost:3000)

Notas:
- A opção `-d` faz com que o WebGENTE seja executado em segundo plano. 
- A opção `-p 3000:3000` faz com que o WebGENTE seja executado na porta 3000, caso deseje a execução em uma porta diferente, por exemplo, a porta 4000, faça `-p 4000:3000`
- A opção `paschendale/webgente:latest` faz com que seja executada a última versão do WebGENTE, caso deseje uma versão específica, por exemplo, a versão 1.5, faça `paschendale/webgente:1.5`.
- O WebGENTE em Docker está disponível somente à partir da versão 1.5, as versões lançadas no repositório do Github coincidem com as versões lançadas no Docker Hub, sendo assim, [a versão webgente-node-1.5 no Github](https://github.com/paschendale/webgente-node/releases/tag/1.5) corresponde à [versão paschendale/webgente:1.5 do Docker Hub](https://hub.docker.com/layers/193256347/paschendale/webgente/1.5/images/sha256-d2f8aff74e318fd909ba0b2b548b2d421365fd834cd148bd34841399b1216866?context=repo)

Para parar a execução do WebGENTE, execute o comando:

`docker ps`

Identifique o ID do container rodando o WebGENTE e faça:

`docker stop <container-id>`

A execução do WebGENTE pelos comandos anteriores não permite alterações em seu conteúdo, por exemplo, criação de usuários e alterações de camadas. Todas as alterações realizadas serão resetadas após parar o container. Para habilitar a persistência dos dados deve-se realizar a montagem de uma pasta ou local do host dentro do container, siga os passos à seguir para habilitar a funcionalidade. 

1. Crie uma pasta `webgente_db` em um diretório. 

2. No terminal, navegue até a pasta anterior à `webgente_db`, por exemplo, se criada a pasta `/var/opt/webgente_db`, navegue até `/var/opt`

3. Execute o seguinte comando:

```
docker run \
    -v $(pwd)/webgente_db:/usr/src/app/db \
    -d \
    -p 3000:3000 \
    paschendale/webgente:latest
``` 

Notas: 
- A opção `-v` cria um volume dentro do container no formato `caminho_host:caminho_container`, na versão Docker do WebGENTE o `caminho_container` deverá sempre ser `/usr/src/app/db`
- O trecho `$(pwd)` permite o uso de caminhos relativos, por exemplo, se o comando é executado dentro de `/var/opt`, o trecho `$(pwd)/webgente_db` corresponde a `/var/opt/webgente_db`. Você também pode utilizar caminhos absolutos na definição do `caminho_host`
- Em hosts Windows, substitua o trecho `$(pwd)` por `${pwd}`

## Instalação via npm

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

## Referências

Ao utilizar o WebGENTE em trabalhos acadêmicos, favor citar:

MAROTTA, Victor dos Santos. Um Framework para a disponibilização de Informação Geográfica Municipal na Web. 2021. 119 f. Dissertação (Mestrado em Engenharia Civil) - Universidade Federal de Viçosa, Viçosa. 2021. Disponível em: https://www.locus.ufv.br/handle/123456789/28224

[Site oficial do WebGENTE](https://www.webgente.genteufv.com.br/)

### Outras Publicações:

[MAROTTA, Victor dos Santos; BRUMATTI, Carlos Henrique T.; ALMEIDA, Brenda Batista; MARTINS, Sabrina Roberta de Moura; DUARTE, Daniel C. de Olveira; COELHO, Rayra B. Cária e; MARQUES, Éder T.; OLIVEIRA, Júlio Cesar; OLIVEIRA, Isadora A. WebGENTE: Desenvolvimento de um framework open source para um WebGIS Cadastral. 2020. Anais do XIV Congresso Brasileiro de Cadastro Técnico Multifinalitário [...]. [S. l.]: UFSC, 2020. p. 1–13. Disponível em: http://ocs.cobrac.ufsc.br/index.php/cobrac/cobrac2020/paper/view/819/343.](http://ocs.cobrac.ufsc.br/index.php/cobrac/cobrac2020/paper/view/819/343)

[MAROTTA, Victor dos Santos; BRUMATTI, Carlos H. T.; ALMEIDA, Brenda B.; MARTINS, Sabrina R.; MARTINS, Sabrina R.; MARQUES, Éder T. WEBGENTE: DESENVOLVIMENTO DE UM FRAMEWORK PARA UM WEBGIS CADASTRAL. In: Congresso Nacional De Engenharia De Agrimensura, 14., 2020, Online. Anais do 14° Congresso de Engenharia de Agrimensura. Online: Conea, 2020. p. 1-1. Disponível em: https://doity.com.br/anais/14-conea/trabalho/170783. Acesso em: 2 mar. 2020.](https://doity.com.br/anais/14-conea/trabalho/170783)

