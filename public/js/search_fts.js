
//tabela para alternar html
var table_html = new Array()
//Resultado
var elements_order = new Object()
//Opções selecionadas
var selector = new Object()
//Alternar mais de uma tabela de 
var table_select = new Array()
//Inicializando geojson
var zoom_focus = L.geoJSON().addTo(map);

//Função inicial que recebe resultado da requisição
function search_main() {
    if (selector.length > 0)
        removeLayerByName("ufv:" + selector[0].table_name)
    //inicializando variaveis globais sempre
    table_html = new Array()
    elements_order = new Object()
    selector = new Object()
    //Fechando tabelas 
    if (!$("#menu_search_fts").is(":hidden"))
        $("#menu_search_fts").hide()
    if (!$("table_bar").is(":hidden"))
        $("#table_bar").hide()
    if (!$("#table_div").is(":hidden"))
        $("#table_div").hide()
    $("#table_div_bar").html(" ")
    $.ajax({
        url: "/search/" + $("#search_content").val(),
        beforeSend: function () {
            $("#fts_result").html(`<div class="webgente-search-fts-result p-3"> 
            <div class="d-flex justify-content-center">
            <div class="spinner-border" role="status">
            </div>
          </div>
          <div>`)
        },
        success: function (response) {
            //Quando a requisição obteve resultados
            if (response.length > 0) {
                response.map(e => {
                    //Reordena o objeto para chaves com table_nome (nome da camada) e um array dos resultados 
                    if (elements_order[e.table_name]) {
                        elements_order[e.table_name].push(e)
                    } else {
                        elements_order[e.table_name] = new Array(e)
                    }
                })
                //Envia resultado para gerar tabela 
                result_request(elements_order)
            } else {
                //Quando a requisição não obteve resultados

                $("#fts_result").html(`<div class="webgente-search-fts-result p-3">
                <p> Nenhum resultado encontrado!</p>
                </div>`)
            }
        },
        error: function (qXHR, textStatus, errorThrown) {
            alert(textStatus + " " + qXHR.status + ': ' + errorThrown)
            $("#fts_result").hide()
            $("#fts_result").html(``)
        }
    })
}
//Html da lista de elementos inicial 
function result_request(data) {
    var html_menu = ` <ul class="list-group list-group-flush webgente-search-fts-result webgente-search-fts-list ">`
    var layers = Object.keys(data)

    layers.map((element) => {
        html_menu += ` <li class="list-group-item border border-bottom-0">
         <p  class="card-text"><strong>`+ element + `</strong></p>
         <p  class="card-text">`+ data[element][0].column_name + `:` + data[element][0].attribute + `</p>`
        //Verifica se o resultado referente a uma layer possui 1, 2 ou mais de 2 elementos    
        if (data[element].length > 2) {
            html_menu += `<p  class="card-text">` + data[element][1].column_name + `:` + data[element][1].attribute + `</p>
          <button class="btn btn-link btn-sm " type="button" onclick="select_layer(`+ (table_html.length + 1) + ` )"> + ver mais ` + (data[element].length - 2) + ` resultados</button>`
            //iniciando tabela secundária de cada layer
        } else if (data[element].length == 2) {
            html_menu += `<p>` + data[element][1].column_name + `:` + data[element][1].attribute + `</p>
            <a href="#" class="card-link" onclick="select_layer(`+ (table_html.length + 1) + ` )"> + ver mais detalhes</a>`
        }
        html_menu += `</li>`

        table_html[table_html.length + 1] = factory_list(data[element])


    })

    table_html[0] = html_menu + "</ul>"

    $("#fts_result").html(table_html[0])


}

