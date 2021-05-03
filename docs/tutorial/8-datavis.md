While data visualization was not among the original design goals, the sheer number crunching power of grafar makes it capable of rendering scatter plots with millions of points at smooth frame rates.

```js
fetch('assets/milano-stops.json').then(res => res.json()).then((stopData) => {
    grafar.setup({ debug: true });
    var map = grafar.panel(document.getElementById('render')).setAxes(['x', 'y']);
    const stopCount = stopData.length;
    const pointCount = shapeData.length;
    var scale = 30;

    const stopId = grafar.ints(0, stopCount - 1).select();
    const stops = [
        grafar.map(stopId, id => (stopData[id][0] - 45.5) * scale),
        grafar.map(stopId, id => (stopData[id][1] - 9.2) * scale),
    ];
    stopData.length = 0;

    grafar.pin(stops, map);
});
```