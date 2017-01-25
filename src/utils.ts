
const uidRegistry = {};
/**
 * Возвращает ключ, которого еще нет в obj.
 * Например, чтобы генерировать случайные уникальные имена переменных.
 * Формат ключа: '__grafar' + около 7 случайных символов.
 * TODO obj not needed
 */
export function makeID() {
    while (true) {
        const candidate = '__grafar' + Math.random().toString(36).substr(2, 9);
        if (!uidRegistry[candidate]) {
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
export const extractUid = (source: any) => (
    '' + (source instanceof Function ? source() : source)
);

/**
 * obj -- не undefined и не null.
 * Имеет смысл использовать только для атомарных типов: объект или есть, или фолси, смело делайте if (obj) или obj || {}.
 * Также используйте ES6-параметры-по-умолчанию: (x: number = 2)
 */
export const isExisty = (obj: any) => (
    typeof(obj) !== 'undefined' && obj !== null
);

/**
 * Если передать строку, то почистит ее от пробелов и разобъет по `,`
 * Если передать массив, вернет его же, но без null и undefined.
 * Функция нормализовывала имена переменных, чтобы 'x,y', 'x, y' и ['x', 'y'] становились одинаковыми, но теперь, может, уже и не актуально.
 */
export function asArray(str: string | string[]): string[] {
    return typeof str === 'string'
      ? str.replace(/ /g, '').split(',')
      : str.filter(isExisty);
}
