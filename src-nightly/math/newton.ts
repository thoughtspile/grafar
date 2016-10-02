import { config as fullConfig } from '../config';
import { dot, norm } from './Vector';

const config = fullConfig.grafaryaz;

/** Эти контейнеры переиспользуются между вызовами newton для разных точек. */
const nabla = [];
const offset = [];
/**
 * Попробовать найти нуль функции f с градиентом gradf методом Ньютона,
 *   начиная с точки pt. Положить решение в pt (да, параметр мутирует).
 * maxIter: наибольшее число итераций. При превышении функция возвращает 0.
 * acceptNeg: возвращать pt, если f(pt) <= 0: решать неравенство.
 */
export function newton(pt: number[], f: (pt: number[]) => number, gradf: (pt0: number[], pt: number, targ: number[]) => void, acceptNeg: boolean, maxIter: number) {
    const tol = config.tol;
    const l = pt.length;
    let val = 0;
    let posterr = 0;

    for (let i = 0; i < maxIter; i++) {
        val = f(pt);
        gradf(pt, val, nabla);
        // Постериорная оценка ошибки (как далеко от решения мы находимся)
        posterr = -val / dot(nabla, nabla);

        for (let j = 0; j < l; j++) {
            offset[j] = posterr * nabla[j];
        }

        // Довольно близко
        if (norm(offset) < tol) {
            return pt;
        }

        // Подвинуть поближе
        for (let j = 0; j < l; j++) {
            pt[j] += offset[j];
        }
    }

    // Если не сошлись за maxIter итераций, вернуть 0.
    for (let j = 0; j < l; j++) {
        pt[j] = 0;
    }

    return pt;
}
