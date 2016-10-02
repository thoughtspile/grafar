import { config as fullConfig } from '../config';
import { dot, norm } from './Vector';

const config = fullConfig.grafaryaz;

/**
 * Градиент функции fa: R^nargs -> R.
 * @result: функция (pt: number[nargs], val: number[nargs] === fa(pt), out: number[nargs])
 *   То есть нужно передать:
 *     - точку;
 *     - значение fa в этой точке (ура, сэкономили один вызов fa);
 *     - массив out, в который положить градиент.
 *   Использует nargs вызовов fa и никакой дополнительной памяти.
 *   После вызова значение pt может немного сползти на ошибку округления.
 */
export const grad = (fa: (pt: number[]) => number, nargs: number) => {
    const diffStep = config.diffStep;
    return (pt: number[], val: number, out: number[]) => {
        for (var i = 0; i < nargs; i++) {
            // Оптимизационный трюк, чтобы не выделять память и не копировать массив.
            pt[i] += diffStep;
            out[i] = (fa(pt) - val) / diffStep;
            pt[i] -= diffStep;
        }
    };
}
