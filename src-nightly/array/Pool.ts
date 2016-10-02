import { isExisty } from '../utils';

/*
 * Хранит выделенные массивы, чтобы снизить снизить затраты на аллокацию и сборку мусора
 */
export class Pool {
    static pool: { [ className: string ]: { [length: string]: any[] } } = {}

    /*
     * Получить массив класса Constructor (например, Float32Array) и длины length
     * Если такого массива нет в пуле, создать его через new Constructor(length)
     * На самом деле работает для любых конструкторов с одним параметром
     */
    static get<T>(Constructor: new(length: number) => T, length: number): T {
        const classKey = Constructor.toString();
        const constructorKey = length.toString();
        const classPool = Pool.pool[classKey];

        if (isExisty(classPool) && isExisty(classPool[constructorKey]) && classPool[constructorKey].length !== 0) {
            return classPool[constructorKey].pop();
        }

        return new Constructor(length);
    }

    /*
     * Положить массив в пул.
     * Не стоит использовать массив после того, как передали его сюда.
     * На самом деле можно передать любой объект с полем 'length'
     */
    static push(obj: { length: number }) {
        const classKey = obj.constructor.toString();
        const constructorKey = obj.length.toString();

        if (!isExisty(Pool.pool[classKey])) {
            Pool.pool[classKey] = {};
        }

        if (!isExisty(Pool.pool[classKey][constructorKey])) {
            Pool.pool[classKey][constructorKey] = [];
        }

        Pool.pool[classKey][constructorKey].push(obj);
    }

    /*
     * Очистить пул
     */
    static flush() {
        Pool.pool = {};
    }
};
