## grafar

#### `grafar.panel(container: <DOM node>): Panel`
Cоздать панель в элементе container.
Просто сахарок для `new grafar.Panel(container: <DOM node>)`.
```js
let node = document.getElementById('pan');
let pan = grafar.panel(node);
```

#### `grafar.map(s: Selection, map: Funciton): Selection`
Отобразить графар-переменные `s` функцией `map`, вернуть графар-переменную с результатом.
```js
let z = grafar.map([x, y], (x, y) => x * y);
```

#### `grafar.pin(s: Selection, panel: <Panel>): Pin`
Отобразить графар-переменные `selection` на графике `pan`.

#### `grafar.pin({ axes: Selection, color: Selection }, panel: <Panel>): Pin`
Отобразить графар-переменные `axes` на графике `pan`, раскрасить в цвета из графар-переменных `color`.

#### `grafar.version: number`
счетчик версий.

#### `grafar.setup(changes): void`
обновить настройки (см. [/src/config.ts](../src/config.ts)).

### Генераторы

#### `grafar.set(data: Array<number>): Generator`
Обернуть числа из массива `data`.

#### `grafar.constant(val: number): Generator`
Обернуть одно число.

#### `grafar.ints(min: number, max: number): Generator`
Все целые числа между `min` и `max` включительно.

#### `grafar.seq(min: number, max: number, n: number): Generator`
`n` чисел, расположенных равномерно между `min` и `max`. Не соединять их.

#### `grafar.range(min: number, max: number, n: number): Generator`
`n` чисел, расположенных равномерно между `min` и `max`. Соединить.

#### `grafar.logseq(min: number, max: number, n: number): Generator`
`n` чисел, расположенных логарифмически между `min` и `max` (больше чисел ближе к `min`). Соединить.

#### `grafar.vsolve(fn: Funciton, n: number, dof: number): Generator`
Найти `n` нулей функции `fn` в `dof` измерениях. Выдает не более `n` точек (не соединяет). `fn` принимает координату в виде массива.
```js
var curve = grafar.vsolve((v) => v[0] + v[1] - 2, 1000, 2)
  .select();
var surf = grafar.vsolve((v) => v[0] + v[1] - v[2], 10000, 3)
  .select();
```

#### `grafar.ms(): Selection`
Милисекундный таймер. Сдвигается примерно на 16 каждый кадр. Не обязательно принимает целое значение. Обратите внимание, что `.select()` не нужен.
```js
let t = grafar.ms();
let x = grafar.range(0, 1, 20).select();
// Теперь y анимирован!
let y = grafar.map([x, t], (x, t) => Math.sin(x + t));
```

## Generator

#### `<Generator>.select(): Selection`
Создать свободные переменные из генератора.
```js
let x = grafar.constant(0).select();
```

#### `<Generator>.into(s: Selection): void`
Положить результат генератора в уже созданные переменные `s`. Все зависимые от `s` переменные автоматически обновляются.
```js
let x = grafar.constant(0).select();
grafar.set([0, 1]).into(x);
```

## Selection

Собственных методов нет, но массив из `Selection` — тоже `Seleciton`.

## Panel

#### `<Panel>.setAxes([xName, yName, | zName ])`
Установить подписи к осям. Если передать
массив из двух имен, график станет двумерным.
```js
let pan = grafar.panel(node).setAxes(['a', 'b']);
```

## Pin

#### `<Pin>.hide(state: boolean)`
Cпрятать (`state = true`) или показать (`state = false`) график.
```js
grafar.pin([x, y], pan).hide(true);
```
