
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

    dataAPI:{},

    initialize(options) {

        //Se obtiene información pasada por FilteredListView
        this.callModel=options.context.attributes.data.parentModel;
        this.dataAPI=options.context.attributes.data.dataAPI;
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

        /*
        app.alert.show('api_load', {
            level: 'load',
            closeable: false,
            messages: app.lang.get('LBL_LOADING'),
        });
        */

        /*
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
        */

        //Los valores con los que se llena la lista, son los valores obtenidos por consumo de API
        return this.collection.reset(this.dataAPI);

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
                //Se envía información del cliente seleccionado en la lista
                modelCliente:model,

                //Se envía información de la llamada
                modelCall:this.callModel,

                //Se envía información obtenida por la petición al API desde sync en modelo de llamada
                //pasados a través de la pantalla de creación de llamadas
                dataAPI:this.dataAPI
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

    //Variable que contiene información recibida por api
    dataAPI:null,
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
        //Se mantiene la información recibida por el API personalizada
        this.dataAPI=options.dataAPI;

        const startDate=options.modelCall.get('date_start');

        //const startDate=new Date(startDateTxt);

        const hours=options.modelCall.get('duration_hours');
        const minutes=options.modelCall.get('duration_minutes');
        //const minutes=5;

        //const endDateSec = app.date().seconds(0);

        //const endDate=endDateSec.formatServer();


        const endDate=app
            .date(startDate)
            .add('h', hours)
            .add('m', minutes)
            .formatServer();


        //Se establecen datos en el modelo actual de la llamada
        //con los datos recibidos como parámetro desde el click al item de la lista related_person_items
        this.model.set('asigna_manual_c',true);
        this.model.set("name",options.modelCall.get('name'));
        //this.model.set("date_start",options.modelCall.get('date_start'));
        this.model.set("date_start",startDate);
        //this.model.set('date_end', endDate);
        this.model.set("date_end",options.modelCall.get('date_end'));
        //this.model.set("duration_hours",options.modelCall.get('duration_hours'));
        //this.model.set("duration_minutes",options.modelCall.get('duration_minutes'));
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

            //Mostrar mensaje al iniciar petición
            app.alert.show('api_load', {
                level: 'load',
                closeable: false,
                messages: app.lang.get('Recuperando información, por favor espere'),
            });

            //LLamada a API personalizada "PersonasRelacionadas"
            app.api.call('GET', app.api.buildURL(strUrl), null, {
                success: response => {
                    if(response.records.length>=1){
                        this.records=true;
                        this.dataAPI=response.records;
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
                    // Oculta alerta hasta que la petición se haya completado
                    app.alert.dismiss('api_load');
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
                    dataAPI:this.dataAPI
                },
            });

        }

    },

    /* {Override}*/
    /**
     * Se sobreescribe la función para mostrar las fechas de inicio y fin correctamente
     */

    _setDefaultDateValues() {

        //Validación para evitar que los campos de fechas de inicio y fin se llenen automáticamente
        //De esta manera los valores pasados en options de initialize se respetan y se establecen en campos date_start y date_end

        if(!_.isEmpty(this.model.get('date_start'))){
            return;
        }

        const startDate = app.date().seconds(0);

        if (this._skipSetDefaults || !this.context.isCreate()) {
            return;
        }

        // eslint-disable-next-line no-magic-numbers
        if (startDate.minutes() > 30) {
            startDate.add('h', 1).minutes(0);
        } else if (startDate.minutes() > 0) {
            // eslint-disable-next-line no-magic-numbers
            startDate.minutes(30);
        }

        this.model.set({
            date_start: startDate.formatServer(),
            duration_hours: 0,
            // eslint-disable-next-line no-magic-numbers
            duration_minutes: 30,
        });

        if (this._isDateRangeMode) {
            this._populateEndDateByDuration();
        }

        this.model.set({send_invites: false});

        this._skipSetDefaults = true;

        this._super("_setDefaultDateValues");
    },

    /*{Override}
    * Se sobreescribe función para establecer el tiempo de duración en pantalla de creación de llamadas
    * y evitar que por default se estableza el tiempo con 15 min
    * */
    _populateEndDateByDuration(duration) {

        const {model} = this;
        const startDate = model.get('date_start');
        const currentDate=app.date().seconds(0);

        if (!startDate) {
            return;
        }

        const diff = app.date(currentDate.formatServer()).diff(startDate);
        model.set('duration_hours', Math.floor(app.date.duration(diff).asHours()));
        model.set('duration_minutes', app.date.duration(diff).minutes());

        const hours = duration
            ? duration.duration_hours
            : model.get('duration_hours');

        /*
        const minutes = duration
            ? duration.duration_minutes
            : model.get('duration_minutes');
        */
        const minutes=model.get('duration_minutes');
        var endDate;
        if(minutes==0){
            endDate = app
                .date(startDate)
                .add('h', hours)
                .add('m', 1)
                .formatServer();
        }else{
            endDate = app
                .date(startDate)
                .add('h', hours)
                .add('m', minutes)
                .formatServer();
        }

        model.set('date_end', endDate);
    },

});

customization.register(CallEditView,{module: 'Calls'});

module.exports = CallEditView;
