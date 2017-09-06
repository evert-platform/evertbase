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
    };

    this.readState = function(state){
        this.traces = state.traces;
        this.subplots = state.subplots;
        this.linkedXAxis = state.linkedXAxis;
        this.plotLayout = state.plotLayout;
        this.formData = state.formData;
    };

    this.writeState = function() {
        return {
            traces: this.traces,
            subplots: this.subplots,
            linkedXAxis: this.linkedXAxis,
            plotLayout: this.plotLayout,
            formData: this.formData
        };
    };

    this.getTraceNumbers = function () {
        return _.map(this.traces, function (d) {return d.traceNo;});
    };

}