/**
 * Возвращает ключ, которого еще нет в obj.
 * Например, чтобы генерировать случайные уникальные имена переменных.
 * Формат ключа: '__grafar' + около 7 случайных символов.
 */
function makeID(obj: { [key: string]: any }) {
    while (true) {
        var temp = '__grafar' + Math.random().toString(36).substr(2, 9);
        if (!(temp in obj))
            return temp;
    }
}

/**
 * obj -- не undefined и не null.
 * Имеет смысл использовать только для атомарных типов: объект или есть, или фолси, смело делайте if (obj) или obj || {}.
 * Также используйте ES6-параметры-по-умолчанию: (x: number = 2)
 */
function isExisty(obj: any) {
    return typeof(obj) !== 'undefined' && obj !== null;
}

/**
 * Если передать строку, то почистит ее от пробелов и разобъет по `,`
 * Если передать массив, вернет его же, но без null и undefined.
 * Функция нормализовывала имена переменных, чтобы 'x,y', 'x, y' и ['x', 'y'] становились одинаковыми, но теперь, может, уже и не актуально.
 */
function asArray(str: string | string[]) {
    if (typeof str === 'string') {
        return str.replace(/ /g, '').split(',');
    }
    return str.filter(isExisty);
}


export {
    isExisty,
    makeID,
    asArray
}
