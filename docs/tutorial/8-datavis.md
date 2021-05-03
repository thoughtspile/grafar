While data visualization was not among the original design goals, the sheer number crunching power of grafar makes it capable of rendering scatter plots with millions of points at smooth frame rates.

<div data-sample>
  <div id="stops-map"></div>
</div>

```js
fetch('assets/milano-stops.json').then(res => res.json()).then((stopData) => {
    var map = grafar.panel(document.getElementById('stops-map')).setAxes(['x', 'y']).clearAxes();
    const stopCount = stopData.length;
    var scale = 30;

    const stopId = grafar.ints(0, stopCount - 1).select();
    const stops = [
        grafar.map(stopId, id => (stopData[id][1] - 45.5) * scale),
        grafar.map(stopId, id => (stopData[id][2] - 9.2) * scale),
    ];

    grafar.pin(stops, map);
});
```
