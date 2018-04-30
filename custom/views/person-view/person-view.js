
const app = SUGAR.App;
const customization = require('%app.core%/customization.js');
const dialog = require('%app.core%/dialog');
const AddressEditView = require('%app.views%/edit/address-edit-view');
const EditView = require('%app.views.edit%/edit-view');

const AccountEditView = customization.extend(EditView, {

    initialize(options) {
        this._super(options);
        
        //Condición para conocer si se el registro es nuevo o ya ha sido creado
        //if(this.model.get('id') == "" || this.model.get('id')==undefined){
        if(this.isCreate){
            //Creando registro  
            var strUrl = 'Users/' + this.model.get('assigned_user_id');
            self=this;
            app.api.call('GET', app.api.buildURL(strUrl), null, {
                success: _.bind(function (modelo) {
                        //OBTENIENDO PRODUCTOS
                        var productos=modelo.productos_c;
                        if(productos.length>0){
                            if(productos.indexOf("1") !== -1){
                                self.model.set('promotorleasing_c',modelo.name);
                                self.model.set('user_id_c', modelo.id);
                            }else{
                                self.model.set('promotorleasing_c','9 - Sin Gestor');
                                self.model.set('user_id_c','569246c7-da62-4664-ef2a-5628f649537e');
                            }
                            if(productos.indexOf("4") !== -1){
                                self.model.set('promotorfactoraje_c',modelo.name);
                                self.model.set('user_id1_c',modelo.id);
                            }else{
                                self.model.set('promotorfactoraje_c','Maria de Lourdes Campos Toca');
                                self.model.set('user_id1_c','a04540fc-e608-56a7-ad47-562a6078519d');
                            }
                            if(productos.indexOf("3") !== -1){
                                self.model.set('promotorcredit_c',modelo.name);
                                self.model.set('user_id2_c',modelo.id);
                            }else {
                                self.model.set('promotorcredit_c','Adriana Gayosso Cruz');
                                self.model.set('user_id2_c','7a83c151-6fc3-dc2b-b3a0-562a60aa3b74');
                            }
                            //if(contains.call(modelo.get('productos_c'), "1")==false && contains.call(modelo.get('productos_c'), "3") == false && contains.call(modelo.get('productos_c'), "4") == false){
                                if(productos.indexOf("1") == -1 && productos.indexOf("3") == -1 && productos.indexOf("4") == -1){
                                    self.model.set('promotorleasing_c','9 - Sin Gestor');
                                    self.model.set('user_id_c','569246c7-da62-4664-ef2a-5628f649537e');
                                    self.model.set('promotorfactoraje_c', 'Maria de Lourdes Campos Toca');
                                    self.model.set('user_id1_c', 'a04540fc-e608-56a7-ad47-562a6078519d');
                                    self.model.set('promotorcredit_c','Adriana Gayosso Cruz');
                                    self.model.set('user_id2_c','7a83c151-6fc3-dc2b-b3a0-562a60aa3b74');
                                }
                            }

                        }, self)
            });

        }else{
        //Consultado registro
        //Estableciendo como solo lectura campos de promotores
        this.model.on('sync', this.setPromotores, this);

    }


},

setPromotores: function () {

    $('.promotor_class').attr('style','pointer-events: none;');

},

});

customization.register(AccountEditView,{module: 'Accounts'});

module.exports = AccountEditView;
