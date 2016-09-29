import * as _ from 'lodash';

/*
 * Вернуть первый элемент массива set, для которого callback вернёт true.
 */
function firstMatch<T>(set: ArrayLike<T>, callback: (item: T) => boolean) {
    for (let i = 0; i <= set.length; i++) {
        if (callback(set[i])) {
            return set[i];
        }
    };
}

/*
 * Есть ли общие элементы у arr1 и arr2?
 */
function haveCommon(arr1: any[], arr2: any[]) {
    return arr1.some(e1 => arr2.indexOf(e1) !== -1);
}

/*
 * Элементы, которые есть и в `a`, и в `b`
 * TODO: зачем out?
 */
function intersection<T>(a: T[], b: T[], out) {
    return a.filter(el => b.indexOf(el) !== -1);
}

/*
 * Количество общих элементов в a и b
 */
function interPower(arr1: any[], arr2: any[]) {
    let pow = 0;
    for (let i = 0; i < arr1.length; i++) {
        if (arr2.indexOf(arr1[i]) !== -1) {
            pow++;
        }
    }
    return pow;
}

/*
 * Объединение массивов a и b в out.
 */
function union(a: any[], b: any[], out: any[] = []) {
    if (out !== a && out !== b) {
        out.length = 0;
    }
    a.reduce(setpush, out);
    b.reduce(setpush, out);
    return out;
}

/*
 * Положить в out объединение всех массивов из sets
 */
function nunion<T>(sets: T[][], out: T[]) {
    out = out || [];
    if (sets.indexOf(out) === -1) {
        out.length = 0;
    }
    sets.forEach(set => union(out, set, out));
    return out;
};

/*
 * TODO: это то же самое, что setpush
 */
function unique(pv, cv) {
    if (pv.indexOf(cv) === -1) {
        pv.push(cv);
    }
    return pv;
}

/*
 * Убрать из l все элементы, входящие в r.
 * TODO: out не нужен
 */
function setMinus<T>(l: T[], r: T[], out) {
    return l.filter(el => r.indexOf(el) === -1);
}

/*
 * Положить в arr элемент el, если его там еще нет
 */
function setpush<T>(arr: T[], el: T) {
    if (arr.indexOf(el) === -1) {
        arr.push(el);
    }
    return arr;
}

/*
 * Убрать из arr первый элемент, совпадающий с el
 */
function setpop<T>(arr: T[], el: T) {
    const i = arr.indexOf(el);
    if (i !== -1) {
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
