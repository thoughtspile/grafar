/**
 * dot - скалярное произведение <a, b>
 */
export function dot(a: ArrayLike<number>, b: ArrayLike<number>) {
    let temp = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        temp += a[i] * b[i];
    }
    return temp;
}

/**
 * L1-норма вектора a (сумма модулей компонент).
 * L1, а не нормальная норма, потому что быстрее, но, возможно, это херня.
 * Нормальная Евклидова норма -- в norm2
 */
export function norm(a: ArrayLike<number>) {
    let aNorm = 0;
    for (let i = 0; i < a.length; i++) {
        aNorm += Math.abs(a[i]);
    }
    return aNorm;
}

/**
 * Норма (нормальная, Евклидова, L2-норма) вектора a.
 * L1-норма -- в norm
 */
export function norm2(a: ArrayLike<number>) {
    let aNorm2 = 0;
    for (let i = 0; i < a.length; i++) {
        aNorm2 += a[i] * a[i];
    }
    return Math.sqrt(aNorm2);
}

/**
 * L1-расстояние между векторами a, b.
 * TODO: проверить, не смешиваются ли где-нибудь L1 и L2, неловко получится.
 */
export function dist(a: ArrayLike<number>, b: ArrayLike<number>) {
    let abDist = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        abDist += Math.abs(a[i] - b[i]);
    }
    return abDist;
}
