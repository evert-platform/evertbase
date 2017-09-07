function EvertTrace(name, x, y, xaxis, yaxis, traceNo){
    this.name = name;
    this.x = x;
    this.y = y;
    this.xaxis = xaxis;
    this.yaxis = yaxis;
    this.traceNo = traceNo;
}

function EvertPlotState(){
    this.traces = [];
    this.subplots = false;
    this.linkedXAxis = false;
    this.plotLayout = {};
    this.formData = {};
    this.tagsMap = {};


    this.addTrace = function(trace){
        this.traces.push(trace);
    };

    this.resetState = function () {
        this.traces = [];
        this.pluginTraces = [];
        this.subplots = false;
        this.linkedXAxis = false;
        this.plotLayout = {};
        this.formData = {};
        this.tagsMap = {};
    };

    this.readState = function(state){
        this.traces = state.traces;
        this.subplots = state.subplots;
        this.linkedXAxis = state.linkedXAxis;
        this.plotLayout = state.plotLayout;
        this.formData = state.formData;
        this.tagsMap = state.tagsMap;
    };

    this.writeState = function() {
        return {
            traces: this.traces,
            subplots: this.subplots,
            linkedXAxis: this.linkedXAxis,
            plotLayout: this.plotLayout,
            formData: this.formData,
            tagsMap: this.tagsMap,
        };
    };

    this.getTraceNumbers = function (traceNames) {
        var collect = [];
        this.traces.forEach(function(d, i){
            if (_.includes(traceNames, d.name)){
                collect.push(d)
            }
        });
        return _.map(collect, function (d) {return d.traceNo;});
    };

}