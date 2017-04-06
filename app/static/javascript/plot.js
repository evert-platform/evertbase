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
        },
        downsample: function (data, threshold) {
            // function adapted from: https://github.com/sveinn-steinarsson/flot-downsample


            var floor = Math.floor,
            abs = Math.abs;

            var data_length = data.length;
            if (threshold >= data_length || threshold === 0) {
                return data; // Nothing to do
            }

            var sampled = [],
                sampled_index = 0;

            // Bucket size. Leave room for start and end data points
            var every = (data_length - 2) / (threshold - 2);

            var a = 0,  // Initially a is the first point in the triangle
                max_area_point,
                max_area,
                area,
                next_a;

            sampled[ sampled_index++ ] = data[ a ]; // Always add the first point

            for (var i = 0; i < threshold - 2; i++) {

                // Calculate point average for next bucket (containing c)
                var avg_x = 0,
                    avg_y = 0,
                    avg_range_start  = floor( ( i + 1 ) * every ) + 1,
                    avg_range_end    = floor( ( i + 2 ) * every ) + 1;
                avg_range_end = avg_range_end < data_length ? avg_range_end : data_length;

                var avg_range_length = avg_range_end - avg_range_start;

                for ( ; avg_range_start<avg_range_end; avg_range_start++ ) {
                  avg_x += data[ avg_range_start ][ 0 ] * 1; // * 1 enforces Number (value may be Date)
                  avg_y += data[ avg_range_start ][ 1 ] * 1;
                }
                avg_x /= avg_range_length;
                avg_y /= avg_range_length;

                // Get the range for this bucket
                var range_offs = floor( (i + 0) * every ) + 1,
                    range_to   = floor( (i + 1) * every ) + 1;

                // Point a
                var point_a_x = data[ a ][ 0 ] * 1, // enforce Number (value may be Date)
                    point_a_y = data[ a ][ 1 ] * 1;

                max_area = area = -1;

                for ( ; range_offs < range_to; range_offs++ ) {
                    // Calculate triangle area over three buckets
                    area = abs( ( point_a_x - avg_x ) * ( data[ range_offs ][ 1 ] - point_a_y ) -
                                ( point_a_x - data[ range_offs ][ 0 ] ) * ( avg_y - point_a_y )
                              ) * 0.5;
                    if ( area > max_area ) {
                        max_area = area;
                        max_area_point = data[ range_offs ];
                        next_a = range_offs; // Next a is this b
                    }
                }

                sampled[ sampled_index++ ] = max_area_point; // Pick this point from the bucket
                a = next_a; // This a is the next a (chosen b)
            }

            sampled[ sampled_index++ ] = data[ data_length - 1 ]; // Always add last

            return sampled;
        },
        timeFormat: function(domain){
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
            // TODO: Not working for all types of time formats
            var plot_data = data.data;
            var headers = plot_data.shift();

            plot_data.map(function (d) {
                d[0] = new Date(d[0]);

                return d
            });


            var new_data = dataController.downsample(plot_data, 900);
            var timeFormat = dataController.timeFormat([new_data[0][0], new_data.slice(-1)[0][0]]);
            new_data = [headers].concat(new_data);

            var chart = c3.generate({
                bindto: '#plot',
                data: {
                    x: 'timestamp',
                    rows: new_data,
                    selection:{
                        enabled: true,
                        multiple: true,
                        draggable:true
                    }
                },
                axis: {
                    x: {
                        type: 'timeseries',
                        localtime: true,
                        tick:{
                            count: 15,
                            format: timeFormat,
                            fit: false

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
                    onzoom: function(domain){
                        var d = domain;
                        $.getJSON('/_daterange',{
                            ids: $(DOMStrings.tags).val(),
                            domain: [d[0].getTime(), d[1].getTime()]
                        }, function () {

                        });
                        var format = dataController.timeFormat(d);
                        var config = {
                            axis: {
                                x: {
                                    type: 'timeseries',
                                    localtime: true,
                                    tick:{
                                        count: 15,
                                        format: format
                                    }
                                }
                            }
                        };
                        chart.internal.loadConfig(config);


                    }
                },
                point: {
                    r:1
                },
                tooltip:{
                    format: {
                        title: function(d){
                            var parse = d3.time.format('%Y-%m-%d %H:%M');
                            return parse(d)}
                    }
                },
                padding:{
                    left: 50,
                    right: 50
                }
            });
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
            dataController.getJSONData('/_plotdata', UIController.updatePlot)});


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
