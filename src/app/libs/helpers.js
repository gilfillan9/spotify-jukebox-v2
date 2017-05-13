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

export function objCompare(obj1, obj2, noOpposite = false, seenObjects = []) {
    try {
        if (typeof obj1 !== typeof obj2) return false;

        let seenKeys = {};
        let same = true;

        if (seenObjects.indexOf(obj1) !== -1 || seenObjects.indexOf(obj2) !== -1) {
            return false;
        }
        seenObjects.push(obj1);
        seenObjects.push(obj2);

        if ("object" === typeof obj1 && obj1 !== null && obj2 !== null) {
            same = Object.keys(obj1).every(function (key) {
                let val = obj1[key];

                if ("undefined" !== typeof seenKeys[key]) {
                    return true;
                }
                seenKeys[key] = true;

                if (typeof val !== typeof obj2[key]) {
                    return false;
                } else if ("object" === typeof val) {
                    return objCompare(val, obj2[key], noOpposite, seenObjects);
                } else if (val !== obj2[key]) {
                    return false;
                }

                return true;
            });
        } else {
            same = obj1 === obj2;
        }

        return same && (noOpposite === false || objCompare(obj2, obj1, true, seenObjects));
    } catch (e) {
        return false;
    }
}
