

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
            url: model.get('thumbnailUrl'),

            // item title
            titulo: model.get('title'),
        };
    },

    // Implement buildId method to calculate the value for "data-id" HTML
    // attribute in the template (see todo-list-item.hbs).
    // Together with extractId method, this method creates a reference between
    // the record model instance and the list item element in DOM.
    buildId(model) {
        return `photos_${model.id}`;
    },

    // Converts "data-id" HTML attribute value to the ID of a model instance.
    extractId(id) {
        return id.replace('photos_', '');
    },
});

const CitasListView = customization.extend(ListView, {
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
        // Since we have custom fetch logic, we need to take care of alert
        // banners ourselves.
        // See sidecar docs for details on how to use the alert module.
        app.alert.show('ajax_load', {
            level: 'load',
            closeable: false,
            messages: app.lang.get('LBL_LOADING'),
        });

        // Use Fetch API to pull data from external source
        return window
            .fetch('http://jsonplaceholder.typicode.com/photos')
            .then(response => response.json())
            .then(data => {
                // Put the response into the view collection
                // This will trigger list rendering.
                this.collection.reset(data);

                app.alert.show('ajax_load_success', {
                    level: 'success',
                    autoClose: true,
                    messages: 'Data is loaded.',
                });
            })
            .catch(err => {
                app.alert.show('ajax_load_error', {
                    level: 'error',
                    autoClose: true,
                    messages: 'Error loading data.',
                });
            })
            .then(() => {
                // Hide LBL_LOADING alert when AJAX completes successfully or
                // otherwise.
                app.alert.dismiss('ajax_load');
            });
    },

    // Implement "onItemClick" method to override the default behavior which is
    // navigation.
    onItemClick(model) {
        const message = `${model.get('title')} URL: ${model.get('thumbnailUrl')}`;
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

    events: {
        //'click input[type="text"]': 'onClick',
        'click .class_uni_citas input[type="text"]': 'onClick',
    },

    initialize(options) {
        this._super(options);

    },



    /**
     * Función que controla el evento click en el campo tct_related_person_txf_c
     *
     */
    onClick: function(h) {

            app.controller.loadScreen({
                view:CitasFilteredListView
                /*
                data:{
                    parentModel:this.model,
                    dataAPI:this.dataAPI
                },
                */
            });


    },


 
});

customization.register(BrujulaEditView,{module: 'uni_Brujula'});

module.exports = BrujulaEditView;


