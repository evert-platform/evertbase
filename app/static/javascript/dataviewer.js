$(document).ready(function () {
    controller.init();
});

var controller = (function () {
    var DOMStrings, DOMButtons;
    DOMStrings = {
                dataTable: '#dataview',
                plant: 'select#dataPlant',
                units: 'select#dataUnits',
                tags: 'select#dataTags',
                viewPort: 'div#dataViewPort'
            };
    DOMButtons = {
        viewData: 'input#dataView',
        deleteView: 'button#deleteView'
    };

    var setupEventListeners = function () {
        // Event listner for when the plant is changed (updates units and tags)
        $(DOMStrings.plant).on('change', function () {
            console.log(true);
            dataController.get('/_plantchangesetup', UIController.plantSetup);
        });
        // Event listener for when selected unit changes
        $(DOMStrings.units).on('change', function(){
            dataController.get('/_unitchange', UIController.updateTags)
        });
        //Event listener for view button
        $(DOMButtons.viewData).on('click', function () {
            dataController.get('/_viewdata', UIController.renderTable)
        })

    };

    return {
        getDOMStrings: function () {
            return DOMStrings
        },
        init: function () {
            UIController.init();
            setupEventListeners();
        }
    }

})();

var dataController = (function () {
    var DOMStrings;
    DOMStrings = controller.getDOMStrings();

    return {
        get: function (route, callback) {
            var data;
            // required viewing data
            data = {
                plant: $(DOMStrings.plant).val(),
                units: $(DOMStrings.units).val(),
                tags: $(DOMStrings.tags).val()

            };
            $.getJSON(route, data, callback)
        }

    }

})();

var UIController = (function () {
    var DOMStrings;
    DOMStrings = controller.getDOMStrings();
    var updateSelect = function (selector, data) {
            selector.empty();
            $.each(data, function (value, key) {
                selector.append($("<option class='active-result'></option>")
                    .attr("value", value).text(key))
            });
            selector.trigger('chosen:updated');
        };
    return {
        init: function () {
            $(DOMStrings.plant).chosen({width: '100%'});
            $(DOMStrings.units).chosen({width: '100%'});
            $(DOMStrings.tags).chosen({width: '100%'});

        },
        renderTable: function (data) {
            $(DOMStrings.viewPort).empty().append('<hr><table class="table table-striped table-bordered" id="dataview"></table>')
            var table = $(DOMStrings.dataTable).DataTable({
                data: data.data,
                columns: data.headers,
                pagingType: 'simple',
                scrollX: true,
                destroy: true
            });
        },
         plantSetup: function (data) {
            var $unitselect = $(DOMStrings.units);
            var $tags = $(DOMStrings.tags);

            // updating the unit select field
            updateSelect($unitselect, data.sections);

            //updating the tags select field
            updateSelect($tags, data.alltags);

            $unitselect.trigger('chosen:updated');
            $tags.trigger('chosen:updated');
        },
        updateTags: function(data) {
            var $plotTags = $(DOMStrings.tags);
            if (data.unittags){
                updateSelect($plotTags, data.unittags)
            } else {
                updateSelect($plotTags, data.alltags)
            }
        }
    }
})();
