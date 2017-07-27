$(document).ready(function () {
    "use strict";
    controller.init();

    plotController.init();
});

// Data controller for plotting page
var dataController = (function () {
    var data, DOMStrings;

    // jQuery selectors for DOM objects
    DOMStrings = {
        plant: "select#plotPlant",
        units: "select#plotUnits",
        tags: "select#plotTags",
        type: "select#plotType",
        submitBtn: "input#Submit",
        deleteBtn: "button#deleteplot",
        plotArea: "plot"
    };

    return {
        // executes the $.getJSON method for asynchronous data handling
        getJSONData: function (route, callback) {
            // required plotting data
            data = {
                plant: $(DOMStrings.plant).val(),
                units: $(DOMStrings.units).val(),
                tags: $(DOMStrings.tags).val(),
                type: $(DOMStrings.type).val()
            };

            localStorage.setItem("plotForm", JSON.stringify({
                plant: data.plant,
                units: data.units,
                tags: data.tags
            }));

            $.getJSON(route, data, callback);
        },
        // return the DOMStrings object
        getDOMStrings: function () {
            return DOMStrings;
        }, timeFormat: function(domain){
            var min = domain[0], max = domain[1];
            var diff = max - min;
            var format;


           if (diff <= 3.6e6){
               format = "%H:%M:%S";
           }else if(diff <= 3.6e6*24 && diff > 3.6e6){
               format = "%H:%M";
           }else if(diff <= 3.6e6*24*30 && diff > 3.6e6*24){
               format = "%d-%b  %H:00";
           }else if(diff <=3.6e6*24*365 && diff > 3.6e6*24*30) {
               format = "%M-%d";
           } else {
               format = "%Y-%m-%d %H:%M";
           }

           return format;
        }
    };
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
                selector.append($("<option class='active-result'></option>").attr("value", value).text(key));
            });
            selector.trigger("chosen:updated");
        };

    return {
        // initialises the chosen jQuery plugin elements
        init: function () {
            $(DOMStrings.plant).chosen({width: "100%"});
            $(DOMStrings.units).chosen({width: "100%"});
            $(DOMStrings.tags).chosen({width: "100%"});
            $(DOMStrings.type).chosen({width: "100%"});
        },
        // setup of all select elements when plant is changed
        plantSetup: function (data) {
            var $unitselect = $(DOMStrings.units);
            var $tags = $(DOMStrings.tags);

            // updating the unit select field
            updateSelect($unitselect, data.sections);

            //updating the tags select field
            updateSelect($tags, data.alltags);

            $unitselect.trigger("chosen:updated");
            $tags.trigger("chosen:updated");
        },

        // update tags select element
        updateTags: function(data) {
            var $plotTags = $(DOMStrings.tags);
            if (data.unittags){
                updateSelect($plotTags, data.unittags);
            } else {
                updateSelect($plotTags, data.alltags);
            }

        }
    };
})();

