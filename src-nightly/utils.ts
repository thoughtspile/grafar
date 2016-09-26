function makeID(obj) {
    while (true) {
        var temp = '__grafar' + Math.random().toString(36).substr(2, 9);
        if (!(temp in obj))
            return temp;
    }
}

function isExisty(obj) {
    return typeof(obj) !== 'undefined' && obj !== null;
}

function asArray(str) {
    if (typeof str === 'string')
        return str.replace(/ /g, '').split(',');
    else
        return str.filter(isExisty);
}


export {
    isExisty,
    makeID,
    asArray
}
