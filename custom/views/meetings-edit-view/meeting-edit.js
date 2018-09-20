
const app = SUGAR.App;
const customization = require('%app.core%/customization.js');
const EditView = require('%app.views.edit%/modules/meetings-calls-edit-view.js');

const MeetingEditView = customization.extend(EditView, {

    fechaInicioTemp: "",

    initialize(options) {
        this._super(options);

        //Validación de fecha
        if(this.isCreate){
            this.model.addValidationTask('ValidaFechaPermitida', _.bind(this.validaFechaInicialCall, this));
        }else{
            this.model.addValidationTask('ValidaFechaMayoraInicial', _.bind(this.validaFechaInicial2, this));
        }

        this.model.on('sync', this.readOnlyStatus,this);
        this.model.on('sync', this.cambioFecha, this);
        this.model.on('sync', this.disableStatus2, this);
        this.model.on('data:sync:complete', this.disableObjective,this);        
    },

    _render: function()  
    {  
        this._super();  

        if(this.isCreate){
            this.disableStatus();
        }

    },

    cambioFecha: function () {
        this.fechaInicioTemp = Date.parse(this.model.get("date_start"));
    },

    /* 
     * Valida que la Fecha Inicial no sea menor que la actual
     * 19/09/2018
     */
    validaFechaInicialCall: function (fields, errors, callback) {

        // FECHA INICIO
        var dateInicio = new Date(this.model.get("date_start"));
        var d = dateInicio.getDate();
        var m = dateInicio.getMonth() + 1;
        var y = dateInicio.getFullYear();
        var fechaCompleta = [m, d, y].join('/');
        // var dateFormat = dateInicio.toLocaleDateString();
        var fechaInicio = Date.parse(fechaCompleta);


        // FECHA ACTUAL
        var dateActual = new Date();
        var d1 = dateActual.getDate();
        var m1 = dateActual.getMonth() + 1;
        var y1 = dateActual.getFullYear();
        var dateActualFormat = [m1, d1, y1].join('/');
        var fechaActual = Date.parse(dateActualFormat);


        if (fechaInicio < fechaActual) {
            app.alert.show("Fecha no valida", {
                level: "error",
                title: "No puedes crear una Llamada con fecha menor al d&Iacutea de hoy",
                autoClose: false
            });

            app.error.errorName2Keys['custom_message1'] = 'La fecha no puede ser menor a la actual';
            errors['date_start'] = errors['date_start'] || {};
            errors['date_start'].custom_message1 = true;
        }
        callback(null, fields, errors);
    },

    /*
    * 
    */

    validaFechaInicial2: function (fields, errors, callback) {

        // FECHA ACTUAL
        var dateActual = new Date();
        var d1 = dateActual.getDate();
        var m1 = dateActual.getMonth() + 1;
        var y1 = dateActual.getFullYear();
        var dateActualFormat = [m1, d1, y1].join('/');
        var fechaActual = Date.parse(dateActualFormat);

        // FECHA INICIO ANTES DE CAMBIAR
        var dateInicioTmp = new Date(this.fechaInicioTemp);
        var d = dateInicioTmp.getDate();
        var m = dateInicioTmp.getMonth() + 1;
        var y = dateInicioTmp.getFullYear();
        var fechaCompletaTmp = [m, d, y].join('/');
        var fechaInicioTmp = Date.parse(fechaCompletaTmp);

        // FECHA INICIO EN CAMPO
        var dateInicio = new Date(this.model.get("date_start"));
        var d = dateInicio.getDate();
        var m = dateInicio.getMonth() + 1;
        var y = dateInicio.getFullYear();
        var fechaCompleta = [m, d, y].join('/');
        var fechaInicioNueva = Date.parse(fechaCompleta);

        if (fechaInicioTmp != fechaInicioNueva) {
            if (fechaInicioTmp < fechaActual) {
                if (fechaInicioNueva >= fechaInicioTmp) {
                    console.log("Guarda por opcion 1");
                }
                else {
                    app.alert.show("Fecha no valida", {
                        level: "error",
                        title: "No puedes guardar una reunion con fecha menor a la que se habia establecido",
                        autoClose: false
                    });

                    app.error.errorName2Keys['custom_message_date_init0'] = 'No puedes guardar una reunion con fecha menor a la que se habia establecido';
                    errors['date_start'] = errors['date_start'] || {};
                    errors['date_start'].custom_message_date_init0 = true;
                }

            //    callback(null, fields, errors);
            }
            if (fechaInicioTmp >= fechaActual) {
                if (fechaInicioNueva >= fechaActual) {
                    console.log("Guarda por opcion 2")
                }
                else {
                    app.alert.show("Fecha no valida", {
                        level: "error",
                        title: "No puedes agendar reuniones con fecha menor al d&Iacutea de hoy",
                        autoClose: false
                    });

                    app.error.errorName2Keys['custom_message_date_init1'] = 'No puedes agendar reuniones con fecha menor al d&Iacutea de hoy';
                    errors['date_start'] = errors['date_start'] || {};
                    errors['date_start'].custom_message_date_init1 = true;
                }

               // callback(null, fields, errors);
            }
        }
        callback(null, fields, errors);

    },

    /*
    * Función para evitar que el campo "Estado" se desbloquee al escribir en "Descripción" o 
    * en "Relacionado con"
    */
    onAfterShow(options){
      this.disableStatus();
    },

    /*
    * Se establecen como solo lectura el "Objetivo" y "Resultado" una vez que se ha sincronizado
    * completamente la información del registro y el Estado sea "Realizada" o "No Realizada"
    */
    disableObjective(){

        if((this.model.get('status')=="Held" && !this.isCreate) || (this.model.get('status')=="Not Held" && !this.isCreate)){

            $('select[name="objetivo_c"]').parent().parent().addClass("field--readonly");
            $('select[name="objetivo_c"]').parent().attr("style","pointer-events:none");

            $('select[name="resultado_c"]').parent().parent().addClass("field--readonly");
            $('select[name="resultado_c"]').parent().parent().attr("style","pointer-events:none");

        }


    },    


    /*
    * Se bloquea campo "Estado" al tener registro de Reunión como Realizada o No Realizada
    */

    readOnlyStatus: function(){

        if((this.model.get('status')=="Held" && !this.isCreate) || (this.model.get('status')=="Not Held" && !this.isCreate)){

            $('select[name="status"]').parent().parent().addClass("field--readonly");
            $('select[name="status"]').parent().attr("style","pointer-events:none");

        }

         //Se bloquea campo "Relacionado con"
        $('.field.fast-click-highlighted>.field__controls--flex').parent().attr('style','pointer-events:none');
        $('.field.fast-click-highlighted>.field__controls--flex').parent().removeClass('fast-click-highlighted');
        $('.field.fast-click-highlighted>.field__controls--flex').parent().addClass("field--readonly");
            
        $('.field.fast-click-highlighted>.field__controls--flex').addClass('field__controls--readonly');
        $('.field.fast-click-highlighted>.field__controls--flex').find(".inert").addClass('hide');
        $('.field.fast-click-highlighted>.field__controls--flex').removeClass('field__controls--flex');

    },

    /*
    * En la creación de registro de Reunión, el "Estado" nace como solo lectura
    */

    disableStatus: function(){
            $('select[name="status"]').parent().parent().addClass("field--readonly");
            $('select[name="status"]').parent().attr("style", "pointer-events:none");
    },

    disableStatus2: function(){
        var arr=[];
        $('input[data-type=time]').each(function(index, elem){
            var a=$(elem).val().split(':');
            var seconds = (a[0] * 60 * 60) + (a[1] * 60) ;

            arr.push(seconds);
        });
        var hour_end=Math.max.apply(null, arr);
        var date_end=Date.parse(this.model.get('date_end'));
        date_end+=hour_end;

        if(this.model.get('status')!='Held') {
            if (date_end > Date.now() || app.user.attributes.id != this.model.get('assigned_user_id')) {
                $('select[name="status"]').parent().parent().addClass("field--readonly");
                $('select[name="status"]').parent().attr("style", "pointer-events:none");
            } else {
                $('select[name="status"]').parent().parent().removeClass("field--readonly");
                $('select[name="status"]').parent().attr("style", "");
            }
        }
    },

});

customization.register(MeetingEditView,{module: 'Meetings'});

module.exports = MeetingEditView;

