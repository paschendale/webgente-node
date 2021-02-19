var activeLayers = []; // Variável global com camadas ativas e GetFeatureInfo habilitado
var gfiAjax; // Criando uma instancia global do AJAX para controle de execução junto ao backend

/* Expandindo a classe nativa do Leaflet L.TileLayer.WMS para adicionar 
e remover em uma variavel a lista de camadas ativas, o getFeatureInfo
só estará habilitado para as camadas inicializadas por L.TileLayer.gfiWMS */

L.TileLayer.gfiWMS = L.TileLayer.WMS.extend({
    onAdd: function (map) {
      L.TileLayer.WMS.prototype.onAdd.call(this, map);
      activeLayers.push(this.options.layers);
    },
    
    onRemove: function (map) {
      L.TileLayer.WMS.prototype.onRemove.call(this, map);
      activeLayers.splice(activeLayers.indexOf(this.options.layers),1)
    }
});

L.tileLayer.gfiWMS = function (url, options) {
    return new L.TileLayer.gfiWMS(url, options);  
};

/* Adicionando evento de click no mapa para execução do getFeatureInfo */

map.addEventListener('click',getFeatureInfo);

popup = new L.Popup({maxWidth: 400}) // Instanciando um popup com dimensões máximas 

/* Função de getFeatureInfo junto ao backend */

function getFeatureInfo(e) {

    params = {
        service: 'WMS',
        request: 'GetFeatureInfo',
        version: '1.1.1',
        feature_count: 50,
        srs: 'EPSG:4326',
        bbox: map.getBounds()._southWest.lng+","+map.getBounds()._southWest.lat+","+map.getBounds()._northEast.lng+","+map.getBounds()._northEast.lat,
        width: map.getSize().x,
        height: map.getSize().y,
        x: map.layerPointToContainerPoint(e.layerPoint).x,
        y: map.layerPointToContainerPoint(e.layerPoint).y,
        layers: activeLayers,
        query_layers: activeLayers
    }  
    
    if (gfi) { // Check se função de Visualizar Informações está habilitada
        if (gfiAjax && gfiAjax.readystate != 4){
            gfiAjax.abort()
        }
    
        gfiAjax = $.ajax({
            url: '/gfi/'+ Object.values(params).join('/'),
            success: function (data, status, xhr) {
                data = JSON.parse(data)
                popup
                    .setLatLng(e.latlng)
                    .setContent(JSONcontentParser(data));
                map.openPopup(popup);
            },
            error: function (xhr, status, error) {
                console.log(error)
            }
        });
    };    
};

/* Formatação do conteudo JSON exibido no GetFeatureInfo para uma tabela */

function JSONcontentParser (data) {

    if (data.features.length == 0) { return 'No features selected or you may not have permission to see this!'}

    /* Esta função recebe um JSON resultante do GetFeatureInfo e o formata para exibição em um formato adequado aos dados cadastrais */

    var content = [];

    for (i = 0; i < data.features.length; i++) {
        
        const element = data.features[i];

        content.push('<div class="popup-inner-div"><p><a class="link-table-collapse" style="color:black;font-weight: bold;" data-toggle="collapse" href="#row-'+i+'">'+element.id.split('.')[0]+': '+featureCadasterId(element)+'</a></p></div><div id="row-'+i+'" class="panel-collapse collapse"><div class="panel-body">');
        var table = ['<table><tr><th>Atributo</th><th>Valor</th></tr>'];

        for (j = 0; j < Object.keys(element.properties).length; j++) {    

            var table_row = '<tr><td>'+Object.keys(element.properties)[j]+'</td><td>'+attributeFormatter(Object.values(element.properties)[j],Object.keys(element.properties)[j])+'</td></tr>';
            table.push(table_row);           
        };
        table.push('</table></div></div>')
        content.push(table.join(''));
    };
    
    content = content.join('');

    return content;
}

/* Funções auxiliares do JSONcontentParser */

/* Definindo o ID que aparece para identificar a feição na lista de tabelas disponíveis no Popup */

function featureCadasterId (element) {

    var properties = element.properties;

    var keys = Object.keys(properties);
    var values = Object.values(properties);

    if (keys.find(a =>a.includes("insc")) !== undefined) { // Retorna o primeiro atributo cujo nome contem a substring 'insc'
        index = keys.indexOf(keys.find(a =>a.includes("insc"))) // Procura o indice do atributo contendo 'insc'
        return values[index]; // Retorna o valor do atributo contendo 'insc'
    } else {
        return element.id.split('.')[1] // Caso não encontrado nenhum atributo que se encaixe nas instancias superiores retorna a chave primária da feição
    }            
}

/* Check se o atributo de um element é um link para formata-lo */

function attributeFormatter(element,keys) {

    if (typeof(element) == 'string') { 
        // Formatação de strings
        if(keys.indexOf('path_360') > -1) { 
            // Substitui o HTML do Popup (leaflet-popup-content) por um visualizador 360
            return '<a href =#  dir="'+element+'"  id = "path_360" onClick = "open360Viewer()">Visualizar panorama 360°</a>'
        } else if (element.includes('http')){ 
            // Se um dos valores contiver a substring 'http' formatar como link
            return '<a target="_blank" href="'+element+'">Link</a>'
        } else return element // Retorno se string nao for link
    } else return element // Retorno se nao for string
}

/* Formata a classe popup-inner-div com um panorama 360 e volta pra tabela de atributos */

function open360Viewer() {
 
    element = $('#path_360').attr('dir');

    old_html = $('.leaflet-popup-content').html()

    fullscreen = '<a style="color:black;font-weight: bold;" href="'+element+'" target="_blank">Abrir visualizador 360° em tela cheia</a>';

    html = '<div id="container-psv"></div>'

    $('.leaflet-popup-content').html(html) // Inserir aqui o HTML do Visualizador

    var div = document.getElementById('container-psv');
    var PSV = new PhotoSphereViewer({
            panorama: 'http://localhost:3000/img/panoramas/PANO_20210216_133153_0.jpg',
            container: div,
            time_anim: 3000,
            //caption: 'Legenda toDo',
            minFox: 5,
            loading_img: 'img/loading.gif',
            navbar: ['autorotate', 'zoom'],
            navbar_style: {
                backgroundColor: 'rgba(58, 67, 77, 0.7)'
            },
        });
}

