// IIFE to not pollute global namespace. Semi-colon for safety.
;(function(){
    'use strict';

    /**
     * Boilerplate AJAX class to fetch data from a file.
     * 
     * @constructor
     * @param {string} url - A URL specifying the location of the JSON file
     * @param {parseData} callback - Callback to receive and process fetched data 
     */
    var AJAX = function(url, callback) {
        this.httpRequest = new XMLHttpRequest;
        if(!this.httpRequest) {
            console.log("Unable to create XMLHTTP instance.");
            return false;
        }
        this.httpRequest.open('POST', url, true);
        this.httpRequest.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE) {
                if(this.status === 200) {
                    callback(JSON.parse(this.responseText));
                } else {
                    console.log("There was a problem with the request");
                }
            }
        };
        this.httpRequest.send();
    };

    /**
     * Represents a MuliVariate Chart
     * 
     * @constructor
     * @param {number} index
     * @param {string} xTitle
     * @param {string} yTitle
     * @param {number[]} xData
     * @param {number[]} yData
     */
    var MultiVarChart = function(index, xTitle, yTitle, xData, yData) {
        this.index = index;
        this.xTitle = xTitle;
        this.yTitle = yTitle;
        this.xData = xData;
        this.yData = yData;
    };

    /**
     * Callback to parse the data received via AJAX
     * 
     * @callback parseData
     * @param {Object} json
     */
    var parseData = function(json) {
        // console.log(json);
        console.log("Caption: " + json.metadata.caption);
        console.log("Sub-Caption: " + json.metadata.subCaption);
        /**
         * Contains the keys of the JSON's data attribute
         * @type {string[]}
         */
        var jsonDataKeys = Object.keys(json.data);
        var numCharts = jsonDataKeys.length - 1;
        console.log("Number of charts to render: " + numCharts);
        var charts = new Array();
        for (var i = 1; i <= numCharts; i++) {
            /** 
             * @type {number[]}
             */
            var xData = json.data.Ages.split(",").map(Number);  // Mapping the each string we get after splitting to numbers
            /** 
             * @type {number[]}
             */
            var yData = json.data[jsonDataKeys[i]].split(",").map(Number);
            var chart = new MultiVarChart(i, jsonDataKeys[0], jsonDataKeys[i], xData, yData);
            charts.push(chart);
        }
        var chartCalculator = new ChartPropertyCalculator(charts);
        chartCalculator.calculateYMax();
    };

    var ChartPropertyCalculator = function (charts) {
        this.charts = charts;
        this.calculateYMax = function() {
            for (var chart of charts){
                console.log(chart.yData);
                var maxY = Math.max.apply(Math, chart.yData);
                var minY = Math.min.apply(Math, chart.yData);
                var yAxis = this.calculateYAxis(minY, maxY);
                console.log(yAxis);
                console.log("------------------------------");
            }
        };
        this.calculateYAxis = function(yMin, yMax, ticks) {
            var ticks = typeof ticks != 'undefined' ? ticks : 8;
            var tickValues = new Array();
            if(yMin === yMax) {
                yMin = yMin - 1;
                yMax = yMax + 1;
            }
            var range = yMax - yMin;
            if(ticks < 2) {
                ticks = 2;
            } else if(ticks > 2) {
                ticks -= 2;
            }
            var roughStep = range / ticks;
            var prettyMod = Math.floor(Math.log(roughStep)/Math.LN10);
            var prettyPow = Math.pow(10, prettyMod);
            var prettyDiv = Math.round(roughStep/prettyPow + 0.5);
            var prettyStep = prettyDiv * prettyPow;

            var lb = prettyStep * Math.floor(yMin/prettyStep);
            var ub = prettyStep * Math.ceil(yMax/prettyStep);
            var val = lb;
            while(1) {
                tickValues.push(Math.round((val + 0.00001)*1000)/1000);
                val += prettyStep;
                if(val > ub) {
                    break;
                }
            }
            return tickValues;
        }

    };

    

    // Reading the AJAX from the file.
    var ajax = new AJAX('res/data/user_data.json', parseData);
})();