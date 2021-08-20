
//tabela para alternar html
var table_html = new Array()
//Resultado
var elements_order = new Object()
//Opções selecionadas
var selector = new Object()

var zoom_focus= L.geoJSON().addTo(map);

//Função inicial que recebe resultado da requisição
function search_main() {
    //inicializando variaveis globais sempre que iniciada
    table_html = new Array()
    elements_order = new Object()
    selector = new Object()

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
              
               if (!$("#menu_search_fts").is( ":hidden" ))
                    $("#menu_search_fts").hide()

                $("#fts_result").html( `<div class="webgente-search-fts-result p-3">
                <p> Nenhum resultado encontrado!</p>
                </div>`)
            }
        },
        error: function(qXHR, textStatus, errorThrown){
           alert(textStatus+" "+qXHR.status+': '+ errorThrown)

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
          <button class="btn btn-link btn-sm " type="button" onclick="select_layer(`+ (table_html.length+1 ) + ` )"> + ver mais ` + (data[element].length - 2) + ` resultados</button>`
            //iniciando tabela secundária de cada layer
        } else if (data[element].length == 2) {
            html_menu += `<p>` + data[element][1].column_name + `:` + data[element][1].attribute + `</p>
            <a href="#" class="card-link" onclick="select_layer(`+ (table_html.length+1) + ` )"> + ver mais detalhes</a>`
        }
        html_menu += `</li>`

        table_html[table_html.length + 1] = factory_list(data[element])


    })

    table_html[0] = html_menu+"</ul>"

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
                    element_html += `<div id="control_link`+index+`"  class="collapse" name="control_link" >
                <p class="card-text">` + properties[count] + `:` + element_group.original_row[properties[count]] + `</p>`
                } else {
                    element_html += `<p class="card-text">` + properties[count] + `:` + element_group.original_row[properties[count]] + `</p> `
                }

            
        }
        element_html += (properties.length > 2) ? `</div> <button class="btn btn-link btn-sm " type="button" ata-toggle="collapse" name="control_link" value="control_link`+index+`")"> + ver mais</button>
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
    element_html+= `</ul><script>
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
        console.log(index_format)
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
    if(Object.keys(zoom_focus._layers).length==0)
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
    if(data.length==0){
        alert("Nenhuma feição foi selecionada")
    }else{
    zoom_focus.addData(data)
    map.fitBounds(zoom_focus.getBounds())
    }
}
//Tablea com todas as informações 
function select_layer(count) {
    $("#menu_search_fts").show()
    selector = elements_order[Object.keys(elements_order)[count-1]]
    $("#fts_result").html(table_html[count])
    if(Object.keys(zoom_focus._layers).length==0)
        zoom_focus.clearLayers()
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

$('#search-fts').mouseleave(() => {
    map.scrollWheelZoom.enable();
})
//Marca/Desmarca todos os checkbox
$("#list_all").change(function () {
    if (this.checked) {
        $(":checkbox").prop("checked", true)
    } else {
        $(":checkbox").prop("checked", false)
    }
})


//Alternar tela 
$("#toggle_disp").click(function(){
    $("#menu_search_fts").hide()
    $("#fts_result").empty()
    $("#fts_result").html(table_html[0])
    if(Object.keys(zoom_focus._layers).length==0)
        zoom_focus.clearLayers()
})


//Abrir tabela de atributos
$("open_select").click(function(){
    $('input:checkbox[name=select_group]:checked').each(function () {
        console.log(selector[$(this).val()])

    })
})