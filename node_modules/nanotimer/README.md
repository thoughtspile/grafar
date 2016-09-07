# nanotimer
# Current Version - 0.3.14

![](https://api.travis-ci.org/Krb686/nanoTimer.png)

[![NPM](https://nodei.co/npm/nanotimer.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/nanotimer/)

A much higher accuracy timer object that makes use of the node.js [hrtime](http://nodejs.org/api/process.html#process_process_hrtime) function call.

The nanotimer recreates the internal javascript timing functions with higher resolution.

## Note

- 1) With the normal timing functions, instead of dealing with the obscurities of multiple setTimeout and
setInterval calls, now there is a concrete timer object, each of which can handle exactly 1 timeOut and
setInterval task. This also means a reference is not needed to clear an interval since each timer object is
unique.

- 2) Timer objects use the non-blocking feature **setImmediate** for time counting and synchronization. This requires node v0.10.13 or greater

- 3) Errors in timing are non-cumulative.  For example when using the setInterval command, the timer counts
and compares the time difference since starting against the interval length specified and if it has run past the interval,
it resets.  If the code had an error of 1 millisecond delay, the timer would actually count to 1001 milliseconds before resetting, and that
1 millisecond error would propagate through each cycle and add up very quickly!  To solve that problem, rather than resetting
the interval variable each cycle, it is instead incremented with each cycle count.  So on the 2nd cycle, it compares to 2000 milliseconds,
and it may run to 2001.  Then 3000 milliseconds, running to 3001, and so on.  This is only limited by the comparison variable potentially overflowing, so I
somewhat arbitrarily chose a value of 8 quadrillion (max is roughly 9 quadrillion in javascript) before it resets.  Even using nanosecond resolution however,
the comparison variable would reach 8 quadrillion every 8 million seconds, or every 93.6ish days.

## Usage

```js

var NanoTimer = require('nanotimer');

var timerA = new NanoTimer();


```

Each nanotimer object can run other functions that are already defined.  This can be done in 2 ways; with either a literal function object, or with a function declaration.

### by function object
```js
var NanoTimer = require('nanotimer');
var timerObject = new NanoTimer();


var countToOneBillion = function () {
    var i = 0;
    while(i < 1000000000){
        i++;
    }
};

var microsecs = timerObject.time(countToOneBillion, '', 'u');
console.log(microsecs);
```

or something like this:

### by function declaration

```js
var NanoTimer = require('nanotimer');

function main(){
    var timerObject = new NanoTimer();

    var microsecs = timerObject.time(countToOneBillion, '', 'u');
    console.log(microsecs);
}

function countToOneBillion(){
    var i = 0;
    while(i < 1000000000){
        i++;
    }
}

main();
```

## Full example

```js
var NanoTimer = require('nanotimer');

var count = 10;


function main(){
    var timer = new NanoTimer();

    timer.setInterval(countDown, '', '1s');
    timer.setTimeout(liftOff, [timer], '10s');



}

function countDown(){
    console.log('T - ' + count);
    count--;
}

function liftOff(timer){
    timer.clearInterval();
    console.log('And we have liftoff!');
}

main();
```

### In the example above, the interval can also be cleared another way rather than having to pass in the timer object to the liftOff task.
Instead, it can be done by specifying a callback to setTimeout, since the timer object will exist in that scope.  Like so:

```js
timer.setTimeout(liftOff, '', '10s', function(){
    timer.clearInterval();
});
```


## .setTimeout(task, args, timeout, [callback])
* **task**
  * The function or task to run.  Can be either a literal function object or reference to a function declaration.
* **args**
  * An array of arguments to pass to **task**, or an empty string,  **''** , if there are none.  Note, even a single argument must be passed as an element in an array.
  * Ex. ['someString', 5, someVariable]
* **timeout**
  * The amount of time to wait before calling **task**.   This is a string containing a non-zero integer concatenated with one of 4 possible unit specifiers.
  * Unit specifiers are:
    * **s** = seconds
    * **m** = milliseconds
    * **u** = microseconds
    * **n** = nanoseconds
  * Ex. '500s', '37u', '45n'
* **[callback]]**
  * The optional callback function to execute after the timeout has triggered.


```js
console.log("It's gonna be legen-wait for it...");

timerA.setTimeout(dary, '', '2s');

function dary(){
    console.log("dary!!");
}
```

