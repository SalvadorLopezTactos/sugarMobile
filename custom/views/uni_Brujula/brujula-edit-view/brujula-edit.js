//brujula-edit -custom

const app = SUGAR.App;
const customization = require('%app.core%/customization.js');
const EditView = require('%app.views.edit%/edit-view');
const ListView = require('%app.views%/list/list-view');
const FilteredListView = require('%app.views%/list/filtered-list-view');
const dialog = require('%app.core%/dialog');

const geolocation = require('%app.core%/geolocation');
const AddressEditView = require('%app.views%/edit/address-edit-view');
const NomadView = require('%app.views%/nomad-view');
const DetailView = require('%app.views.detail%/detail-view');

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
            cliente: model.get('cliente'),

            estatus: this.getStatus(model),

            //color
            color: this.getColor(model),

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

    //Determina color
    getColor(model) {
        var color = '#f75f60';
        var objetivo = model.get('objetivo_c');
        var estatus = model.get('status');
        var resultado = model.get('resultado_c');

        //validación
        if(objetivo && estatus && resultado){
            color = '#1fce6d';
        }
        return color;
    },

    getStatus(model) {

        var estatus = model.get('status');

        switch(estatus){
            case "1":
            estatus="REALIZADA";
            break;
            case "2":
            estatus="CANCELADA";
            break;
            case "3":
            estatus="REPROGRAMADA";
            break;

            default:
            estatus="";
        }

        return estatus;
    },

});

const CitasListView = customization.extend(ListView, {

    dataCitas:{},

    initialize(options) {

        //Se obtiene información pasada por FilteredListView
        this._super(options);
        this.dataCitas=options.context.attributes.data.dataCitas;

    },
    // Disable list item context menu.
    contextMenuDisabled: true,

    // Provide custom template (see todo-list.hbs).
    template: 'related_citas_list',

    // Specify list item provider defined above.
    listItemDataProvider: 'related_citas_items',

    // Specify list item template (see todo-list-item.hbs).
    listItemTpl: 'related_citas_items',

    // Implement "onItemClick" method to override the default behavior which is
    // navigation.
    onItemClick(model) {
        // ---- OK onItemClick(model) {
            app.controller.loadScreen({
             isDynamic: true,
             view: CitaEditView,
             data: {
                parentModel: model,
                collection: model.collection,
            },
        });


    },
});

const CitasFilteredListView = customization.extend(FilteredListView, {
    getListViewDef(options) {
        return _.extend({}, this._super(options), {
            view: CitasListView,
        });
    },

    headerConfig: {
        title: 'Citas',
        buttons: {
            save: {label: 'Listo'},
            cancel: {label: 'Regresar'},
        },
    },

    initialize(options){
      this._super(options);
      this.parentModel = options.data.parentModel;
      //this.dataCitas = options.data.dataCitas;
      this.dataCitas = this.parentModel.collection.models;
      //this.dataCitas = this.collection.models;
      //this.model.addValidationTask('CustomCurrencyValidationTask',_validate.bind(this));
  },

    // Override "loadData" method to implement custom logic for fetching data.
    loadData(options) {
        this.collection.reset(this.dataCitas);
    },

    onAfterShow(options){
      var a="test";
      this.collection.reset(this.collection.models);
  },

  onHeaderSaveClick() {
    console.log('---listo---');
    this.dataCitas = this.collection.models;
    console.log(this.dataCitas);
    var completa = true;

        //Valida elementos completados de dataCitas
        // this.dataCitas.forEach(function(element) {
        //   //console.log(element.status);
        //   if(element.objetivo_c && element.resultado_c && element.status){
        //     //Cita completa
        //   }else {
        //     completa = false;
        //   }
        //
        // });

        //Genera citasCleaned
        var citasCleaned = [];
        _.each(this.dataCitas, function(key, value) {

            var acompaniante = "";
            var estatus = key.attributes.status; //"";
            var referenciada = "";
            if(!_.isEmpty(key.attributes.acompanante)){
                acompaniante = key.attributes.acompanante;
            }else{
                acompaniante = "Editar";
            }

            // if(key.attributes.status == "Held"){
            //     estatus = "1";
            // }
            // else{
            //     estatus = "";
            // }

            if(key.attributes.referenciada_c == 1){
                referenciada = "checked";
            }

            var duration_minutes = +key.attributes.duration_minutes;
            if(key.attributes.duration_hours != 0){
                var duration_hours =  +key.attributes.duration_hours * 60;

                duration_minutes += duration_hours;
            }

            var nueva_cita = {
                id: key.attributes.id,
                parent_id: key.attributes.parent_id,
                parent_name: key.attributes.cliente,
                duration_minutes: duration_minutes,
                nuevo_traslado: key.attributes.traslado,
                //nuevo_traslado: 0,
                nuevo_referenciada: referenciada,
                nuevo_acompanante: acompaniante,
                nuevo_acompanante_id: key.attributes.user_id_c,
                nuevo_objetivo: key.attributes.objetivo_c,
                nuevo_estatus: estatus,
                nuevo_resultado: key.attributes.resultado_c,
            };
            citasCleaned.push(nueva_cita);
        });

        //Set citas_brujula
        this.parentModel.set("citas_brujula",citasCleaned);
        this.parentModel.set("tiempo_prospeccion",0);

        this.dataCitas = this.collection.models;
        this.parentModel.collection.models=this.dataCitas;

        // Closes the view and navigates back to the record edit view.
        app.controller.goBack();
    },

});

