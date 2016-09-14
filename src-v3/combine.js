import _ from 'lodash';

import { Set } from './Set';


function prod(arr) {
    return arr.reduce((acc, el) => acc * el, 1);
}

function cart(comps, targ) {
    if (_.isUndefined(targ))
        targ = new Set(_(comps).invokeMap('getDims').sum());
    let srcData = _.invokeMap(comps, 'raw');
    const resSize = prod(_.invokeMap(comps, 'size'));
    targ.size(resSize);
    let targData = targ.raw();

    for (let iSet = 0, iComp = 0; iSet < comps.length; iSet++) { // each multiplier
        let rep = prod(comps.slice(0, iSet).map(c => c.size()));
        let stretch = prod(comps.slice(iSet + 1).map(c => c.size()));
        let compSize = comps[iSet].size();

        for (let iSetComp = 0; iSetComp < comps[iSet].getDims(); iSetComp++) { // each col in current multiplier
            let iEl = 0;
            for (let iRep = 0; iRep < rep; iRep++) { // repeat
                for (let iSrcEl = 0; iSrcEl < compSize; iSrcEl++) { // each element
                    let el = srcData[iSet][iSetComp][iSrcEl];
                    for (let iStretch = 0; iStretch < stretch; iStretch++) { // stretch
                        targData[iComp][iEl] = el;
                        iEl++;
                    }
                }
            }
            iComp++;
        }
    }

    return targ;
}

// shallow
function zip(comps, targ) {
    const dims = _.sum(_.map(comps, 'dims'));
    const size = _.min(_.map(comps, 'size'));
    if (!targ)
        targ = new Set(dims);
    targ._size = size;
    _.flatten(_.map(comps, '_cols'))
        .forEach((col, i) => { targ._cols[i] = col; });
    return targ;
}


export {
    cart,
    zip
};
