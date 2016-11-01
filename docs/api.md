## grafar

`grafar.panel(container: <DOM node>)`: создать панель в элементе container.
То же, что `new grafar.Panel(container: <DOM node>)`.

`grafar.map(selection, map: Funciton)`: отобразить графар-переменные
`selection` функцией map, вернуть графар-переменную с результатом.

`grafar.pin(selection, panel: <Panel>)`: отобразить графар-переменные `selection` на графике `pan`.

`grafar.version`: счетчик версий.

`grafar.setup(changes)`: обновить настройки.

### Генераторы

`grafar.set(data: Array<number>)`

`grafar.constant(val: number)`

`grafar.ints(min: number, max: number)`

`grafar.seq(min: number, max: number, n: number)`

`grafar.range(min: number, max: number, n: number)`

`grafar.logseq(min: number, max: number, n: number)`

`grafar.vsolve(fn: Funciton, n: number, dof: number)`

`grafar.ms()`

## Panel

`<Panel>.setAxes([xName, yName, | zName ])`: установить подписи к осям. Если передать
массив из двух имен, график станет двумерным.

## Pin

`<Pin>.hide(state: boolean)`: спрятать (`state = true`) или показать (`state = false`) график.
