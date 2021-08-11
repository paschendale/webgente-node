//tabela paraa alternar html
var table_html = new Array()
//Resultado
var elements_order = new Object()
//Opções selecionadas
var selector = new Object()

//Função inicial que recebe resultado da requisição
function search_main() {
    //inicializando variaveis globais sempre que iniciada
    table_html = new Array()
    elements_order = new Object()
    selector = new Object()

    $.ajax({
        url: "/search/" + $("#search_content").val(),
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
                $("#fts_result").html(`<p> Nenhum resultado encontrado!</p>`)
            }
        }
    })
}
//Html da lista de elementos inicial 
function result_request(data) {
    var html_menu = `<div class="list-group ">`
    var layers = Object.keys(data)

    layers.map((element) => {
        html_menu += ` <li class="list-group-item webgente-search-fts-list ">
         <p><strong>`+ element + `</strong></p>
         <p>`+ data[element][0].column_name + `:` + data[element][0].attribute + `</p>`
        //Verifica se o resultado referente a uma layer possui 1, 2 ou mais de 2 elementos    
        if (data[element].length > 2) {
            html_menu += `<p>` + data[element][1].column_name + `:` + data[element][1].attribute + `</p>
          <a href="#" onclick="toggle_disp(`+ (table_html.length + 1) + `)"> + ver mais ` + (data[element].length - 2) + ` resultados</a>`
            //iniciando tabela secundária de cada layer
            table_html[table_html.length + 1] = ` 
            <ul class="list-group ">
            <li class="list-group-item webgente-search-fts-list">
                <div class="row">
                    <div class="col-4 col-sm-4">
                        <button class="btn btn-dark btn-custom  btn-sm" id="test" onclick="toggle_disp(0)"><i
                                class="fas fa-arrow-left"></i></button>
                    </div>
                    <div class="col-4 col-sm-4">
                        <button class="btn btn-dark dropdown-toggle btn-sm" type="button" id="download_all"
                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i
                                class="fas fa-download"></i>
                        </button>
                        <div class="dropdown-menu" aria-labelledby="dropdownMenu2">
                            <button class="dropdown-item" type="button"
                                onclick="download_marked('application/json')">GeoJson</button>
                            <button class="dropdown-item" type="button" onclick="download_marked('XML')">XML</button>
                            <button class="dropdown-item" type="button" onclick="download_marked('csv')">CSV</button>
                        </div>
                    </div>
                    <div class="col-2 col-sm-2">
                        <button class="btn btn-dark btn-custom  btn-sm" onclick="zoom_marked(-1)"><i
                                class="fas fa-search"> </i></button>
                    </div>
                    <div class="col-2 col-sm-2">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" id="list_all"
                                onclick="all_check(this)">

                        </div>
                    </div>

            </li>
        </ul>`+ factory_list(data[element])

        } else if (data.element.length == 2) {
            html_menu += `<p>` + data[element][1].column_name + `:` + data[element][1].attribute + `</p>`
        }
        html_menu += `</li>`

    })
    html_menu += `</div>`
    table_html[0] = html_menu

    $("#fts_result").html(table_html[0])


}

//Html da lista de elementos
function factory_list(result_group) {
    var index = 0
    var element_html = ``
    for (element_group of result_group) {
        var properties = Object.keys(element_group.original_row)
        element_html += `<li class="list-group-item webgente-search-fts-list">
                        <div class="row">
                          <div class="col-10 col-sm-10">
                            <p><strong>`+ element_group.column_name + `:` + element_group.attribute + `</strong></p>`

        //Condições para html com 1 propriedade, 2 propriedades ou 3 propriedades (2 propriedade + link para exibir as demais )
        if (properties.length > 0) {
            element_html += `<p>` + properties[0] + `:` + element_group.original_row[properties[0]] + `</p> `
            if (properties.length == 2) {
                element_html += `<p>` + properties[1] + `:` + element_group.original_row[properties[1]] + `</p>`
            } else if (properties.length > 2) {
                element_html += `<p>` + properties[1] + `:` + element_group.original_row[properties[1]] + `</p>
            <a href="#" > + ver mais `+ (properties.length - 2) + ` resultados</a>`
            }
        }
        element_html += `</div>
        <div class="col-2 col-sm-2">
            <button class="btn btn-custom  btn-sm" onclick="download_marked(`+ index + `)" > <i class="fas fa-download" id="download_e` + index + `"></i> </button>
            <button class="btn btn-custom  btn-sm " onclick="zoom_marked(`+ index + `)" ><i class="fas fa-search"></i></button>
             <div class="form-check">
                 <input class="form-check-input" type="checkbox" value="`+ index + `" name="select_group"">
             </div>
        </div>
    </div>
</li>`

        index++
    }
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
    if (index == -1) {
        //Zoom para feições marcadas
        $('input:checkbox[name=select_group]:checked').each(function () {
            console.log(selector[$(this).val()])

        })
    } else {
        //Zoom para única feição
        console.log(selector[index])
    }
}
//Tablea com todas as informações 
function table_properties(index) {
    console.log(selector[index])
}

//alterna telas
function toggle_disp(count) {
    var table = Object.keys(elements_order)
    selector = elements_order[table[count - 1]]
    $("#fts_result").html(table_html[count])
}

//Seleção de todos os elemetos 
function all_check(e) {
    if (e.checked) {
        $(":checkbox").prop("checked", true)
    } else {
        $(":checkbox").prop("checked", false)
    }
}