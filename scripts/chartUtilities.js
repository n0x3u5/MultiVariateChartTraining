var chartUtilities = {};

chartUtilities.nullMinMapper = function(val) {
    'use strict';
    return val === "" ? +Infinity : val;
};

chartUtilities.nullMaxMapper = function(val) {
    'use strict';
    return val === "" ? -Infinity : val;
};

chartUtilities.isSvgColliding = function(rectNow, rectNext) {
    'use strict';
    return !(rectNext.left > rectNow.right ||
        rectNext.right < rectNow.left ||
        rectNext.top > rectNow.bottom ||
        rectNext.bottom < rectNow.top);
};

chartUtilities.getLineIntersectionPoint = function(x1, y1, x2, y2, x3, y3, x4, y4) {
    'use strict';
    var den, num1, num2, a, b, result = {
        x: null,
        y: null
    };

    den = ((x1 - x2) * (y3 - y4)) - ((y1 - y2) * (x3 - x4));
    if (den === 0) {
        return result;
    }
    // a = l1StartY - l2StartY;
    // b = l1StartX - l2StartX;
    num1 = (((x1 * y2) - (y1 * x2)) * (x3 - x4)) - ((x1 - x2) * ((x3 * y4) - (y3 * x4)));
    num2 = (((x1 * y2) - (y1 * x2)) * (y3 - y4)) - ((y1 - y2) * ((x3 * y4) - (y3 * x4)));

    result.x = num1 / den;
    result.y = num2 / den;

    return result;
};

chartUtilities.getInterpolatedVal = function(x1, y1, x2, y2, x) {
    'use strict';
    x1 = Number(x1);
    x2 = Number(x2);
    y1 = Number(y1);
    y2 = Number(y2);
    var interpolatedVal = Math.round((y1 + ((y2 - y1) * ((x - x1) / (x2 - x1)))) * 100) / 100;
    return interpolatedVal;
};

chartUtilities.generateColor = function(colorStart, colorEnd, lum) {
    'use strict';
    // validate color string
    colorStart = String(colorStart).replace(/[^0-9a-f]/gi, '');
    if (colorStart.length < 6) {
        colorStart = colorStart[0]+colorStart[0]+colorStart[1]+colorStart[1]+colorStart[2]+colorStart[2];
    }
    colorEnd = String(colorEnd).replace(/[^0-9a-f]/gi, '');
    if (colorEnd.length < 6) {
        colorEnd = colorEnd[0]+colorEnd[0]+colorEnd[1]+colorEnd[1]+colorEnd[2]+colorEnd[2];
    }
    lum = lum || 0;

    var r = Math.ceil(parseInt(colorStart.substring(0,2), 16) * lum +
                      parseInt(colorEnd.substring(0,2), 16) * (1-lum));
    var g = Math.ceil(parseInt(colorStart.substring(2,4), 16) * lum +
                      parseInt(colorEnd.substring(2,4), 16) * (1-lum));
    var b = Math.ceil(parseInt(colorStart.substring(4,6), 16) * lum +
                      parseInt(colorEnd.substring(4,6), 16) * (1-lum));

    var rgb = chartUtilities.hex(r) + chartUtilities.hex(g) + chartUtilities.hex(b);
    return "#" + rgb;
};

chartUtilities.hex = function(x) {
    'use strict';
    x = x.toString(16);
    return (x.length == 1) ? '0' + x : x;
};

chartUtilities.shortenLargeNumber = function(num, digits) {
    'use strict';
    var units = ['k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
        decimal;
    for(var i=units.length-1; i>=0; i--) {
        decimal = Math.pow(1000, i+1);

        if(num <= -decimal || num >= decimal) {
            return +(num / decimal).toFixed(digits) + units[i];
        }
    }
    return num;
};

chartUtilities.allSame = function(arr, val) {
    'use strict';
    for (var elem of arr) {
        if (elem !== val) {
            return false;
        }
    }
    return true;
};

chartUtilities.numberMapper = function(numStr) {
    'use strict';
    return numStr === "" ? "" : Number(numStr);
};

chartUtilities.inheritsFrom = function(child, parent) {
    'use strict';
    child.prototype = Object.create(parent.prototype);
};