function _validate(fields, errors, callback) {
    // Each validation task is called once during bean save.
    // 'fields' is hash of fields being saved.
    // 'errors' is hash of validation errors. If validation fails validator
    // should push error object to 'errors' hash
    // to let validation routine know that validation failed for specific field.
    // Validation is async and 'callback' must be called when it completes
    // (either successfully or with error).
    if (this.collection.models) {
        var errorCitas = false;
        //Valida citas relacionadas
        if (this.collection.models.length > 0 && this.collection.models[0].attributes.status) {
          this.collection.models.forEach(function(element) {
            if(element.attributes.objetivo_c && element.attributes.resultado_c && element.attributes.status){
              //Cita completa
          }else {
              errorCitas = true;
          }
      });
      }

        //Agrega error
        if(errorCitas){
          errors['tct_uni_citas_txf_c'] = {'required':true};
          errors['tct_uni_citas_txf_c']= {'Existen citas sin actualizar':true};
      }

  }

  callback(null, fields, errors);
};

const BrujulaDetailView = customization.extend(DetailView, {
  onAfterShow(){
      //$(".createBtn").hide();
      try {
         var menu = $(".createBtn");
         menu[1].classList.add('hide');
     }
     catch(err) {
         console.log(err.message);
     }

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


        this.model.on("change:fecha_reporte",this.getCitas, this);

        //this.model.on("change:contactos_numero",this.getCitas, this);
        this.model.on("change:contactos_duracion",this.changeDuration, this);
        this.model.on("change:tiempo_prospeccion",this.changeDuration, this);

        //Validation task
        this.model.addValidationTask('Valida citas',_validate.bind(this));
    },

    handleValidationError(error) {
        // This function will be called if validation fails. Put your error
        // handling code here.
        // Default implementation will put error key to html underneath the
        // field ('Custom Validation Failed' in this case)
        this._super(error);
    },

    _isValidViaSomeCondition(value) {
        // Put your custom validation code here
        return false;
    },

    render: function () {
       this._super("_render");
       this.setHeaders();
   },

   setHeaders: function() {
      //this.model.set('name','Backlog');
      $( ".bloque1" ).before('<div class="field" style="background-color:#2c97de; color:white"> Contactos/Llamadas </div>' );
      $( ".bloque2" ).before('<div class="field" style="background-color:#2c97de; color:white"> Resultados </div>' );
      $( ".bloque3" ).before('<div class="field" style="background-color:#2c97de; color:white"> Citas </div>' );
      $( ".bloque4" ).before('<div class="field" style="background-color:#2c97de; color:white"> Tiempos (horas)</div>' );

  },

  onAfterShow(){
    if (!this.isCreate) {
        $(".header__btn--save").hide();
        $(".delete").hide();
    }
  },


    /**
     * Función que controla el evento click en el campo tct_related_person_txf_c
     *
     */
     onClickNavigateCitas: function(h) {
      app.controller.loadScreen({
         isDynamic: true,
         view: CitasFilteredListView,
         data: {
            dataCitas:this.dataCitas,
                //dataCitas:this.collection.models,
                parentModel: this.model,
            },
        });

  },

    /**
     * Función que controla el evento click en el campo Duración minutos
     *
     */
     changeDuration: function() {

      var total = 0;
      var citas_brujula = this.model.get("citas_brujula");
      var contactos_duracion = this.model.get("contactos_duracion");

      if(contactos_duracion > 0){
          total = +contactos_duracion;
      }

      _.each(citas_brujula, function(key, value) {

          if(key["nuevo_estatus"] == "1") {
              var minutos = +key["duration_minutes"] + +key["nuevo_traslado"];
              if (minutos > 0) {
                  total += minutos;
              }
          }
      });

      total = total / 60;
      this.model.set('tiempo_prospeccion',total);
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
        if (this.isCreate) {
            var fecha = this.model.get("fecha_reporte");
            var Params = {
                'promotor': this.model.get("assigned_user_id"),
                'fecha': this.model.get("fecha_reporte"), //"2018-05-02",
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

                        //this.dataCitas=data;
                        this.collection.models = data;

                    },
                    error: er => {
                        app.alert.show('api_carga_error', {
                            level: 'error',
                            autoClose: true,
                            messages: 'Error al cargar datos: '+er,
                        });
                    },
                    complete: () => {
                        // if(this.dataCitas){
                            if(this.collection.models){
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

        }
    },


});

// const NewListView  = customization.extend(AddressEditView, {
//     // Declare 'click' event for the location button (see address-edit.hbs
//     // template)
//     initialize(options){
//       this._super(options);
//       this.parentModel = options.data.parentModel;
//       this.collection = options.data.collection;
//       console.log(options);
//
//       //this.model.addValidationTask('CustomCurrencyValidationTask',_validate.bind(this));
//     },
//
//     headerConfig: {
//         title: 'Cita Detalle',
//         buttons: {
//             save: {label: 'Listo'},
//             cancel: {label: 'Regresar'},
//         },
//     },
//
//     onHeaderSaveClick() {
//         console.log('---listo---');
//         var completa = true;
//         this.parentModel.set('cliente','test-a');
//         this.parentModel.collection = this.collection;
//         app.controller.goBack();
//     }
// });

////////////
//HABILITANDO CUSTOM VIEW PARA EDICIÓN DE CITAS
let CitaEditView = customization.extend(NomadView, {
    // Specify the name of HBS template
    template: 'citas-edit-view',

    // Configure the header
    headerConfig: {
        title: 'Editar Cita',
        buttons: {
            save: {label: 'Listo'},
            cancel: {label: 'Regresar'},
        },
    },

    events: {
        //'click input[type="text"]': 'onClick',
        'click .checkbox_default': 'onClickCheck',
        'change select[name="objetivo_list"]': 'onChangeObjetivo',
    },

    initialize(options) {

        self = this;
        this._super(options);

        /*
        parentModel:model,
                collection:model.collection,
                */
                this.parentModel = options.data.parentModel;
                this.collection= options.data.collection;

                this.strCliente = options.data.parentModel.get('cliente');
                var duracionHours=options.data.parentModel.get('duration_hours');
                var duracionMinutos=0;
        //Convirtiendo el valor de duration_hours a minutos para mostrarlo en la vista
        if(duracionHours!="0"){
            duracionMinutos=parseInt(duracionHours) * 60;
        }
        var sumaMinutos=duracionMinutos + parseInt(options.data.parentModel.get('duration_minutes'));
        this.strNuevaDuracion=sumaMinutos;

        this.strNuevoTraslado=options.data.parentModel.get('traslado');

        var acompaniante=options.data.parentModel.get('acompanante');
        if(acompaniante==null){
            acompaniante="";
        }
        this.strAcompaniante=acompaniante;

        this.value_check=options.data.parentModel.get('referenciada_c');
        if(this.value_check=="0"){
            this.value_check=parseInt(this.value_check);

        }

        //Obteniendo valores de objetivo, estatus y resultado
        this.strObjetivo=options.data.parentModel.get('objetivo_c');
        this.strEstatus=options.data.parentModel.get('status');
        this.strResultado=options.data.parentModel.get('resultado_c');

        //Cambio estatus
        if (this.strEstatus == 'Held') {
          this.strEstatus = 1;
        }


    },

    onAfterShow(){

        $(".errorObjetivo").hide();
        $(".errorEstatus").hide();
        $(".errorResultado").hide();

        if(this.strObjetivo != null){
            var selectObj=$("select[name='objetivo_list']")[0];
            selectObj.value=this.strObjetivo;
        }
        if(this.strEstatus != null){
            var selectEst=$("select[name='estatus_list']")[0];
            selectEst.value=this.strEstatus;
        }
        if(this.strResultado != null){
            var selectRes=$("select[name='resultado_list']")[0];
            selectRes.value=this.strResultado;
        }

    },

    onClickCheck: function(e) {
        if(this.value_check==0){
            //Es la primera vez, se establece como 1
            this.value_check="1";

        }
        else if(this.value_check=="1"){
            this.value_check="0";

        }else{
            this.value_check="1";
        }

    },

    onChangeObjetivo:function(e){
        var obj=e.currentTarget.value;

        switch(obj){
            //PRESENTACION
            case "1":
            $("select[name='resultado_list']")
            .html("<option value=''></option>"+
                "<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='2'>No está interesado</option>"+
                "<option value='3'>Está interesado, pero no en este momento</option>"+
                "<option value='4'>Está Interesado. Se procede a generar expediente</option>"+
                "<option value='5'>Está Interesado. Se agendó otra visita</option>"+
                "<option value='6'>Está Interesado. Se recogió información</option>"+
                "<option value='7'>Se cerró una venta</option>"
                );
            break;
            //EXPEDIENTE
            case "2":
            $("select[name='resultado_list']")
            .html("<option value=''></option>"+
                "<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='2'>No está interesado</option>"+
                "<option value='3'>Está interesado, pero no en este momento</option>"+
                "<option value='4'>Está Interesado. Se procede a generar expediente</option>"+
                "<option value='5'>Está Interesado. Se agendó otra visita</option>"+
                "<option value='6'>Está Interesado. Se recogió información</option>"+
                "<option value='7'>Se cerró una venta</option>"
                );
            break;
            //INCREMENTO
            case "5":
            $("select[name='resultado_list']")
            .html("<option value=''></option>"+
                "<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='2'>No está interesado</option>"+
                "<option value='3'>Está interesado, pero no en este momento</option>"+
                "<option value='4'>Está Interesado. Se procede a generar expediente</option>"+
                "<option value='5'>Está Interesado. Se agendó otra visita</option>"+
                "<option value='6'>Está Interesado. Se recogió información</option>"+
                "<option value='7'>Se cerró una venta</option>"
                );
            break;
            //RENOVACION
            case "6":
            $("select[name='resultado_list']")
            .html("<option value=''></option>"+
                "<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='2'>No está interesado</option>"+
                "<option value='3'>Está interesado, pero no en este momento</option>"+
                "<option value='4'>Está Interesado. Se procede a generar expediente</option>"+
                "<option value='5'>Está Interesado. Se agendó otra visita</option>"+
                "<option value='6'>Está Interesado. Se recogió información</option>"+
                "<option value='7'>Se cerró una venta</option>"
                );
            break;
            //VISITA OCULAR
            case "7":
            $("select[name='resultado_list']")
            .html("<option value=''></option>"+
                "<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='9'>Se logró la visita ocular parcialmente, se necesita una segunda cita</option>"+
                "<option value='10'>Se logró la visita ocular completa</option>"
                );
            break;
            //COTEJO
            case "8":
            $("select[name='resultado_list']")
            .html("<option value=''></option>"+
                "<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='11'>Se logró cotejar parcialmente, se necesita una segunda cita</option>"+
                "<option value='12'>Se logró cotejar todos los documentos</option>"
                );
            break;
            //FIRMA DE CONTRATO
            case "10":
            $("select[name='resultado_list']")
            .html("<option value=''></option>"+
                "<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='15'>Se logró parcialmente, se necesita una segunda cita</option>"+
                "<option value='13'>Se logró completamente</option>"
                );
            break;
            //COBRANZA
            case "4":
            $("select[name='resultado_list']")
            .html("<option value=''></option>"+
                "<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='14'>Aclaración de pagos</option>"+
                "<option value='16'>No se aclararon los pagos</option>"
                );
            break;
            //OTRO
            case "9":
            $("select[name='resultado_list']")
            .html("<option value=''></option>"+
                "<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='2'>No está interesado</option>"+
                "<option value='3'>Está interesado, pero no en este momento</option>"+
                "<option value='4'>Está Interesado. Se procede a generar expediente</option>"+
                "<option value='5'>Está Interesado. Se agendó otra visita</option>"+
                "<option value='6'>Está Interesado. Se recogió información</option>"+
                "<option value='7'>Se cerró una venta</option>"
                );
            break;
            //SEGURO
            case "11":
            $("select[name='resultado_list']")
            .html("<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='2'>No está interesado</option>"+
                "<option value='3'>Está interesado, pero no en este momento</option>"+
                "<option value='5'>Está Interesado. Se agendó otra visita</option>"+
                "<option value='6'>Está Interesado. Se recogió información</option>"+
                "<option value='7'>Se cerró una venta</option>"
                );
            break;
            //CIERRE
            case "12":
            $("select[name='resultado_list']")
            .html("<option value='1'>El cliente no estuvo presente, cita cancelada</option>"+
                "<option value='15'>Se logró parcialmente, se necesita una segunda cita</option>"+
                "<option value='13'>Se logró completamente</option>"
                );
            break;
            //VALOR DEFAULT
            default:
            $("select[name='resultado_list']")
            .html("<option value=''></option>");

        }

    },

    onHeaderSaveClick() {

        //$('.duracion').val()
        //$('.traslado').val()

        //Ocultando siempre los campos de error y removiendo las clases de error
        $(".errorObjetivo").hide();
        $(".errorEstatus").hide();
        $(".errorResultado").hide();

        $(".fieldObjetivo").removeClass("error");
        $(".fieldEstatus").removeClass("error");
        $(".fieldResultado").removeClass("error");

        if($("select[name='objetivo_list']")[0].value=="") {
            //Agregar color rojo a Objetivo
            $(".fieldObjetivo").addClass("error");
            $(".errorObjetivo").show();
            return;
        }

        if($("select[name='estatus_list']")[0].value=="") {
            //Agregar color rojo a Objetivo
            $(".fieldEstatus").addClass("error");
            $(".errorEstatus").show();
            return;
        }

        if($("select[name='resultado_list']")[0].value=="") {
            //Agregar color rojo a Objetivo
            $(".fieldResultado").addClass("error");
            $(".errorResultado").show();
            return;
        }

        this.parentModel.set('cliente',this.strCliente);
        this.parentModel.set('duration_hours',"0");
        this.parentModel.set('duration_minutes',$('.duracion').val());
        this.parentModel.set('referenciada_c',this.value_check);
        this.parentModel.set('acompaniante',this.strAcompaniante);
        this.parentModel.set('objetivo_c',$("select[name='objetivo_list']")[0].value);
        this.parentModel.set('status',$("select[name='estatus_list']")[0].value);
        this.parentModel.set('resultado_c',$("select[name='resultado_list']")[0].value);
        this.parentModel.set('traslado',$('.traslado').val());

        this.parentModel.collection = this.collection;
        app.controller.goBack();

    },


});

// Registrando nueva ruta citas_edit
customization.registerRoutes([{
    name: 'citas_edit',      // Uniquely identifies the route
    steps: 'Citas_edit',     // Route hash fragment: '#hello'

    handler(options) {
        // Load HelloWorld view when the route is navigated to.
        //app.controller.loadScreen(CitaEditView);

        app.controller.loadScreen({
         isDynamic: true,
         view: CitaEditView,
         data: options.data,


     });
    }
}]);
module.exports = CitaEditView;

customization.register(BrujulaEditView,{module: 'uni_Brujula'});
module.exports = BrujulaEditView;

customization.register(BrujulaDetailView,{module: 'uni_Brujula'});
module.exports = BrujulaDetailView;