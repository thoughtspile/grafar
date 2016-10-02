import { isExisty } from './utils';
import { repeatArray, blockRepeat, repeatPoints } from './arrayUtils';
import { setPush, setPop } from './math/SetUtils';

/**
 * Реактивная переменная.
 * Идея в том, что какое-то значение зависит от других значений.
 * Хотелось бы обновлять это значение, когда родительские значения меняются (и не обновлять, еси не меняются)
 */
export class Reactive<T> {
    /** data - кеш для значений. */
    constructor(public data: T) {}

    /** Зависимость от родительских значений (src). targ -- кеш, потому что в графаре много дорогих операций. */
    private fn: (src, targ) => any = () => {};
    /** Флаг актуальности значения. Сбрасывается, когда меняются родительские переменные. */
    private _isValid = false;
    get isValid() { return this._isValid; }

    /** Реактивные переменные, от которых я завишу. */
    private sources: Reactive<any>[] = [];
    /**
     * Реактивные переменные, зависящие от меня.
     * На самом деле так себе решение, потому что теперь нужно явно вызывать Reactive.unbind, или память потечет.
     */
    private targets: Reactive<any>[] = [];

    static isReactive(obj: any) {
        return obj instanceof Reactive;
    }

    /** Ничего не делает, не знаю в чем был план. */
    push() {
        return this;
    }

    setCache(data: T) {
        this.data = data;
        this.invalidate();
        return this;
    }

    /** Установить функцию и рекурсивно инвалидировать дочерние переменные */
    lift(fn: (src, targ: T) => any) {
        this.fn = fn;
        this.invalidate();
        return this;
    }

    /** Привязать к новым реактивным родителям и рекурсивно инвалидировать дочерние переменные */
    bind(newArgs: Reactive<any>[]): Reactive<T> {
        this.unbind();
        newArgs.forEach(arg => setPush(arg.targets, this));
        this.sources = newArgs.slice();
        return this;
    }

    /** Убрать из родителей упоминания обо мне, чтобы память не текла. */
    private unbind(): Reactive<T> {
        this.sources.forEach(src => setPop(src.targets, this));
        this.sources.length = 0;
        this.invalidate();
        return this;
    }

    /** Привязать мое значение к значению source */
    assign(source: Reactive<T>): Reactive<T> {
        this.lift(([ src ]) => { this.data = src; })
            .bind([ source ]);
        return this;
    }

    /** Вычислить свое актуальное значение */
    validate(): Reactive<T> {
        if (!this.isValid) {
            const sourceData = this.sources.map(src => src.value());
            const res = this.fn(sourceData, this.data);
            if (isExisty(res)) {
                this.data = res;
            }
            this._isValid = true;
        }
        return this;
    }

    /** Рекурсивно инвалидировать детей */
    invalidate(): Reactive<T> {
        this._isValid = false;
        this.targets
            .filter(targ => targ.isValid)
            .forEach(targ => targ.invalidate());
        return this;
    }

    /** Достать актуальное значение из кеша */
    value() {
        return this.validate().data;
    }
}
