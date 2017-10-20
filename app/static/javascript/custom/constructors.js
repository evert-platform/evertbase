function EvertTrace(name, x, y, xaxis, yaxis, metadata){
    "use strict";
    this.name = name;
    this.x = x;
    this.y = y;
    this.xaxis = xaxis;
    this.yaxis = yaxis;
    this.metadata = metadata;
}

function EvertPlotState(){
    "use strict";
    this.traces = [];
    this.subplots = false;
    this.linkedXAxis = false;
    this.plotLayout = {};
    this.formData = {};
    this.tagsMap = {};
    this.initialRange = [];


    this.addTrace = function(trace){
        this.traces.push(trace);
    };

    this.resetState = function () {
        this.traces = [];
        this.subplots = false;
        this.linkedXAxis = false;
        this.plotLayout = {};
        this.formData = {};
        this.tagsMap = {};
        this.initialRange = [];
    };

    this.readState = function(state){
        this.traces = state.traces;
        this.subplots = state.subplots;
        this.linkedXAxis = state.linkedXAxis;
        this.plotLayout = state.plotLayout;
        this.formData = state.formData;
        this.tagsMap = state.tagsMap;
        this.initialRange = state.initialRange;
    };

    this.writeState = function() {
        return {
            traces: this.traces,
            subplots: this.subplots,
            linkedXAxis: this.linkedXAxis,
            plotLayout: this.plotLayout,
            formData: this.formData,
            tagsMap: this.tagsMap,
            initialRange: this.initialRange
        };
    };
}