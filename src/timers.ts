import { constant } from './generators';

/**
 * Милисекундный таймер. Сдвигается примерно на 16 каждый кадр (не целое значение).
 */
export const ms = () => {
    let curr = 0;
    const timer = constant(curr).select();

    let last = Date.now();
    let isActive = true;
    const tick = () => {
        if (isActive) {
            const now = Date.now();
            curr += (now - last);
            last = now;
            constant(curr).into(timer);
        }
        window.requestAnimationFrame(tick);
    };
    tick();

    return timer;
};
