
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
            $('#load').addClass('spinner-border ms-auto')
        },
        complete: function () {
            $('#load').removeClass('spinner-border ms-auto')
        },
        success: function (response) {

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
            complete_sub += `<input type="text" class="form-control form-control-sm webgente-search-form" name="` + element + `" id="` + element + `" placeholder="` + option.queryFields[element].fieldAlias + `">`
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
        if (!value.trim() == false) {
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
    if (download_enabled != 0)
        $("#download_all").show()

    var option = layersQuerrys[$('#search_list').prop('selectedIndex') - 1];
    requestParams.layerSelect = option
    addLayerByName(requestParams.layerSelect.layer)
    filter_concate()
    //Adquire campos habilitados para o usuário
    $.get('/propertyname/' + option.layer, function (data) {

        requestParams.property_name = Object.keys(data.field)
        requestParams.property_name.push("id", "geom") // Adiciona o id e a geometria para utilizar em downloads e zoom
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
            title: (download_enabled == 0) ? "Zoom" : "Download/Zoom"
        })

        //Adicionando colunas a tabela
        $("#table").bootstrapTable({
            columns: column
        })
        //Adicionando parametros a tabela  
        $("#table").bootstrapTable('refreshOptions', {
            ajax: 'ajaxRequest',
            pagination: true
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
        cql_filter: (!requestParams.filter_all) ? "none" : encodeURIComponent(requestParams.filter_all),
        srs_name: 'EPSG:4326'

    }
    $("#search_fields").hide();
    var url1 = '/wfs/' + Object.values(wfsParams).join('/')
    $.get({
        url: url1,
        success: (data) => {
            data = JSON.parse(data)

            if (!data.features) {
                //Condição para json com erro
                alert('Requested URL not found.')
            } else if (data.features.length == 0) {
                //Condição para resultados vazios  
                params.success([])
            } else {

                resultWFS = data
                zoomFeature(-1)
                properties = data.features.map(e => e.properties);
                params.success(properties)

            }

        },
        error: function (x, e) {
            params.success([])
            alert('Error:.\n' + x.responseText);
        }
    })


}


//Botbões da tabela
function TableActions(value, row, index, field) {
    if (download_enabled == 0) {
        return ['<button class="btn btn-dark btn-custom2 btn-sm" id="zoomFeature" onclick="zoomFeature(' + index + ')"> <i class="fas fa-search"></i></button>']
    } else {
        return ['<button class="btn btn-dark btn-custom btn-sm"  onclick="downloadFeature(' + index + ')"> <i id="downloadFeature' + index + '" class="fas fa-download"></i></button>', ' ', '<button class="btn btn-dark btn-custom2 btn-sm" id="zoomFeature" onclick="zoomFeature(' + index + ')"> <i class="fas fa-search"></i></button>'].join('');

    }
}

//Realiza requisição para o Download 
function downloadFeature(index_format) {
    /*A função recebe um parâmetro que pode ser um índice ou um formato    
    Caso seja um formato será realizada uma requisição com todos os objetos de pesquisa
    Caso seja um índice será realizado uma requisição geojson com o id da feição  
    */
    var wfsParams = {
        layer: requestParams.layerSelect.layer,
        format: isNaN(index_format) ? encodeURIComponent(index_format) : encodeURIComponent('application/json'),
        property_name: requestParams.property_name,
        cql_filter: isNaN(index_format) ? encodeURIComponent(requestParams.filter_all) : encodeURIComponent("id=" + resultWFS.features[index_format].properties.id)
    }


    url = '/wfs/' + Object.values(wfsParams).join('/')
    $.get({
        url: url, // Requisicao WFS para obter os resultados da pesquisa em JSON
        beforeSend: function () {
            //Adicionando spinner aos botões ( alternando ícone de download com spinner)
            if (isNaN(index_format)) {
                $("#download_img").removeClass("fas fa-download")
                $("#download_img").addClass("spinner-border spinner-border-sm")

            } else {
                $("#downloadFeature" + index_format).removeClass("fas fa-download")
                $("#downloadFeature" + index_format).addClass("spinner-border spinner-border-sm")
            }
        },
        complete: function () {
            //Removendo Spinner dos botões ( alternando ícone de download com spinner)
            if (isNaN(index_format)) {
                $("#download_img").removeClass("spinner-border spinner-border-sm")
                $("#download_img").addClass("fas fa-download")
            } else {
                $("#downloadFeature" + index_format).removeClass("spinner-border spinner-border-sm")
                $("#downloadFeature" + index_format).addClass("fas fa-download")

            }
        },
        success: (data) => { // Callback para caso dê tudo certo
            $("#load").hide();
            var blob = new Blob([data]);
            let link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            //Alteração do nome do resultado
            link.download = (resultWFS.features[0].id.split('.'))[0]
            switch (wfsParams.format) {
                case 'csv':
                    link.download += ".csv"
                    break
                case 'kml':
                    link.download += ".kml"
                    break
                default:
                    link.download += ".geojson"
                    break
            }
            link.click();

        },
        error: function (x, e) {
            alert('Error:.\n' + x.responseText);
        }
    })

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
    if ($.isEmptyObject(requestParams) == false) {
        removeLayerByName(requestParams.layerSelect.layer)
        $("#table").bootstrapTable('destroy')
        $("#buttons_table").hide()
        searchableFields()
    }
    focus_style.clearLayers()

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

