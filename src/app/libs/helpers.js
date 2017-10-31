import Vibrant from "node-vibrant";

export function eventPassthrough(context, name, valFn) {
    return function () {
        if (context.props[name] && "function" === typeof context.props[name]) {
            let args = Array.prototype.slice.call(arguments);
            let value = "function" === typeof valFn ? valFn.apply(context, args) : args;
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

    if (a.length !== b.length)
        return false;

    for (let i = 0, l = a.length; i < l; i++) {
        // Check if we have nested arrays
        if (a[i] instanceof Array && b[i] instanceof Array) {
            // recurse into the nested arrays
            if (!arrayEquals(a[i], b[i]))
                return false;
        }
        else if (a[i] !== b[i]) {
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

let colours_cache = {};


export function getImageColour(url) {
    if ('undefined' !== typeof colours_cache[url]) return colours_cache[url];

    let result = new Promise((resolve, reject) => {
        let image = new Image();
        image.crossOrigin = "Anonymous";

        image.addEventListener('load', () => {
            let vibrant = new Vibrant(image);

            vibrant.getPalette().then((swatches) => {
                if (swatches.Vibrant) {
                    resolve(swatches.Vibrant.getRgb().map(Math.round.bind(Math)));
                } else {
                    reject();
                }
            }).catch(() => {
                reject();
            })
        });
        image.addEventListener('error', (e) => {
            reject();
        });
        if (url.indexOf("https://u.scdn.co") !== -1) url = url.replace("https://u.scdn.co/images/pl/default/", "https://i.scdn.co/image/");

        image.src = url;
    });

    colours_cache[url] = result;

    return result;
}

//From http://stackoverflow.com/questions/1855884/determine-font-color-based-on-background-color
export function increaseTextContrast(rgb) {
    let r = rgb[0];
    let g = rgb[1];
    let b = rgb[2];

    // Counting the perceptive luminance
    // human eye favors green color...
    let a = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return (a < 0.5);
}
