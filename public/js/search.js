
//Variavel global para armazenar a consulta realizada em listqueryable
var layersQuerrys=new Array()
//Variavel global para armazenar a consulta realizada result_search
var resultSearch= new Array()
//Variavel global para filtros 
var filter_all= new Array()

 function queryLayers (data){  
//Função que realiza a consulta e gera a lista de camadas com campos pesquisáveis 
   var search= document.getElementById('search'); 
   if(search.innerHTML==" "){
 
    var list_options= `<option value="-1"> </option><option selected disabled hidden>Nada selecionado</option>` 
    layersQuerrys=data //array global que recebe a consulta
     for(var n=0;n< data.length;n++){
              list_options+=`<option value="`+ n +`")">`+ data[n].layerName+`</option>`
             list_options+=`\n`     
        }
    

    search.innerHTML= `
    <div class="row">
    <div id= search_bar>
              <p style="margin:5px 5px;font-weight:bold">Selecione uma camada para realizar a pesquisa:</p>
            <select id="search_list" onchange="searchableFields(this)">` + list_options + `</select>
                <div id=search_fields> </div>
            </div>
       
    </div>
`}else{
    search.innerHTML=" ";
}

}

//Gera os campos no html para a pesquisa
function searchableFields(){
   var index=document.getElementById('search_list').value
   var layer_selected= layersQuerrys[index]
   var fields_content= ''
 
    for(field in (layer_selected.queryFields) ){
        var type=(layer_selected.queryFields[field].fieldType=="string")? 'text':'number' 
        fields_content+=` <input type=`+type+` id="`+field+`" name="`+ field +`" placeholder="`+layer_selected.queryFields[field].fieldAlias+`">`
    }
    (document.getElementById('search_fields')).innerHTML=`<form action="" method="POST">`
   +fields_content+
   `<input type="button" id="ok" value="Ok" onclick="search_result(`+index+`)"> 
</form>`


}

//Exibir resultados da pesquisa
function search_result(index){
//Ptopriedades que podem ser acessadas    
var keys= Object.keys(layersQuerrys[index].queryFields)
//Adicionando geometria as propriedades
keys.unshift('geom')
 filter(index,undefined)
 
var wfsParams={
    layer:layersQuerrys[index].layer,
    properties:keys,
    format:encodeURIComponent('application/json'),
    cql_filter: encodeURI(filter_all[0] ),
    host: encodeURIComponent('http://nuvem.genteufv.com.br:8080/geoserver/gianetti/wms?')
}

wfsAjax = $.ajax({
    url: '/wfs/'+ Object.values(wfsParams).join('/'),
    success: function (data) {
        resultSearch= JSON.parse(data)
       
        if( resultSearch.features.length>0){
        var column=""
        var line=""
        for(var ndx=0; resultSearch.features.length>ndx;ndx++){
            line+="<tr>"
        for (query of Object.keys(layersQuerrys[index].queryFields)){
            if(resultSearch.features.length-1 ==ndx){
            column+=  `<th>`+layersQuerrys[index].queryFields[query].fieldAlias+`</th>`
            column+= `\n`
            }
        
            line+= `<td> `+resultSearch.features[ndx].properties[query]+` </td>`
            line+= `\n`
         
        }
            line+= '<td><img src="img/lupa.png" onclick="zoom('+ndx+');"style_filter('+ndx+')"></td>'; 
            line+= `<td> <img src="img/donwload.png" onclick="filter(`+ndx+`,`+ndx+`);download(1,`+index+`,'shape-zip');"></td> </tr>`
            //,`+ filter(undefined, resultSearch.features[ndx])+`
    }
    //
    (document.getElementById('search_fields')).innerHTML=`<div id="result_search">
    <div id="img_close"><img src="img/left-arrow.png" alt="Voltar ao painel de pesquisas" onclick="searchableFields()"></div>
    <button type="button" class="btn " onclick="download(0,`+index+`,'shape-zip')" ><strong>SHP</strong></button>
    <button type="button"  class="btn " onclick="download(0,`+index+`, 'csv' ) "><strong>CSV</strong></button>
    <button type="button"  class="btn " onclick="download(0,`+index+`,'GML3') "><strong>GML</strong></button>
    <button type="button"  class="btn " onclick="zoom(-1)"> <img src="img/lupa.png" > </button>
    
          <table id="tabela_pesquisa">
                    <tr>
                        `+column+`
                    <th>Ver</th>
                    <th>Download</th>
                    </tr>
                    </div>
                 `+line+`
            </table>
        </div>
    </div>
    </div>
    </div>`

    }else{
        resultSearch=[]
        (document.getElementById('search_fields')).innerHTML +=  `<div>
        <td></td><td> Nenhum resultado encontrado</td><td></td> </div>`
    }
    },
    error: function ( error) {
        (document.getElementById('search_fields')).innerHTML +=  `<div>
        <td></td><td> Erro no servidor! </td><td></td> </div>`
    }
});
addLayerByName(layersQuerrys[index].layer)

}


function filter(index, index_obj){
var cql_filter=''

if(index_obj==undefined){    
for(query in layersQuerrys[index].queryFields){
    var value = document.getElementById(query).value
    //Adição da condição E para mais de uma propriedade
    cql_filter+=(value!="" & cql_filter!="")? " and ": ""
    
    //Verficação de tipo do campo
    if(layersQuerrys[index].queryFields[query].fieldType=="string"){
       // cql_filter+= ("("+query+" LIKE "+ "'%"+value+"%')")
        cql_filter+= ("("+query+" LIKE "+ "'%"+value+"%' or "+query+" LIKE "+ "'%"+(value.toLowerCase())+"%' or "+query+" LIKE "+ "'%"+(value.toUpperCase())+"%') " )
    }else{
        cql_filter+=(value!="")? (isNaN(value))? (query+" = 000"):(query+" = "+ ""+value+" "):"";
    }
}
filter_all[0]=cql_filter
}else{
    cql_filter+="id="+ resultSearch.features[index_obj]['id']
    filter_all[1]= cql_filter
}
}

//Adiciona wms estilizado e com filtro
function style_filter(index){
    console.log(resultSearch.features[index])
}


//Zoom na área filtrada
function zoom(index){
console.log(resultSearch.features[index])
}


//Parametros wfs para download
function download(ndx,index,format){
//Propriedades que podem ser acessadas    
var keys= Object.keys(layersQuerrys[index].queryFields)
//Adicionando geometria as propriedades
keys.unshift('geom')

filter(ndx,index,undefined)
 
var wfsParams={
    layer:layersQuerrys[index].layer,
    properties:keys,
    format:encodeURIComponent(format),
    cql_filter: encodeURI(filter_all[ndx] ),
    host: encodeURIComponent('http://nuvem.genteufv.com.br:8080/geoserver/gianetti/wms?')
}

wfsAjax = $.ajax({
    url: '/wfs/'+ Object.values(wfsParams).join('/'),
    success: function (data) {
        data=JSON.stringify(data)
       console.log(data)
    },
    error: function ( error) {
        console.log(error)
    }
});
    

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