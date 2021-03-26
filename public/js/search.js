//Variavel global para armazenar a consulta realizada em listqueryable
var layersQuerrys=new Array()
//Variavel global para armazenar a consulta realizada result_search
var resultSearch= new Array()
//Variavel global para filtros 
var filter_all= new Array()
//GeoJson
var objFilter=L.geoJSON().addTo(map);

 function queryLayers (data){  
//Função que realiza a consulta e gera a lista de camadas com campos pesquisáveis 
   var search= document.getElementById('search'); 
  
 
    var list_options= `<option value="-1"> </option><option selected disabled hidden>Nada selecionado</option>` 
    layersQuerrys=data //array global que recebe a consulta
     for(var n=0;n< data.length;n++){
              list_options+=`<option value="`+ n +`")">`+ data[n].layerName+`</option>`
             list_options+=`\n`     
        }
    

    search.innerHTML= `
    <div class="row" >
    <div id= search_bar >
             <p >Selecione uma camada para realizar a pesquisa:</p>
            <select id="search_list" class="form-select" onchange="searchableFields()">` + list_options + `</select>
                <div id="search_fields" > </div>
                
            </div>
       
    </div>`

}

//Gera os campos no html para a pesquisa
function searchableFields(){
   var index=document.getElementById('search_list').value
   var fields_content= " "
    for(field in (layersQuerrys[index].queryFields) ){
        
        var type=(layersQuerrys[index].queryFields[field].fieldType=="string")? 'text':'number' 
        fields_content+=` <input type=`+type+` id="`+field+`" name="`+ field +`" placeholder="`+layersQuerrys[index].queryFields[field].fieldAlias+`">`
       
    }
    (document.getElementById('search_fields')).innerHTML=`<form action="" method="POST">
    <div class="input-group">
    `
   +fields_content+
   `
   <input type="button" id="ok" value="Ok" onclick="search_result(`+index+`)">
   </div> 
</form>

`
}


//Exibir resultados da pesquisa
function search_result(index){
filter(index,undefined)
var field_content= new Array()
//Carregandi campos visíveis
$.get('/propertyname/'+layersQuerrys[index].layer, function( data ) {
    for(field_0 of Object.keys(data[0].field)){
        if(field_0 !='geom'){
            field_content.push({
                field: field_0,
                title: data[0].field[field_0]
            })
        }
        }
//Inicialização da tabela
        $('#search_fields').html(`<table id="table"
        data-toggle="table"
        data-height= 400
        data-pagination="true"></table>`)
        console.log(document.getElementById('search_fields'))   

    var wfsParams={
       layer:layersQuerrys[index].layer,
       format:encodeURIComponent('application/json'),
       cql_filter: encodeURI(filter_all[0] )
      }
      
    wfsAjax = $.ajax({
    url: '/wfs/'+ Object.values(wfsParams).join('/'),
   
    success: function (response) {
        console.log(response)
      properties= response.features.map(e=>e.properties)
      $('#table').bootstrapTable({
        columns: field_content,
        data:properties,
      })
    
    
    },
    error: function (xhr, status, error) {
        console.log(error)
    }

  })

})
}


//Concatena a string de filtro 
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

function loading(){
    return `<div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
            </div>`
}

function zoom_style(index){
   
    data = JSON.parse(resultSearch.features[index])
    objFilter.addData(data)
    map.fitBounds(objFilter.getBounds())
}

