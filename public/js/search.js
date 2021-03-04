//Variavel global para armazenar a consulta realizada em listqueryable
var ar_query=new Array()

async function queryLayers (){  
//Função que realiza a consulta e forma a lista de consulta
   var search_list= document.getElementById('search'); 
    var list_options= `<option value="-1"> </option><option selected disabled hidden>Nada selecionado</option>`
     await  $.get('/listqueryable',function(data){
     ar_query=data //array global que recebe a consulta
         for(var n=0;n< data.length;n++){
              list_options+=`<option value="`+ n +`")">`+ data[n].layerName+`</option>`
             list_options+=`\n`     
        }
    
    },'json');

    search_list.innerHTML= `
    <div class="row">
    <div >
              <p style="margin:5px 5px;font-weight:bold">Selecione uma camada para realizar a pesquisa:</p>
            <select id="search_bar" onchange="searchableFields()">` + list_options + `</select>
            </div>
       
    </div>
`

}

//Gera os campos no html para a pesquisa
function searchableFields(index){
    console.log(ar_query[document.getElementById('search_bar').value])
}