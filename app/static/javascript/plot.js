$(document).ready(function () {
    controller.init();

    var namespace = '/test';
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);

    socket.on('connect', function() {
                // socket.emit('my_event', {data: 'I\'m connected!'});
                console.log('connected');
                socket.emit('connected', {msg: 'next'})
            });

    socket.on('connected', function(data){

    plotController.uploadFeaturesData(data)


    })
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
        }, timeFormat: function(domain){
            var min = domain[0], max = domain[1];
            var diff = max - min;
            var format;


           if (diff <= 3.6e6){
               format = '%H:%M:%S';
           }else if(diff <= 3.6e6*24 && diff > 3.6e6){
               format = '%H:%M'
           }else if(diff <= 3.6e6*24*30 && diff > 3.6e6*24){
               format = '%d-%b  %H:00'
           }else if(diff <=3.6e6*24*365 && diff > 3.6e6*24*30) {
               format = '%M-%d'
           } else {
               format = '%Y-%m-%d %H:%M'
           }

           return format
        }
    }
})();
// user interface controller
var UIController = (function () {
    var DOMStrings, chart;
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

        // update tags select element
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

// controller to handle plotting logic
var plotController = (function() {
    var DOMStrings, chart;

    DOMStrings = dataController.getDOMStrings();

    var zoomendCallback = function(domain){
                        var d = domain;

                        $.getJSON('/_daterange',{
                            ids: $(DOMStrings.tags).val(),
                            domain: [d[0].getTime(), d[1].getTime()]
                        }, function (data) {

                            var plot_data = data.data;
                            var headers = plot_data.shift();

                            plot_data.map(function (d) {
                                d[0] = new Date(d[0]);

                                return d
                            });
                            var new_data = [headers].concat(plot_data);

                            chart.load({
                                xs: data.datamap,
                                rows: new_data
                            });
                            chart.zoom([d[0], d[1]])

                        });
                        var format = dataController.timeFormat(d);
                        var config = {
                            axis: {
                                x: {
                                    type: 'timeseries',
                                    tick:{
                                        count: 40,
                                        format: format,
                                        culling:{
                                            max: 20
                                        }
                                    }
                                }
                            }
                        };
                        chart.internal.loadConfig(config);
                    };

    return {
         // rendering of plot data
        createPlot: function (data) {
            var plot_data = data.data;
            var headers = plot_data.shift();

            plot_data.map(function (d) {
                d[0] = new Date(d[0]);

                return d
            });

            var timeFormat = dataController.timeFormat([plot_data[1][0], plot_data.slice(-1)[0][0]]);
            plot_data = [headers].concat(plot_data);

            chart = c3.generate({
                bindto: '#plot',
                transition:{
                    duration: null
                },
                data: {
                    x: 'timestamp',
                    rows: plot_data
                },
                axis: {
                    x: {
                        type: 'timeseries',
                        localtime: true,
                        tick:{
                            count: 40,
                            format: timeFormat,
                            fit: false,
                            culling: {
                                max: 20
                            },
                            multiline: true,
                            width: 50,
                            padding:{
                                bottom: 20
                            }
                        }
                    },
                    y: {
                        tick:{
                            format: d3.format('.2f')
                            }
                        }
                    },
                zoom:{
                    enabled:true,
                    onzoomend: zoomendCallback
                },
                // tooltip:{
                //     format: {
                //         title: function(d){
                //             var parse = d3.time.format('%Y-%m-%d %H:%M');
                //             return parse(d)}
                //     }
                // },
                padding:{
                    left: 50,
                    right: 50
                }
            });
        },

        uploadFeaturesData: function (data) {
             for (var i=0; i<data.msg.length; i++) {
                console.log(data.msg[i])
             }
        },
        // delete plot from plot area
        deletePlot: function() {
        chart = chart.destroy()
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
            dataController.getJSONData('/_plotdata', plotController.createPlot)});


        // Event listener for when units are selected (updates tags)
        $(DOMStrings.units).on('change', function () {
            dataController.getJSONData('/_unitchange', UIController.updateTags)
        });

        // Event listner for when the plant is changed (updates units and tags)
        $(DOMStrings.plant).on('change', function () {
            dataController.getJSONData('/_plantchangesetup', UIController.plantSetup);
        });

        // Event listener for delete button
        $(DOMStrings.deleteBtn).on('click', plotController.deletePlot)

    };

    return {
        init: function () {
            UIController.init();
            setupEventListners();
        }
    }
})();
