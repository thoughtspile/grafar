import * as _ from 'lodash';

/*
 * Положить в arr элемент el, если его там еще нет
 */
export function setPush<T>(arr: T[], el: T) {
    if (arr.indexOf(el) === -1) {
        arr.push(el);
    }
    return arr;
}

/*
 * Убрать из arr первый элемент, совпадающий с el
 */
export function setPop<T>(arr: T[], el: T) {
    const i = arr.indexOf(el);
    if (i !== -1) {
        arr.splice(i, 1);
    }
    return arr;
}
