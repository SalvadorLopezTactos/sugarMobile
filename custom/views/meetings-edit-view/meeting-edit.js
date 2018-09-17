
const app = SUGAR.App;
const customization = require('%app.core%/customization.js');
const EditView = require('%app.views.edit%/modules/meetings-calls-edit-view.js');

const MeetingEditView = customization.extend(EditView, {
    initialize(options) {
        this._super(options);

        this.model.on('sync', this.readOnlyStatus,this);
        
    },

    _render: function()  
    {  
        this._super('_render');  

        if(this.isCreate){

            this.disableStatus();  
        }
        
    },

    /*
    * Se bloquea campo "Estado" al tener registro de Reunión como Realizada o No Realizasa
    */

    readOnlyStatus: function(){

        if((this.model.get('status')=="Held" && !this.isCreate) || (this.model.get('status')=="Not Held" && !this.isCreate)){

            $('select[name="status"]').parent().parent().addClass("field--readonly");
            $('select[name="status"]').parent().attr("style","pointer-events:none");

            //Se bloquea campo "Relacionado con"
            $('.field.fast-click-highlighted>.field__controls--flex').parent().attr('style','pointer-events:none');
            $('.field.fast-click-highlighted>.field__controls--flex').parent().addClass("field--readonly");

        }

    },


    disableStatus: function(){

        $('select[name="status"]').parent().parent().addClass("field--readonly");
        $('select[name="status"]').parent().attr("style","pointer-events:none");

    },  


});

customization.register(MeetingEditView,{module: 'Meetings'});

module.exports = MeetingEditView;

