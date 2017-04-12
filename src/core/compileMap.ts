export default (ptMap: (...args: number[]) => number, using, what): ConstraintData => {
    const it = '__i__';
    const data = '__data__';
    const size = '__l__';
    const fn = '__fn__';

    const unbound = new Function(data, size, fn, `
        ${ Math.random() }; // random source chunk prevents inlining / deinlining when using multiple maps
        for (var ${it} = 0; ${it} < ${size}; ${it}++) {
            ${data}['${what}'][${it}] = ${fn}(
                ${using.map(name => `${data}['${name}'][${it}]`).join(',\n')}
            );
        }
    `);

    return (data, l) => unbound(data, l, ptMap);
}
