
const app = SUGAR.App;
const customization = require('%app.core%/customization.js');
const EditView = require('%app.views.edit%/modules/meetings-calls-edit-view.js');

const MeetingEditView = customization.extend(EditView, {
    initialize(options) {
        this._super(options);

        this.model.on('sync', this.disableStatus2, this);
        
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

        if(date_end>Date.now() || app.user.attributes.full_name!=this.model.get('assigned_user_name')) {
            $('select[name="status"]').parent().parent().addClass("field--readonly");
            $('select[name="status"]').parent().attr("style", "pointer-events:none");
        }
    },

});

customization.register(MeetingEditView,{module: 'Meetings'});

module.exports = MeetingEditView;

