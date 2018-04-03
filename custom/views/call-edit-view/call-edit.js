
/**
 * Creado por: Salvador Lopez Balleza
 * salvador.lopez@tactos.com.mx
 *
 * Se habilita funcionalidad mobile en vista de creación de llamadas
 * para filtrar personas relacionadas a la persona asignada a dicha llamada en un campo personalizado
 */

const app = SUGAR.App;
const customization = require('%app.core%/customization.js');
const dialog = require('%app.core%/dialog');
//const EditView = require('%app.views.edit%/edit-view');
const EditView = require('%app.views.edit%/modules/meetings-calls-edit-view.js');
//const NomadView = require('%app.views%/nomad-view');
const ListView = require('%app.views%/list/list-view');
const FilteredListView = require('%app.views%/list/filtered-list-view');


customization.registerListItemDataProvider({
    // Nombre de la plantilla con la definición de cada item en la lista
    name: 'related_person_items',

    // Override prepareItemData para proporcionar el contexto en la platilla de la lista
    prepareItemData(model) {

        //La plantilla HBS con la lista, recibe el siguiente Object
        return {
            // used to find model by id on item click.
            itemId: this.buildId(model),

            body: model.get('name'),

            title: model.get('tipo_registro_c'),
        };
    },

    // Se implementa el método buildID para calcular el valor 'data-id' HTML
    // en la plantilla (related_person_items.hbs).

    buildId(model) {
        return `post_${model.id}`;
    },

    // Convierte el atributo  HTML "data-id" a un ID de la instancia del modelo
    extractId(id) {
        return id.replace('post_', '');
    },
});

const TodoListView = customization.extend(ListView, {
    callModel:{},

    initialize(options) {

        //Se obtiene información pasada por FilteredListView
        this.callModel=options.context.attributes.data.parentModel;
        this._super(options);
    },

    // Deshabilita list item context menu.
    contextMenuDisabled: true,

    // Proporciona plantilla personalizada (related_person_list.hbs).
    template: 'related_person_list',

    // Specify list item provider defined above.
    listItemDataProvider: 'related_person_items',

    // Especifica la plantilla con los elementos de la lista (related_person_items.hbs).
    listItemTpl: 'related_person_items',

    // Override "loadData" para llenar la plantilla de la lista
    loadData(options) {

        //Mostrar alerta para indicar que la petición ha iniciado
        app.alert.show('api_load', {
            level: 'load',
            closeable: false,
            messages: app.lang.get('LBL_LOADING'),
        });

        var idPersonaParent=this.callModel.get('tct_id_parent_txf_c');
        var strUrl='PersonasRelacionadas/'+idPersonaParent;

        // Llamada a api personalizada para llenar plantilla con la lista de personas relacionadas
        return app.api.call('GET', app.api.buildURL(strUrl), null, {
            success: response => {
                this.collection.reset(response.records);

                //Muestra alerta indicando que la petición re ha realizado de manera exitosa
                app.alert.show('api_carga_success', {
                    level: 'success',
                    autoClose: true,
                    messages: 'Carga correcta.',
                });
            },
            error: er => {

                //Muestra alerta indicando error en la petición
                app.alert.show('api_carga_error', {
                    level: 'error',
                    autoClose: true,
                    messages: 'Error al cargar datos.',
                });
            },
            complete: () => {

                // Oculta alerta hasta que la petición se haya completado
                app.alert.dismiss('api_load');
            },
        });

    },

    // Se implementa "onItemClick" para establecer comportamiento al dar click a un elemento de la lista
    onItemClick(model) {

        //Navegar a pantalla de creació0n de llamadas

        app.controller.navigate({
            url: 'Calls/create',

            // Se envían datos a la vista de creación.
            // Los datos estarán disponibles en options.data que se encuentra en el método initialize de
            // CallEditView
            data:{
                modelCliente:model,

                modelCall:this.callModel
            }
        });
    },
});