//Html da lista de elementos
function factory_list(result_group) {
    var index = 0
    var element_html = `<ul class="list-group list-group-flush webgente-search-fts-result webgente-search-fts-list" >`
    result_group.map(element_group => {
        element_html += ` 
        <li class="list-group-item border border-bottom-0 ">
                        <div class="row">
                          <div class="col-8 col-sm-10">
                            <p class="card-text"><strong>`+ element_group.column_name + `:` + element_group.attribute + `</strong></p>`

        //Condições para html com 1 propriedade, 2 propriedades ou 3 propriedades (2 propriedade + link para exibir as demais 
        var properties = Object.keys(element_group.original_row)
        properties.splice(properties.indexOf(element_group.column_name), 1)
        for (var count = 0; count < properties.length; count++) {

            if (count == 2 && properties.length > 2) {
                element_html += `<div id="control_link` + index + `"  class="collapse" name="control_link" >
                <p class="card-text">` + properties[count] + `:` + element_group.original_row[properties[count]] + `</p>`
            } else {
                element_html += `<p class="card-text">` + properties[count] + `:` + element_group.original_row[properties[count]] + `</p> `
            }


        }
        element_html += (properties.length > 2) ? `</div> <button class="btn btn-link btn-sm " type="button" ata-toggle="collapse" name="control_link" value="control_link` + index + `")"> + ver mais</button>
        `: ``

        element_html += `</div>
        <div class="col-4 col-sm-2">
            <button class="btn btn-custom  btn-sm" onclick="download_marked(`+ index + `)" > <i class="fas fa-download" id="download_e` + index + `"></i> </button>
            <button class="btn btn-custom  btn-sm " onclick="zoom_marked(`+ index + `)" ><i class="fas fa-search"></i></button>
             <div class="form-check pl-4">
                 <input class="form-check-input" type="checkbox" value="`+ index + `" name="select_group">
             </div>
        </div>
    </div>
</li>`

        index++
    })
    element_html += `</ul>
    <script>
    $(":button[name=control_link]").click(function(){
        var id_collapse="#"+ $(this).prop('value') 
        if($(id_collapse).is( ":hidden" )){
            $(this).text("- Ocultar")
            $(id_collapse).show()
        }else{
            $(this).text("+ Ver mais")
            $(id_collapse).hide()

        }
    })
     </script>`
    return element_html

}
//Download de feições
function download_marked(index_format) {
    if (isNaN(index_format)) {
        //Download para feições marcadas no checkbox
        $('input:checkbox[name=select_group]:checked').each(function () {
            console.log(selector[$(this).val()])

        })
    } else {
        //Download para uma feição
        console.log(selector[index_format])
    }
}

