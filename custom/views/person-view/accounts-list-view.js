const app = SUGAR.App;
const customization = require('%app.core%/customization.js');
const FilteredListView = require('%app.views%/list/filtered-list-view');

const AccountsListView = customization.extend(FilteredListView, {
    isFilterEnabled: false,
    isSearchEnabled: true,

    initialize(options) {
        this._super(options);

        //Recupera datos del cliente
        var user_id = App.user.id;
        var user_puesto = App.user.attributes.puestousuario_c;
        
        /* //Se Comenta solución por promotores y equipos
        var user_equipo = App.user.attributes.equipo_c;
        var user_equipos = App.user.attributes.equipos_c;

        //Establece puestos por filtro
        //Promotor, Gerente Leasing 
        var filtroPromotorL = ['5','4'];
        //Promotor, Gerente Factoraje 
        var filtroPromotorF = ['11','10'];
        //Promotor, Gerente CA 
        var filtroPromotorCA = ['16','15'];

        //Subdirecto, Director: Equipo principal
        var filtroEquipo = ['3','2','9','8','14'];
        // Regional, Backoffice
        var filtroEquipo2 = ['33','6','12','17'];
        
        //Evalua usuario logeado
        if (filtroPromotorL.indexOf(user_puesto) != -1) {
            //Filtro por promotor Leasing
            this.collection.filterDef = {
                user_id_c: user_id,
            };
        } else if (filtroPromotorF.indexOf(user_puesto) != -1) {
            //Fiiltro por promotor Factoraje
            this.collection.filterDef = {
                user_id1_c: user_id,
            };
        } else if (filtroPromotorCA.indexOf(user_puesto) != -1) {
            //Filtor por promotor CA
            this.collection.filterDef = {
                user_id2_c: user_id,
            };

        } else if (filtroEquipo.indexOf(user_puesto) != -1) {
            //Filtor por Equipo principal
            // this.collection.filterDef = {
            //     unifin_team: user_equipo,
            // };
            this.collection.filterDef = {
                $or :[
                    {
                        user_id_c: user_id,
                    
                    },
                    {
                        user_id1_c: user_id,
                    
                    },
                    {
                        user_id2_c: user_id,
                    
                    }
                ]
            };

        } else if (filtroEquipo2.indexOf(user_puesto) != -1) {
            //Filtor por Equipos promoción
            // this.collection.filterDef = {
            //     unifin_team: user_id,
            // };
            this.collection.filterDef = {
                unifin_team: "QRO",
            };

        } else {
            //Sin Filtro
        }
        */

        //Solución para filtrar por promotores
        var filtroPromotor = ['5','4','11','10','16','15','3','2','9','8','14','33','6','12','17'];
        if (filtroPromotor.indexOf(user_puesto) != -1) {
            this.collection.filterDef = {
                    $or :[
                        {
                            user_id_c: user_id,
                        
                        },
                        {
                            user_id1_c: user_id,
                        
                        },
                        {
                            user_id2_c: user_id,
                        
                        }
                    ]
            };
        }

    },

});

customization.register(AccountsListView, {module: 'Accounts'});

module.exports = AccountsListView;