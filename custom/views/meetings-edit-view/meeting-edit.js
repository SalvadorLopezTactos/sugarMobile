
const app = SUGAR.App;
const customization = require('%app.core%/customization.js');
const EditView = require('%app.views.edit%/modules/meetings-calls-edit-view.js');

const MeetingEditView = customization.extend(EditView, {
    initialize(options) {
        this._super(options);
        
    },

    _render: function()  
    {  
        this._super('_render');  

        if(this.isCreate){

            this.disableStatus();  
        }
        
    },


    disableStatus: function(){

        $('select[name="status"]').parent().parent().addClass("field--readonly");
        $('select[name="status"]').parent().attr("style","pointer-events:none");

    },  


});

customization.register(MeetingEditView,{module: 'Meetings'});

module.exports = MeetingEditView;

