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
                popup
                    .setLatLng(e.latlng)
                    .setContent(data);
                map.openPopup(popup);
            },
            error: function (xhr, status, error) {
                console.log(error)
            }
        });
    };    
};