// controller to handle plotting logic
var plotController = (function() {
    "use strict";
    var DOMStrings, chart, features, cdomain, socket, number_traces, self_relayout;
    features = [];
    self_relayout = false;


    DOMStrings = dataController.getDOMStrings();


    var updatePlot = function(data) {

        // if windows match new data is plotted
        var plotData = data.data;

        Plotly.deleteTraces(DOMStrings.plotArea, number_traces);
        Plotly.addTraces(DOMStrings.plotArea, plotData);


        var old_plotData = localStorage.getItem('plotData');

        localStorage.setItem("plotData", JSON.stringify({
                data: plotData,
                layout: old_plotData.layout
            }));
    };

    return {
         // rendering of plot data
        createPlot: function (data) {
            var plotData = data.data;

            var N = plotData.length;
            number_traces = Array.apply(null, {length: N}).map(Number.call, Number);

            // number_traces = plotArea.length

            var layout = {
                showlegend: true,
                xaxis : {
                    title: "timestamp",
                    showline: true,
                    ticks: "outside"
                },
                yaxis: {
                    showline: true,
                    ticks: "outside",
                    fixedrange: true
                }
            };

            Plotly.newPlot(DOMStrings.plotArea, plotData, layout,
                {
                    scrollZoom: true,
                    boxZoom: false,
                    showLink: false,
                    displayLogo: false,
                    showTips: false,
                    modeBarButtonsToRemove: ['autoScale2d', 'resetScale2d', 'sendDataToCloud']
                });

            // Event listener for when plot is zoomed. Must be called after plot is created.
            var plotArea = document.getElementById('plot');
            plotArea.on('plotly_relayout', function(e){
                console.log(e);
                console.log(Object.keys(e));

                if (_.has(e, 'xaxis.range[0]') && _.has(e, 'xaxis.range[1]') && self_relayout === false){
                    console.log('Zoom event');
                    var xmin = e['xaxis.range[0]'];
                    var xmax = e['xaxis.range[1]'];
                    socket.emit('zoom_event',
                        {
                            domain: [xmin, xmax],
                            ids: $(DOMStrings.tags).val()
                        });
                }
            });


            localStorage.setItem("plotData", JSON.stringify({
                data: plotData,
                layout: layout


            }));
        },

        uploadFeaturesData: function (data) {

            var _data = data.data;

            controller.checkLocalStorage('set', 'plotFeatures', data);


        },
        // delete plot from plot area
        deletePlot: function() {
        Plotly.purge(DOMStrings.plotArea);
        localStorage.setItem("plotData", undefined);
        // localStorage.setItem('plotDomain', undefined);
        },
        init: function () {
            var namespace = "/test";
            socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port + namespace);

            socket.on("connect", function() {
                        console.log("connected");
                    });


            // socket.on("pluginFeaturesEmit", function(data){
            //     plotController.uploadFeaturesData(data);
            // });
            //
            socket.on("zoom_return", function(data){
                updatePlot(data);
            });

        }
    };
})();

// general plot page controller
var controller = (function () {
    "use strict";
    var DOMStrings;

    DOMStrings = dataController.getDOMStrings();

    // setting up event listeners
    var setupEventListners = function(){
        // Event listener for plot button
        $(DOMStrings.submitBtn).on("click", function () {
            dataController.getJSONData("/_plotdata", plotController.createPlot)});


        // Event listener for when units are selected (updates tags)
        $(DOMStrings.units).on("change", function () {
            dataController.getJSONData("/_unitchange", UIController.updateTags)
        });

        // Event listner for when the plant is changed (updates units and tags)
        $(DOMStrings.plant).on("change", function () {
            dataController.getJSONData("/_plantchangesetup", UIController.plantSetup);
        });

        // Event listener for delete button
        $(DOMStrings.deleteBtn).on("click", plotController.deletePlot);



    };

    return {
        init: function () {
            UIController.init();
            setupEventListners();

            console.log('init');
            if (localStorage.getItem('plotData')||false) {
                var data = JSON.parse(localStorage.getItem('plotData'));
                var formData = JSON.parse(localStorage.getItem('plotForm'));
                console.log('data: ', data);
                console.log('form data:', formData);

                DOMStrings = dataController.getDOMStrings();

                $(DOMStrings.plant).val(formData.plant);
                $(DOMStrings.plant).trigger('chosen:updated');
                $(DOMStrings.units).val(formData.units);
                $(DOMStrings.units).trigger('chosen:updated');
                $(DOMStrings.tags).val(formData.tags);
                $(DOMStrings.tags).trigger('chosen:updated');

                plotController.createPlot(data);
            }
        },
        checkLocalStorage: function(method, key, data){
            var data = data || {};

            if (method === 'get'){
                return (typeof localStorage.getItem(key) === undefined) ? false : JSON.parse(localStorage.getItem(key));
            } else if (method === 'set') {

                if (key === 'plotFeatures'){

                    if (localStorage.getItem('plotFeatures')) {
                        var features = JSON.parse(localStorage.getItem('plotFeatures'));
                        var data_name = data.name;
                        features[data_name] = data;
                        localStorage.setItem('plotFeatures', JSON.stringify(features))

                    } else {
                        var features = {};
                        var data_name = data.name;
                        features[data_name] = data;

                        localStorage.setItem('plotFeatures', JSON.stringify(features))

                    }

                } else {
                    localStorage.setItem(key, JSON.stringify(data))
                }
            }

    }
    };
})();
