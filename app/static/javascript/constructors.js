function EvertTrace(name, x, y, xaxis, yaxis){
    this.name = name;
    this.x = x;
    this.y = y;
    this.xaxis = xaxis;
    this.yaxis = yaxis;
}

function EvertPlotState(){
    this.traces = [];
    this.subplots = false;
    this.linkedXAxis = false;


    this.addTrace = function(trace){
        this.traces.push(trace)
    };

    this.clearTraces = function () {
        this.traces = []
    };

}