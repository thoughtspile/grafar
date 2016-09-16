function firstMatch(set, callback) {
    for (let i = 0; i <= set.length; i++) {
        if (callback(set[i])) {
            return set[i];
        }
    };
}

function haveCommon(arr1, arr2) {
    return arr1.some(e1 => arr2.indexOf(e1) !== -1);
}

function intersection(pv, cv, out) {
    return pv.filter(e => cv.indexOf(e) !== -1);
}

function interPower(arr1, arr2) {
    let pow = 0;
    for (let i = 0; i < arr1.length; i++) {
        if (arr2.indexOf(arr1[i]) !== -1) {
            pow++;
        }
    }
    return pow;
}

function union(a, b, out) {
    out = out || [];
    if (out !== a && out !== b)
        out.length = 0;
    a.reduce(setpush, out);
    b.reduce(setpush, out);
    return out;
}

function nunion(sets, out) {
    out = out || [];
    if (sets.indexOf(out) === -1)
        out.length = 0;
    sets.forEach(function(set) {
        union(out, set, out);
    });
    return out;
};

function unique(pv, cv) {
    if (pv.indexOf(cv) === -1)
        pv.push(cv);
    return pv;
}

function setMinus(l, r, out) {
    return l.filter(el => r.indexOf(el) === -1);
}

function setpush(arr, el) {
    if (arr.indexOf(el) === -1)
        arr.push(el);
    return arr;
}

function setpop(arr, el) {
    const i = arr.indexOf(el);
    if (el !== -1) {
        arr.splice(i, 1);
    }
    return arr;
}

export {
    firstMatch,
    interPower,
    haveCommon,
    intersection,
    union,
    nunion,
    unique,
    setMinus,
    setpush,
    setpop
}