const TodoFilteredListView = customization.extend(FilteredListView, {

    initialize(options) {

        this._super(options);
    },

    getListViewDef(options) {
        return _.extend({}, this._super(options), {
            view: TodoListView,
        });
    },

    //Definición general para la vista con la lista de las personas relacionadas
    headerConfig: {
        title: app.lang.get('Lista Personas Relacionadas'),
        buttons: {
            //mainMenu: true,
            //save: true,
            //back:true
            cancel:true
        },
    },
});


const CallEditView = customization.extend(EditView, {

    //Variable que sirve de bandera para mostrar u ocultar el campo tct_related_person_txf_c
    records:null,

    //Get event click on field tct_related_person_txf_c
    events: {
        //'click input[type="text"]': 'onClick',
        'click .related_person input[type="text"]': 'onClick',
    },

    initialize(options) {
        this._super(options);

        /*
        * Si options.data no es "undefined" llama al método para establecer datos a cada campo
        * en el modelo de la llamada
        * */

        if(options.data !==undefined){
            this.model.on('sync', this.setInfoCall(options.data), this);
        }else{
            this.model.on('sync', this.setIdParent(options), this);
        }

    },

    /**
     * Función que establece datos en vista de creación de Llamadas
     * Esta función es llamada cuando options.data {initialize} no es undefined
     *
     * @param {options} Object Objeto con la información de la Llamada.
     */
    setInfoCall: function (options) {
        this.model.set('asigna_manual_c',true);
        this.model.set("name",options.modelCall.get('name'));
        this.model.set("date_start",options.modelCall.get('date_start'));
        this.model.set("date_end",options.modelCall.get('date_end'));
        this.model.set("tct_related_person_txf_c",options.modelCliente.get('name'));
        this.model.set("tct_id_parent_txf_c",options.modelCall.get('tct_id_parent_txf_c'));
        this.model.set("direction",options.modelCall.get('direction'));
        this.model.set("status",options.modelCall.get('status'));
        this.model.set("parent_name",options.modelCliente.get('name'));
        this.model.set("parent_type",'Accounts');
        this.model.set("parent_id",options.modelCliente.get('id'));

    },

    /**
     * Función que establece datos en vista de creación de Llamadas
     * Esta función es llamada cuando options.data {initialize} no es undefined
     *
     * @param {options} Object Objeto con la información de la Llamada.
     */
    setIdParent:function(options){

        //Establecer parentModelId solo si el campo tct_id_parent_txf_c no tiene información
        if(this.model.get('tct_id_parent_txf_c')== "" ||
            this.model.get('tct_id_parent_txf_c')== null ||
            _.isEmpty(this.model.get('tct_id_parent_txf_c'))){
            this.model.set('tct_id_parent_txf_c',options.parentModelId);

            var idPersonaParent=options.parentModelId

            var strUrl='PersonasRelacionadas/'+idPersonaParent;

            //LLamada a API personalizada "PersonasRelacionadas"
            app.api.call('GET', app.api.buildURL(strUrl), null, {
                success: response => {
                    if(response.records.length>=1){
                        this.records=true;
                    };

                },
                error: er => {
                    app.alert.show('api_carga_error', {
                        level: 'error',
                        autoClose: true,
                        messages: 'Error al cargar datos.',
                    });
                },
                complete: () => {
                    if(this.records){
                        //Se establece el campo asigna_manual_c para mostrar en la vista el campo tct_related_person_txf_c
                        this.model.set('asigna_manual_c',true);

                    }
                },
            });

        }
    },

    /**
     * Función que controla el evento click en el campo tct_related_person_txf_c
     *
     */
    onClick: function(h) {

        if(this.model.get('tct_related_person_txf_c')=="SIN REGISTROS RELACIONADOS"){
            this.model.set("parent_type",'Accounts');
            this.model.set("parent_id",this.model.get('tct_id_parent_txf_c'));
        }else{
            app.controller.loadScreen({
                view:TodoFilteredListView,
                data:{
                    parentModel:this.model,
                },
            });

        }

    },

});

customization.register(CallEditView,{module: 'Calls'});

module.exports = CallEditView;

