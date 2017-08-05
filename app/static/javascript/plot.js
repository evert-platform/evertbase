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
    var DOMStrings, plotState, socket, self_relayout;
    plotState = {
        pluginNames: [],
        pluginTraces: [],
        dataTraces: [],
        traces: [],
        numFeatures: function(){return plotState.pluginTraces.length},
        numData: function(){return plotState.dataTraces.length},
        allDataTraceNumbers: function(){
            var traces = [];
            this.dataTraces.forEach(function(d){
                traces.push(d.traceID);
            });
            return traces;
        }
    };

    DOMStrings = dataController.getDOMStrings();

    var updatePlot = function(data) {

        // if windows match new data is plotted
        var plotData = data.data;
        console.log(plotState.allDataTraceNumbers());

        Plotly.deleteTraces(DOMStrings.plotArea, plotState.allDataTraceNumbers());
        Plotly.addTraces(DOMStrings.plotArea, plotData, plotState.allDataTraceNumbers());

        var old_plotData = localStorage.getItem("plotData");

        localStorage.setItem("plotData", JSON.stringify({
                data: plotData,
                layout: old_plotData.layout
            }));
    };

    return {
         // rendering of plot data
        createPlot: function (data) {
            var plotData = data.data;

            plotState.pluginTraces = [];
            plotState.dataTraces = [];
            plotState.pluginNames = [];

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
                    modeBarButtonsToRemove: ["autoScale2d", "resetScale2d", "sendDataToCloud"]
                });

            plotData.forEach(function(d, i){
                plotState.traces.push(d.name, i);
                plotState.dataTraces.push({
                    name: d.name,
                    traceID: i
                });
            });

            // Event listener for when plot is zoomed. Must be called after plot is created.
            var plotArea = document.getElementById("plot");
            plotArea.on("plotly_relayout", function(e){
                console.log(e);
                console.log(Object.keys(e));

                if (_.has(e, "xaxis.range[0]") && _.has(e, "xaxis.range[1]") && self_relayout === false){
                    console.log("Zoom event");
                    var xmin = e["xaxis.range[0]"];
                    var xmax = e["xaxis.range[1]"];
                    socket.emit("zoom_event",
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

            if (plotState.pluginNames.length === 0) {

                plotState.pluginNames.push(data.name);
                var firstTraceIndex = plotState.numData();
                var traceIds = [];
                var traceNames = [];

                data.data.forEach(function(d, i){
                    traceIds.push(firstTraceIndex + i);
                    traceNames.push(d.name);
                });
                plotState.pluginTraces.push({
                    plugin: data.name,
                    traceIDs: traceIds,
                    traceNames: traceNames
                });


                Plotly.addTraces(DOMStrings.plotArea, data.data);

            } else if (plotState.pluginNames.length !== 0) {
                console.log("plugins data present");

                var pluginDataIndex = _.indexOf(plotState.pluginNames, data.name);

                if (pluginDataIndex !== -1) {
                    var previousTraceIDs = plotState.pluginTraces[pluginDataIndex].traceIDs;

                    Plotly.deleteTraces(DOMStrings.plotArea, previousTraceIDs);
                    Plotly.addTraces(DOMStrings.plotArea, data.data, previousTraceIDs);
                }

                else if (pluginDataIndex === -1) {
                    console.log("pass");
                    // TODO: add code to add plugin if others are also present
                }

            }



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


            socket.on("pluginFeaturesEmit", function(data){
                console.log("pluginfeatures");
                console.log(data);
                plotController.uploadFeaturesData(data);
            });
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

            console.log("init");
            if (localStorage.getItem("plotData")||false) {
                var data = JSON.parse(localStorage.getItem("plotData"));
                var formData = JSON.parse(localStorage.getItem("plotForm"));
                DOMStrings = dataController.getDOMStrings();

                $(DOMStrings.plant).val(formData.plant);
                $(DOMStrings.plant).trigger("chosen:updated");
                $(DOMStrings.units).val(formData.units);
                $(DOMStrings.units).trigger("chosen:updated");
                $(DOMStrings.tags).val(formData.tags);
                $(DOMStrings.tags).trigger("chosen:updated");

                plotController.createPlot(data);
            }
        }

    };
})();
