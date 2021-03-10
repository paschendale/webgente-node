
//Variavel global para armazenar a consulta realizada em listqueryable
var layersQuerrys=new Array()
//Variavel global para armazenar a consulta realizada result_search
var ressultSearch= new Array()

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

var wfsParams={
    layer:layersQuerrys[index].layer,
    properties:keys,
    cql_filter: encodeURI( filter(layersQuerrys[index],undefined))
}

wfsAjax = $.ajax({
    url: '/wfs/'+ Object.values(wfsParams).join('/'),
    success: function (data) {
        data= JSON.parse(data)
        console.log(data)
    },
    error: function ( error) {
        console.log(error)
    }
});
addLayerByName(layersQuerrys[index].layer)

}

function filter(layer_selected, obj_selected){
var cql_filter=''

if(obj_selected==undefined){    
for(query in layer_selected.queryFields){
    var value = document.getElementById(query).value
    //Adição da condição E para mais de uma propriedade
    cql_filter+=(value!="" & cql_filter!="")? " and ": ""
    
    //Verficação de tipo do campo
    if(layer_selected.queryFields[query].fieldType=="string"){
       // cql_filter+= ("("+query+" LIKE "+ "'%"+value+"%')")
        cql_filter+= ("("+query+" LIKE "+ "'%"+value+"%' or "+query+" LIKE "+ "'%"+(value.toLowerCase())+"%' or "+query+" LIKE "+ "'%"+(value.toUpperCase())+"%') " )
    }else{
        cql_filter+=(value!="")? (isNaN(value))? (query+" = 000"):(query+" = "+ ""+value+" "):"";
    }
}
}else{
    cql_filter+="id="+ obj_selected['id']
}
return cql_filter
}

//Adiciona wms estilizado e com filtro
function style_filter(){

}
//Zoom na área filtrada
function zoom(){

}
//Parametros wfs para download
function download(){

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