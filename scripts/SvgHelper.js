;(function() {
    'use strict';
    /**
     * @constructor
     */
    Chart.SvgHelper = function() {
        this.svgns = "http://www.w3.org/2000/svg";
    };

    Chart.SvgHelper.prototype.createSvgByClass = function(height, width, className) {
        var svg = document.createElementNS(this.svgns, "svg");
        svg.setAttributeNS(null, "height", height + "px");
        svg.setAttributeNS(null, "width", width + "px");
        svg.setAttributeNS(null, "version", "1.1");
        svg.setAttributeNS(null, "class", className);
        return svg;
    };

    Chart.SvgHelper.prototype.drawLineByClass = function(x1, y1, x2, y2, className) {
        var line = document.createElementNS(this.svgns, "line");
        line.setAttributeNS(null, "x1", x1);
        line.setAttributeNS(null, "y1", y1);
        line.setAttributeNS(null, "x2", x2);
        line.setAttributeNS(null, "y2", y2);
        line.setAttributeNS(null, "stroke", "black");
        line.setAttributeNS(null, "class", className);
        return line;
    };

    Chart.SvgHelper.prototype.drawTextByClass = function(x, y, textContent, className) {
        var text = document.createElementNS(this.svgns, "text");
        text.setAttributeNS(null, "x", x);
        text.setAttributeNS(null, "y", y);
        text.setAttributeNS(null, "class", className);
        text.setAttributeNS(null, "stroke", "black");
        text.textContent = textContent;
        return text;
    };

    Chart.SvgHelper.prototype.drawRectByClass = function(x, y, height, width, className) {
        var rect = document.createElementNS(this.svgns, "rect");
        rect.setAttributeNS(null, "x", x);
        rect.setAttributeNS(null, "y", y);
        rect.setAttributeNS(null, "height", height);
        rect.setAttributeNS(null, "width", width);
        rect.setAttributeNS(null, "class", className);
        rect.setAttributeNS(null, "fill", "white");
        return rect;
    };

    Chart.SvgHelper.prototype.drawCircleByClass = function(cx, cy, r, className) {
        var circle = document.createElementNS(this.svgns, "circle");
        circle.setAttributeNS(null, "cx", cx);
        circle.setAttributeNS(null, "cy", cy);
        circle.setAttributeNS(null, "r", r + "px");
        circle.setAttributeNS(null, "class", className);
        return circle;
    };

    Chart.SvgHelper.prototype.getRotationPoint = function(elem) {
        var elemBox = elem.getBBox();
        var rotationPt = (elemBox.x + 14) + ", " + (elemBox.y + (elemBox.height / 2));
        return rotationPt;
    };
})();