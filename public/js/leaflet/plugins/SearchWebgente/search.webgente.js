L.Control.SearchGente = L.Control.extend({
    options: {
        position: 'topleft'
    },
    initialize: function (options) {
		L.setOptions(this, options);
    },
    onAdd: function(map) {
        this._container = L.DomUtil.create('div', 'container-search');
        this._control= L.DomUtil.create('div', 'control-search',this._container)
        this._input=this._createInput('search-input');
        this._exit= this._createExitButton('search-button');
        this._search= this._createSearchButton('search-button');
        this._result_container=this._createContainer('search-results','search-table')

        return this._container;
    },

    onRemove: function(map) {
        // Nothing to do here
    },
    _createSearchButton(cssClass){
        
        button= (L.DomUtil.create('button',cssClass,this._control));
        icon= L.DomUtil.create('i','fas fa-search ', button);
        L.DomEvent
			.on(button, 'click', L.DomEvent.stop, this)
			.on(button, 'click', this._collapseSearch, this)

        return button;
    }
    ,
    _createInput(cssClass){
        input=(L.DomUtil.create('input',cssClass, this._control))
        input.setAttribute('id', 'search_input');
        input.setAttribute('placeholder', 'Digite aqui!');
        return input;
    }, 
    _createExitButton(cssClass){
        button = (L.DomUtil.create('button',cssClass, this._control));
        icon= L.DomUtil.create('i','fas fa-window-close', button);
        button.style.display='none'
        return button;
    },
    _createContainer(cssClass, cssClassTable){
        result_container= L.DomUtil.create('div', cssClass,this._container)
        table= L.DomUtil.create('table',cssClassTable, result_container)

        return result_container
    },
    _collapseSearch: function(){
   
        if($(this._input).css('display')=='none'){
            $(this._input).toggle()
        }else{
            if((($(this._input).val()).trim()).length==0){
                $(this._input).toggle()
            }else{
             

              
            }
        }
    }
    });

L.control.searchgente = function(opts) {
    return new L.Control.SearchGente(opts);
}