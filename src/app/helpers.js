import {browserHistory} from "react-router";

export function eventPassthrough(context, name, valFn) {
    return function () {
        if (context.props[name] && "function" === typeof context.props[name]) {
            var args = Array.prototype.slice.call(arguments);
            var value = "function" === typeof valFn ? valFn.apply(context, args) : args;
            if (!Array.isArray(value)) {
                value = [value];
            }
            context.props[name].apply(null, value);
        }
    }
}


export function arrayEquals(a, b) {
    if ((!a && b) || (a && !b))
        return false;

    if (a.length != b.length)
        return false;

    for (var i = 0, l = a.length; i < l; i++) {
        // Check if we have nested arrays
        if (a[i] instanceof Array && b[i] instanceof Array) {
            // recurse into the nested arrays
            if (!arrayEquals(a[i], b[i]))
                return false;
        }
        else if (a[i] != b[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}

export function linkHandler(path) {
    if (arguments.length === 1) {
        return (e) => {
            e.preventDefault();
            browserHistory.push(path);
        };
    } else {
        path.preventDefault();
        browserHistory.push(path.target.pathname + path.target.search + path.target.hash);
    }
}