## .setInterval(task, args, interval, [callback])
* **task**
  * The function or task to run.  Can be either a literal function object or reference to a function declaration.
* **args**
  * An array of arguments to pass to **task**, or an empty string,  **''** , if there are none.  Note, even a single argument must be passed as an element in an array.
  * Ex. ['someString', 5, someVariable]
* **interval**
  * The interval of time to wait between each call of **task**.   This is a string containing a non-zero integer concatenated with one of 4 possible unit specifiers.
  * Unit specifiers are:
    * **s** = seconds
    * **m** = milliseconds
    * **u** = microseconds
    * **n** = nanoseconds
  * Ex. '500s', '37u', '45n'
  * **Note**: 
    * If **interval** is specified as 0, the timer will run **task** as fast as possible.
    * This function is self correcting, error does not propagate through each cycle, as described above.
* **[callback]]**
  * The optional callback function to execute after the timeout has triggered.
 
```js
timerA.setInterval(task, '100m', function(err) {
    if(err) {
        //error
    }
});
```

## .time(task, args, format, [callback])
* **task**
  * The function or task to run.  Can be either a literal function object or reference to a function declaration.
* **args**
  * An array of arguments to pass to **task**, or an empty string,  **''** , if there are none.  Note, even a single argument must be passed as an element in an array.
  * Ex. ['someString', 5, someVariable]
* **format**
  * A single unit specifier indicating the format of the data to be returned.
  * Unit specifiers:
    * **s** = seconds
    * **m** = milliseconds
    * **u** = microseconds
    * **n** = nanoseconds
  * Ex. '500s', '37u', '45n'
* **[callback]**
  * The optional callback function to execute after the time call has triggered.

### Synchronous Example:
```js

var runtimeSeconds = timerA.time(doMath, '', 'u');

function doMath(){
    //do math
}

```

### Asynchronous Use:
To time something asynchronous, you only need to do these 3 things:

1. create a small wrapper function around the asynchronous task.
2. make the wrapper function take *callback* as a parameter.
3. manually call the *callback* parameter inside the callback of the asynchronous task.

It's essentially a chain of callbacks, which is probably already familiar to you. Here's an example that times how long it takes to read a file.
Suppose you're using node.js's fs.ReadFile, which is asynchronous, then create a wrapper like so:
```js
var NanoTimer = require('nanotimer');
var fs = require('fs');

var timer = new NanoTimer();


timer.time(loadFile, '', 'u', function(time){
    console.log("It took " + time + " microseconds to read that file!");
});

function loadFile(callback){
    fs.readFile('testReadFile.js', function(err, data){
        if(err) throw err;
        console.log(data);

        callback();
    });
}
```


## .clearInterval()
* Clears current running interval
```js
timer.clearInterval();
```

## .clearTimeout()
* Clears current running timeOut
```js
timer.clearTimeout();
```

# Logging
* Added preliminary logging feature.  If a timer is created by passing in 'log', it will enable verbose logging from the timer, so you can
figure out the real amount of time being taken for setTimeout or setInterval
* Currently only works on setInterval, and displays the 'cycle time', or real interval time to demonstrate how error does not propagate.  This will
be further expanded on.

# Tests

* Test suite used is mocha.
* Tests also require **should**
* In order for the test to perform properly, the timeout must be altered.
* I prefer running tests with `mocha -R spec -t 10000`

![](https://raw.github.com/Krb686/nanotimer/master/test/nanotimer_0_2_6_test_partial.png "Test Results")

# Performance

Version 0.3.1 brings about a potentially massive performance boost over previous versions.

Previous versions used a setImmediate loop running as fast as possible for checking when to execute, inside setTimeout and setInterval.
In 0.3.1, this has changed when using an intervalTime (setInterval), or delayTime (setTimeout) that is longer than 25ms.  Execution will be deferred to the standard
javascript setTimeout, aimed for 25ms before scheduled execution, where the setImmediate loop will resume.

The assumed error of javascript's setTimeout is 25ms.

Below is a test case with setInterval set to 1 second.

![](https://raw.github.com/Krb686/nanotimer/master/test/nanotimer_non_deferred.png "Non-Deferred")

![](https://raw.github.com/Krb686/nanotimer/master/test/nanotimer_deferred.png "Deferred")