//Zoom das feições 
function zoom_marked(index) {

    if (Object.keys(zoom_focus._layers).length > 0)
        zoom_focus.clearLayers()
    var data = new Array()
    if (index == -1) {
        //Zoom para feições marcadas
        $('input:checkbox[name=select_group]:checked').each(function () {
            data.push(selector[$(this).val()].geometry)

        })
    } else {
        //Zoom para única feição
        data.push(selector[index].geometry)
    }
    if (data.length == 0) {
        alert("Nenhuma feição foi selecionada")
    } else {
        zoom_focus.addData(data)
        map.fitBounds(zoom_focus.getBounds())
    }
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


//Quando o resultado de uma layer é selecionado 
function select_layer(count) {
    $("#menu_search_fts").show()
    selector = elements_order[Object.keys(elements_order)[count - 1]]
    //Remover "ufv"
    addLayerByName("ufv:" + selector[0].table_name)
    $("#fts_result").html(table_html[count])
    if (Object.keys(zoom_focus._layers).length > 0)
        zoom_focus.clearLayers()
}

function factory_table(index) {
    //Cria colunas
    var column = new Array({ checkbox: true })
    Object.keys(table_select[index][0].original_row).map(e => {
        column.push({ 'field': e, 'title': e })
    })
    //Gera as linhas
    var lines = new Array()
    table_select[index].map(e => {
        lines.push(e.original_row)
    })
    //Ativa o bootstrap table
    $("#table_fts").bootstrapTable({

        buttons: {
            btnAdd: {
                text: 'Zoom na feição',
                icon: 'fa-search',
                event: function () {
                    geom = new Array()
                    $('input:checkbox[name=btSelectItem]:checked').each(function () {
                        geom.push(selector[$(this).data('index')].geometry)
                    })
                    if (geom.length > 0) {
                        if (Object.keys(zoom_focus._layers).length > 0)
                            zoom_focus.clearLayers()
                        zoom_focus.addData(geom)
                        map.fitBounds(zoom_focus.getBounds())
                    } else {
                        alert("Nenhuma feição selecionada!")
                    }
                },
                attributes: {
                    title: 'Zoom'
                }
            }
        },
        columns: column,
        data: lines

    })
}




// Pressionar Enter no formulário ativa a pesquisa com o conteudo do formulario
$(document).ready(function () {
    $('#search_content').keypress(function (e) {
        if (e.keyCode == 13)
            $('#search-button').click();
    });
});

// Desabilita zoom no scroll do mouse quando cursor estiver dentro da div de pesquisa
$('#search-fts').mouseenter(() => {
    map.scrollWheelZoom.disable();
})
// Habilita zoom no scroll do mouse quando cursor sair da div de pesquisa
$('#search-fts').mouseleave(() => {
    map.scrollWheelZoom.enable();
})
//Marca/Desmarca todos os checkbox
$("#list_all").change(function () {
    if (this.checked) {
        $("input:checkbox[name=select_group]").prop("checked", true)
    } else {
        $("input:checkbox[name=select_group]").prop("checked", false)
    }
})


//Alternar tela 
$("#toggle_disp").click(function () {
    //Remover esse ufv: 
    removeLayerByName("ufv:" + selector[0].table_name)
    $("#menu_search_fts").hide()
    $("#fts_result").empty()
    $("#fts_result").html(table_html[0])
    if (Object.keys(zoom_focus._layers).length == 0)
        zoom_focus.clearLayers()
})

//Abre a tabela e adiciona os elementos selecionados
$("#open_select").click(function () {
    var data = new Array()

    $('input:checkbox[name=select_group]:checked').each(function () {
        data.push(selector[$(this).val()])
    })
    if (data.length == 0) {
        alert("Nenhum opção feição foi selecionada!")
    } else {
        $("#table_div").show()
        if ($("#table_fts tr").length > 0) {
            $("#table_fts").bootstrapTable('destroy')
            $("ul.nav li a").removeClass('active')
        }
        $("#table_div_bar").append(` <li class="nav-item  "> 
        <a class="nav-link active"   href="#">`+ data.length + ` selecionados  
        <i class="fa fa-times" ></i> 
        </a> 
      </li>
       `)

        table_select.push(data)
        factory_table(table_select.length - 1)

    }
})

$(function () {
    //Função de arrastar 
    $("#table_div").draggable({
        start: function () {
            //Desabilita arrastar mapa
            map.dragging.disable()
        },
        stop: function () {
            //Habilita arrastar mapa
            map.dragging.enable()
        }
    })
    $("#table_div").resizable({
        autoHide: true, //Alças ocultas quando o cursor não passsar por elas 
        handles: "all", //Todas as alças podem ser utilizadas
        resize: function () {
            $(".webgente-search-fts-height-resize").height(($("#table_div").height()) - ($("#table_div_bar").height() + 50))
            $("#table_fts").bootstrapTable('resetView')
        },

        start: function () {

            //Desabilita arrastar mapa
            map.dragging.disable()
        },
        stop: function () {
            //Habilita arrastar mapa
            map.dragging.enable()

        }
    })

});

//Desativa o scrol do mapa quando mouse estiver na div 
$("#table_div").mouseenter(() => {
    map.scrollWheelZoom.disable();
})
//Ativa o scrol do mapa quando mouse fora div 
$("#table_div").mouseenter(() => {
    map.scrollWheelZoom.disable();
})


//Fecha a tabela de atributos selecionados e exclui esses atributos
$("i[name=close_div]").click(function () {
    $("#table_div").hide()
    $("#table_fts").bootstrapTable('destroy')
    table_select = new Array()
    $("#table_div_bar").html("")
})

//Minimiza a tabela de atrbutos selecionados e exibe a barra de navegação refente a tabela
$("#min_table").click(function () {
    $("#table_div").hide()
    $("#table_bar").html(` <li class="nav-item webgente-search-fts-table-bar-div ">
    <a class="nav-link" >
    `+ selector[0].table_name + `
    <i class="fa fa-times" ></i> 
    </a>
    </li>`)
    $("#table_bar").show()
})

//Descolapsar tabela ou fechar tabela 
$("#table_bar").click(function(e){
    if ($(e.target).is("i")) {
        //Fecha tabela
        $("#table_div").hide()
        $("#table_fts").bootstrapTable('destroy')
        $("#table_bar").hide()
        table_select = new Array()
        $("#table_div_bar").html("")
    }else{
        //Abre tabela
        $("#table_div").show()
        $("#table_bar").hide()
    }
})

//Alterna e deleta barra de navegação da tabela de atributos
$("#table_div_bar").click(function (e) {
    if ($(e.target).is("i")) {
        //Botão fechar
        if ($("#table_div_bar li").length == 1) {
            $("#table_div").hide()

        } else if ($(e.target).closest("a").hasClass("active")) {
            if ($(e.target).closest("li").index() == table_select.length -1) {
                $("#table_div_bar li:eq(" + ($(e.target).closest("li").index() - 1) + ")").children('a').tab('show')
                $("#table_fts").bootstrapTable('destroy')
                factory_table($(e.target).closest("li").index() - 1)
            } else {
                $("#table_div_bar li:eq(" + ($(e.target).closest("li").index() + 1) + ")").children('a').tab('show')
                $("#table_fts").bootstrapTable('destroy')
                factory_table($(e.target).closest("li").index() + 1)
            }

        }
        table_select.splice($(e.target).closest("li").index(), 1)
        $(e.target).closest("li").remove()
    } else if ($(e.target).is("a")) {
        //Botão alternar
        $(e.target).tab('show')
        $("#table_fts").bootstrapTable('destroy')
        factory_table($(e.target).closest("li").index())
    }

})

