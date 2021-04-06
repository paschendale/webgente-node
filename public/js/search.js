
//Adiciona camadas pesquisáveis ao selection
selectOptions()
//Variáveis globais para armazenar resultados:  
var layersQuerrys = new Array() //a consulta realizada em listqueryable 
var resultWFS = new Array() // o resultado da pesquisa em wfs
var requestParams = new Object() // recolhe os parametros chave para requisição
var focus_style = L.geoJSON().addTo(map);// zoom e adicionar estilos

//Gera a lista de camadas disponíveis para a pesquisa
function selectOptions() {
    $.ajax({
        url: '/listqueryable/',
        beforeSend: function () {

        },
        success: function (response) {
            $("#load").hide()
            response.map(({
                layer,
                layerName
            }) => {

                $('#search_list').append(`<option>${layerName}</option>`);

            })
            layersQuerrys = response

        }
    })
}

//Gera os os campos pesquisáveis 
function searchableFields() {
    if ($('#search_list').prop('selectedIndex') > 0) {
        $("#search_fields").show();
        var option = layersQuerrys[$('#search_list').prop('selectedIndex') - 1];
        var complete_sub = ""
        Object.keys(option.queryFields).map((element) => {
            complete_sub += `<input type="text" class="form-control form-control-sm" name="` + element + `" id="` + element + `" placeholder="` + option.queryFields[element].fieldAlias + `">`
        })
        $("#sub_search_fields").html(complete_sub)
    } else {
        $("#search_fields").hide();
    }

}

//Concatena strings dos inputs para o cql_filter 
function filter_concate() {
    var cql_filter = ''

    for (query in requestParams.layerSelect.queryFields) {

        var value = document.getElementById(query).value
        if(!value.trim()==false){
        //Adição da condição E para mais de uma propriedade
        cql_filter += (value != "" & cql_filter != "") ? " and " : ""
        //Verficação de tipo do campo
        if (requestParams.layerSelect.queryFields[query].fieldType == "string") {
            // cql_filter+= ("("+query+" LIKE "+ "'%"+value+"%')")
            cql_filter += ("(" + query + " LIKE " + "'%" + value + "%' or " + query + " LIKE " + "'%" + (value.toLowerCase()) + "%' or " + query + " LIKE " + "'%" + (value.toUpperCase()) + "%') ")
        } else {
            cql_filter += (value != "") ? (isNaN(value)) ? (query + " = 000") : (query + " = " + "" + value + " ") : "";
        }
    }
}
    requestParams.filter_all = cql_filter

}


//Adicionar elementos a tabela 
function table_factory() {
    $("#buttons_table").show()
    var option = layersQuerrys[$('#search_list').prop('selectedIndex') - 1];
    requestParams.layerSelect = option
    addLayerByName(requestParams.layerSelect.layer)
    filter_concate()
    //Adquire campos habilitados para o usuário
    $.get('/propertyname/' + option.layer, function (data) {
        
        requestParams.property_name = Object.keys(data.field)
        requestParams.property_name.push("id","geom") // Adiciona o id e a geometria para utilizar em downloads e zoom
        var column = new Array()
        //Forma a coluna json
        Object.keys(data.field).map((element) => {
            if (element != 'geom') {
                column.push({
                    field: element,
                    title: element
                })

            }
        })
        //Coluna para os botões
        column.push({
            formatter: TableActions,
            title: "Download/Zoom"
        })
        //Adicionando colunas a tabela
        $("#table").bootstrapTable({
            columns: column
        })
        //Adicionando parametros a tabela  
        $("#table").bootstrapTable('refreshOptions', {
            ajax: 'ajaxRequest'
        })

    })

}
//Requisição da tabela
function ajaxRequest(params) {

    var option = layersQuerrys[$('#search_list').prop('selectedIndex') - 1];
    var wfsParams = {
        layer: option.layer,
        format: encodeURIComponent('application/json'),
        property_name: new Array(requestParams.property_name),
        cql_filter: encodeURI(requestParams.filter_all)

    }
    $("#search_fields").hide();
    var url1 = '/wfs/' + Object.values(wfsParams).join('/')
    $.get(url1).then(function (response) {
        response = JSON.parse(response)
        //Condição para resultados vazios   
        if (response.features.length == 0 ) {
            params.success([])
        } else {
            resultWFS = response
            zoomFeature(-1)
            properties = response.features.map(e => e.properties);
            params.success(properties)
           
        }
    })

}


//Botbões da tabela
function TableActions(value, row, index, field) {
    return ['<button class="btn btn-dark btn-custom btn-sm" id="downloadFeature" onclick="downloadFeature(' + index + ')"> <i class="fas fa-download"></i></button>', ' ', '<button class="btn btn-dark btn-custom2 btn-sm" id="zoomFeature" onclick="zoomFeature(' + index + ')"> <i class="fas fa-search"></i></button>'].join('');
}


//Realiza requisição para o Download 
function downloadFeature(index_format) {
    var cql_define = ""
    //Organiza objetos com base no tipo de donwload: uma feição em shp ou todas em shp/gml/csv
    if (Number.isInteger(index_format)) {
        requestParams.format = "shape-zip"
        cql_define = " id =" + resultWFS.features[index_format].properties.id
    } else {
        requestParams.format = index_format
        cql_define = requestParams.filter_all
        
    }
    var wfsParams = {
        layer: requestParams.layerSelect.layer,
        format: encodeURIComponent(requestParams.format),
        property_name: requestParams.property_name,
        cql_filter: encodeURI(cql_define)
    }
    console.log(wfsParams)
    /*   url= '/wfs/'+ Object.values(wfsParams).join('/')   
       $.ajax({
           url: url,
           beforeSend: function () {
               $("#load").show()
           },
           success (data) {
               $("#load").hide()
               var blob = new Blob([data]);
               var url2 = window.URL.createObjectURL(blob);
               window.open(url2, '_blank')
           }
       });  
          
      */
}
//Aplica estilo e foca no local selecionado 
function zoomFeature(index) {
    focus_style.clearLayers()
    //Verifica qual o tipo de opção: um feição apenas ou todas pesquisadas
    var layer_focus = (index == -1) ? resultWFS.features : resultWFS.features[index].geometry
    data = JSON.parse(JSON.stringify(layer_focus))
    focus_style.addData(data)
    map.fitBounds(focus_style.getBounds())

}
//Remove todas os alterações feitas com a tabela
function closeTable() {
    $("#table").bootstrapTable('destroy')
    $("#buttons_table").hide()
    if ($.isEmptyObject(requestParams) == false)
        removeLayerByName(requestParams.layerSelect.layer)
    focus_style.clearLayers()
    searchableFields()
}
//Adiciona layer pelo controle de camadas
function addLayerByName(nameString) {
    Lc._layers.find(x => x.layer.options.layers === nameString).layer.addTo(map)
    return null
}

//Remove layer pelo controle de camadas
function removeLayerByName(nameString) {
    Lc._layers.find(x => x.layer.options.layers === nameString).layer.remove()
    return null
}

