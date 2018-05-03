

const app = SUGAR.App;
const customization = require('%app.core%/customization.js');
const EditView = require('%app.views.edit%/edit-view');
const ListView = require('%app.views%/list/list-view');
const FilteredListView = require('%app.views%/list/filtered-list-view');
const dialog = require('%app.core%/dialog');

//5d753883-e8d8-2236-41a7-5a17a568f5bd

// Register list item data provider.
// The provider facilitates the communication between a record model and the
// list item template.
customization.registerListItemDataProvider({
    // Provider name is referenced in the list initialization below.
    name: 'related_citas_items',

    // Override prepareItemData to provide the context for the list item
    // template.
    prepareItemData(model) {
        // The list item HBS template receives the following object.
        return {
            // used to find model by id on item click.
            itemId: this.buildId(model),

            // item complete state
            url: model.get('parent_type'),

            // item title
            titulo: model.get('cliente'),
        };
    },

    // Implement buildId method to calculate the value for "data-id" HTML
    // attribute in the template (see todo-list-item.hbs).
    // Together with extractId method, this method creates a reference between
    // the record model instance and the list item element in DOM.
    buildId(model) {
        return `citas_${model.id}`;
    },

    // Converts "data-id" HTML attribute value to the ID of a model instance.
    extractId(id) {
        return id.replace('citas_', '');
    },
});

const CitasListView = customization.extend(ListView, {

    dataCitas:{},

    initialize(options) {

        //Se obtiene información pasada por FilteredListView
        this.dataCitas=options.context.attributes.data.dataCitas;
        this._super(options);
    },
    // Disable list item context menu.
    contextMenuDisabled: true,

    // Provide custom template (see todo-list.hbs).
    template: 'related_citas_list',

    // Specify list item provider defined above.
    listItemDataProvider: 'related_citas_items',

    // Specify list item template (see todo-list-item.hbs).
    listItemTpl: 'related_citas_items',

    // Override "loadData" method to implement custom logic for fetching data.
    loadData(options) {

        this.collection.reset(this.dataCitas);
    },

    // Implement "onItemClick" method to override the default behavior which is
    // navigation.
    onItemClick(model) {
        const message = `${model.get('parent_type')} URL: ${model.get('cliente')}`;
        dialog.showAlert(message);
    },
});

const CitasFilteredListView = customization.extend(FilteredListView, {
    getListViewDef(options) {
        return _.extend({}, this._super(options), {
            view: CitasListView,
        });
    },

    headerConfig: {
        title: app.lang.get('Citas'),
        buttons: {
            mainMenu: true,
        },
    },
});

const BrujulaEditView = customization.extend(EditView, {

    dataCitas:null,
    events: {
        //'click input[type="text"]': 'onClick',
        'click .class_uni_citas input[type="text"]': 'onClickNavigateCitas',
        //'change .class_fecha_reporte' : 'onChangeEvent',

    },

    initialize(options) {
        this._super(options);
        self = this;
        //this.model.on("change:fecha_reporte",this.getCitas, this); 
        this.model.on("change:contactos_numero",this.getCitas, this); 

    },



    /**
     * Función que controla el evento click en el campo tct_related_person_txf_c
     *
     */
    onClickNavigateCitas: function(h) {

            app.controller.loadScreen({
                view:CitasFilteredListView,
                
                data:{
                    dataCitas:this.dataCitas,
                    //dataAPI:this.dataAPI
                },
                
                
            });


    },

/*
    onChangeEvent: function(h) {

           app.alert.show('evento_change', {
                    level: 'success',
                    autoClose: true,
                    messages: 'Evento change fecha.',
                });


    },
*/
    getCitas: function(){

        /*
        if(this.action == "view"){
            return;
        }
        */

        var fecha = this.model.get("fecha_reporte");
        var Params = {
            'promotor': this.model.get("assigned_user_id"),
            'fecha': "2018-05-02",
            //'fecha': fecha,
        };

        app.alert.show('brujula_load', {
            level: 'load',
            closeable: false,
            messages: app.lang.get('LBL_LOADING'),
        });

         var Url = app.api.buildURL("Citas_brujula", '', {}, {});
        
        app.api.call("create", Url, {data: Params}, {
                success: data => {
                    if(data == "Existente"){
                        app.alert.show('registro Existente', {
                        level: 'error',
                        messages: 'Ya existe un registro para el promotor seleccionado con la fecha ' + fecha,
                        autoClose: true
                    });
                    this.model.set("fecha_reporte", "");
                    return;
                    };

                    this.dataCitas=data;

                },
                error: er => {
                    app.alert.show('api_carga_error', {
                        level: 'error',
                        autoClose: true,
                        messages: 'Error al cargar datos: '+er,
                    });
                },
                complete: () => {
                    if(this.dataCitas){
                        //Se establece el campo asigna_manual_c para mostrar en la vista el campo tct_related_person_txf_c
                        console.log('Peticion completa');

                    }
                    // Oculta alerta hasta que la petición se haya completado
                    app.alert.dismiss('brujula_load');
                },
            });
        /*
        app.api.call("create", Url, {data: Params}, {
            success: _.bind(function (data) {
                if (self.disposed) {
                    return;
                }

                //Ocultando alerta
                app.alert.dismiss('brujula_load');

                if(data == "Existente"){
                    app.alert.show('registro Existente', {
                        level: 'error',
                        messages: 'Ya existe un registro para el promotor seleccionado con la fecha ' + fecha,
                        autoClose: true
                    });
                    self.model.set("fecha_reporte", "");
                    return;
                }
                self.dataCitas=data;

/*
                var citasCleaned = [];
                _.each(data, function(key, value) {

                    var acompaniante = "";
                    var estatus = "";
                    var referenciada = "";
                    if(!_.isEmpty(key.acompanante)){
                        acompaniante = key.acompanante;
                    }else{
                        acompaniante = "Editar";
                    }

                    if(key.status == "Held"){
                        estatus = "1";
                    }
                    else{
                        estatus = "";
                    }

                    if(key.referenciada_c == 1){
                        referenciada = "checked";
                    }

                    var duration_minutes = +key.duration_minutes;
                    if(key.duration_hours != 0){
                        var duration_hours =  +key.duration_hours * 60;

                        duration_minutes += duration_hours;
                    }

                    var nueva_cita = {
                        id: key.id,
                        parent_id: key.parent_id,
                        parent_name: key.cliente,
                        duration_minutes: duration_minutes,
                        //nuevo_traslado: duration_minutes,
                        nuevo_traslado: 0,
                        nuevo_referenciada: referenciada,
                        nuevo_acompanante: acompaniante,
                        nuevo_acompanante_id: key.user_id_c,
                        nuevo_objetivo: key.objetivo_c,
                        nuevo_estatus: estatus,
                        nuevo_resultado: key.resultado_c,
                    };
                    citasCleaned.push(nueva_cita);
                });
*/
                
                /*
                self.model.set("citas_originales", citasCleaned.length);
                self.citas = citasCleaned;
                self.model.set("citas_brujula",self.citas);
                self.render();
                //$(".estatus_cita").change(); //provocamos un change event en el estatus para que se recalculen los resultados
                $(".objetivo_list").change();
                
            },self)
        });
        */
    },

 
});

customization.register(BrujulaEditView,{module: 'uni_Brujula'});

module.exports = BrujulaEditView;


