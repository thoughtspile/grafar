const global = window as any;

const typedArrayNames = [ 'Float32Array', 'Uint32Array', 'Uint16Array', 'Uint8Array' ];
typedArrayNames.forEach(name => { global[name] = global[name] || Array; })

global.performance = global.performance || {};
global.performance.now =
    global.performance.now ||
    global.performance.mozNow ||
    global.performance.msNow ||
    global.performance.oNow ||
    global.performance.webkitNow ||
    Date.now ||
    function() { return new Date().getTime(); };
