$(document).ready(function () {
    controller.init();
});

// Data controller for plotting page
var dataController = (function () {
    var data, DOMStrings;

    // jQuery selectors for DOM objects
    DOMStrings = {
        plant: 'select#plotPlant',
        units: 'select#plotUnits',
        tags: 'select#plotTags',
        type: 'select#plotType',
        submitBtn: 'input#Submit',
        deleteBtn: 'button#deleteplot',
        plotArea: '#plotarea'
    };

    return {
        // executes the $.getJSON method for asynchronous data handling
        getJSONData: function (route, callback) {
            // required plotting data
            data = {
                plant: $(DOMStrings.plant).val(),
                unit: $(DOMStrings.units).val(),
                tags: $(DOMStrings.tags).val(),
                type: $(DOMStrings.type).val()
            };
            $.getJSON(route, data, callback)
        },
        // return the DOMStrings object
        getDOMStrings: function () {
            return DOMStrings
        }
    }
})();
// user interface controller
var UIController = (function () {
    var DOMStrings;
    // DOM object strings
    DOMStrings = dataController.getDOMStrings();
    // update any select field
    var updateSelect = function (selector, data) {
            selector.empty();
            $.each(data, function (value, key) {
                selector.append($("<option class='active-result'></option>")
                    .attr("value", value).text(key))
            });
            selector.trigger('chosen:updated');
        };

    return {
        // initialises the chosen jQuery plugin elements
        init: function () {
            $(DOMStrings.plant).chosen({width: '100%'});
            $(DOMStrings.units).chosen({width: '100%'});
            $(DOMStrings.tags).chosen({width: '100%'});
            $(DOMStrings.type).chosen({width: '100%'});
        },
        // setup of all select elements when plant is changed
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
        // rendering of plot data
        updatePlot: function (data) {
            var $plotarea = $(DOMStrings.plotArea);
            $plotarea.empty();
            $plotarea.append('<hr><br>');
            $plotarea.append(mpld3.draw_figure('plotarea', data.plot));
        },
        // update tags select element
        updateTags: function(data) {
            var $plotTags = $(DOMStrings.tags);
            if (data.unittags){
                updateSelect($plotTags, data.unittags)
            } else {
                updateSelect($plotTags, data.alltags)
            }

        },
        // delete plot from plot area
        deletePlot: function(){
        $(DOMStrings.plotArea).empty()
        }
    }
})();

// general plot page controller
var controller = (function () {
    var DOMStrings;

    DOMStrings = dataController.getDOMStrings();

    // setting up event listeners
    var setupEventListners = function(){
        // Event listener for plot button
        $(DOMStrings.submitBtn).on('click', function () {
            dataController.getJSONData('/_plotdata', UIController.updatePlot)
        });

        // Event listener for when units are selected (updates tags)
        $(DOMStrings.units).on('change', function () {
            dataController.getJSONData('/_unitchange', UIController.updateTags)
        });

        // Event listner for when the plant is changed (updates units and tags)
        $(DOMStrings.plant).on('change', function () {
            dataController.getJSONData('/_plantchangesetup', UIController.plantSetup);
        });

        // Event listener for delete button
        $(DOMStrings.deleteBtn).on('click', UIController.deletePlot)

    };

    return {
        init: function () {
            UIController.init();
            setupEventListners();
        }
    }
})();
