
const uidRegistry = {};
/**
 * Возвращает ключ, которого еще нет в obj.
 * Например, чтобы генерировать случайные уникальные имена переменных.
 * Формат ключа: '__grafar' + около 7 случайных символов.
 * TODO obj not needed
 */
export function makeID(obj?: any) {
    while (true) {
        const candidate = '__grafar' + Math.random().toString(36).substr(2, 9);
        if (!(candidate in uidRegistry)) {
            uidRegistry[candidate] = true;
            return candidate;
        }
    }
}

/**
 * Если передать функцию, делает строку из ее результата,
 *   иначе делает строку из параметра.
 * Костылик, чтобы в генераторы можно было передавать
 *   - функцию, возвращающую уникальное имя переменной (при создании)
 *   - Имя переменной (при обновлении)
 */
export function extractUid(source: any): string {
    if (source instanceof Function) {
        return '' + source();
    }
    return '' + source;
}

/**
 * obj -- не undefined и не null.
 * Имеет смысл использовать только для атомарных типов: объект или есть, или фолси, смело делайте if (obj) или obj || {}.
 * Также используйте ES6-параметры-по-умолчанию: (x: number = 2)
 */
export function isExisty(obj: any) {
    return typeof(obj) !== 'undefined' && obj !== null;
}

/**
 * Если передать строку, то почистит ее от пробелов и разобъет по `,`
 * Если передать массив, вернет его же, но без null и undefined.
 * Функция нормализовывала имена переменных, чтобы 'x,y', 'x, y' и ['x', 'y'] становились одинаковыми, но теперь, может, уже и не актуально.
 */
export function asArray(str: string | string[]): string[] {
    if (typeof str === 'string') {
        return str.replace(/ /g, '').split(',');
    }
    return str.filter(isExisty);
}
