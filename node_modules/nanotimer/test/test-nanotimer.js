var NanoTimer = require('../lib/nanotimer.js');
var should = require('should');

var timerA = new NanoTimer('log');


describe('nanoTimer', function(){
    this.timeout(60 * 1000);

    //######## time function #########
    describe('.time', function(){
        
        //Test 1 - Synchronous Task Timing
        it('#1: synchronous, count to 1 million, 1000 samples', function(){
            
            var times = [];
            var i = 0;
            var numSamples = 1000;
            
            //Simple count to 1 million task
            var syncTask = function(){
                var count = 0;
                var i = 0;
                for(i=0;i<1000000;i++){
                    count++;
                };
            };
            
            //Test numSamples # of times
            for(i=0;i<numSamples;i++){
                times.push(timerA.time(syncTask, [], 'm'));
            }
            
            //Assertions
            times.length.should.eql(1000);
            
            var avg = 0;
            var max = 0;
            var min = 1000000000000000000;
            for(i=0;i<numSamples;i++){
                avg+=times[i];
                if(times[i] > max){
                    max = times[i];
                }
                
                if(times[i] < min){
                    min = times[i];
                }
            }
            
            avg = avg/numSamples;
            console.log('\n\t\t - Average time: ' + avg + ' milliseconds');
            console.log('\t\t - Max time: ' + max + ' milliseconds');
            console.log('\t\t - Min time: ' + min + ' milliseconds');
            
        });
        
        //Test 2 - Asynchronous Task Timing
        it('#2: asynchronous, count to 1 million, 1000 samples', function(done){
            
            var i = 0;
            var j = 0;
            var numSamples = 1000;
            var doneCount = 0;
            var times = [];
            
            //Count to 1000 asynchronously
            var asyncTask = function(callback){
                
                if(i < 1000000){
                    setImmediate(function(){asyncTask(callback);});
                } else {
                    callback();
                }
                
                i++;
            };
            
            //Run 10 instances of async task.
            for(j=0;j<numSamples;j++){
                timerA.time(asyncTask, [], 's', function(runtime){
                    should.exist(runtime);
                    times.push(runtime);
                    doneCount++;
                    if(doneCount == numSamples){
                        var avg = 0;
                        var max = 0;
                        var min = 1000000000000000000;
                        for(i=0;i<1000;i++){
                            avg+=times[i];
                            if(times[i] > max){
                                max = times[i];
                            }
                
                            if(times[i] < min){
                                min = times[i];
                            }
                        }
            
                        avg = avg/numSamples;
                        console.log('\n\t\t - Average time: ' + avg + ' seconds');
                        console.log('\t\t - Max time: ' + max + ' seconds');
                        console.log('\t\t - Min time: ' + min + ' seconds');
                        done(); 
                    }
                });
            } 
        });

        it('#3: asnyc - make sure callback format is correct', function(done) {
            timerA.time(function methodReturningAfterApprox2000ms(callback) {
                setTimeout(callback, 2000);
            }, '', 'm', function resultCallback(timeTakenInMs) {
                timeTakenInMs.should.be.within(1900, 2100);
				console.log('\t\t - Time taken should be between 1900-2100 ms');
				console.log('\t\t - Time taken: ' + timeTakenInMs);
                done();
            });
        });
    });
    
    
    //######## timeout function ########
    describe('.setTimeout && clearTimeout', function(){
        //Test 4 - sync task
        it('#4: sync, wait 0.1 seconds, 20 samples\n\n', function(done){
            var i = 0;
            var j = 0;
            var numSamples = 20;
            var doneCount = 0;
            var errors = [];
            var minError = 1000000000;
            var maxError = 0;
            var avgError = 0;
            
            
            var task = function(){
                var count = 0;
                for(i=0;i<1000000;i++){
                    count++;
                }; 
            };
            
            for(j=0;j<numSamples;j++){
                
                timerA.setTimeout(task, [], '0.1s', function(data){
                    var waitTime = data.waitTime;
                    console.log('\t\t - Sample #' + (doneCount+1));
                    console.log('\t\t\t - Expected wait: 0.1 seconds');
                    console.log('\t\t\t - Actual wait: ' + waitTime/1000000000 + ' seconds');
                    var error = (((waitTime - 100000000) / (100000000)) * 100);
                    console.log('\t\t\t - Error: ' + error + '%');
                    errors.push(error);
                    var waitedLongEnough = (waitTime >= 100000000);
                    waitedLongEnough.should.be.true;
                    
                    doneCount++;
                    
                    if(doneCount == numSamples){
                        for(i=0;i<numSamples;i++){
                            if(errors[i] < minError){
                                minError = errors[i];
                            }
                            
                            if (errors[i] > maxError){
                                maxError = errors[i];
                            }
                            
                            avgError += errors[i];
                        }
                        avgError = avgError / numSamples;
                        console.log('\t\t - Min. Error: ' + minError + '%');
                        console.log('\t\t - Max. Error: ' + maxError + '%');
                        console.log('\t\t - Avg. Error: ' + avgError + '%');
                        done();
                    }
                });
            }
            
            
            
        });
        
        //Test 5 - async task
        it('#5: setTimeout on async function with callback\n\n', function(done){
            var asyncTask = function(callback, i){
                if(!i){
                    var i = 0;
                }
                
                if(i < 1000){
                    setImmediate(function(){
                        i++;
                        asyncTask(callback, i);
                    });
                } else {
                    callback('got data');
                }
            };
            
            var runAsync = function(){
                var msg = '';
                asyncTask(function(data){
                    msg = data;
                    msg.should.eql('got data');
                });  
            };
            
            timerA.setTimeout(runAsync, [], '1s', function(data) {
                var waitTime = data.waitTime;
                console.log('\t\t - Expected wait: 1 seconds');
                console.log('\t\t - Actual wait: ' + waitTime/1000000000 + ' seconds');
                console.log('\t\t - Error: ' + (((waitTime - 1000000000) / (1000000000)) * 100) + '%');
                var waitedLongEnough = (waitTime >= 1000000000);
                waitedLongEnough.should.be.true;
                done();
            });
            
        });
        
        //Test #6 - timeout with args passed
        it('#6 works with functions with args passed in\n\n', function(done){
            var someObject = {};
            someObject.number = 10;
        
        
            var taskWithArgs = function(object){
                object.number = 5;
            };
            
            timerA.setTimeout(taskWithArgs, [someObject], '1s', function(data){
                var waitTime = data.waitTime;
                console.log('\t\t - Expected wait: 1 seconds');
                console.log('\t\t - Actual wait: ' + waitTime/1000000000 + ' seconds');
                console.log('\t\t - Error: ' + (((waitTime - 1000000000) / (1000000000)) * 100) + '%');
                var waitedLongEnough = (waitTime >= 1000000000);
                waitedLongEnough.should.be.true;
                someObject.number.should.eql(5);
                done();
            
            });
            
            
        });
		
		//Test #7 - clearTimeout works
		it('#7 clearTimeout before task is run - works\n\n', function(done){
		
		
			var value = 0;
			
			var task = function(){
				console.log('\t\t #6 task was run!');
				value++;
			};
			
			timerA.setTimeout(task, [], '1s', function(data){
				var waitTime = data.waitTime;
				console.log('\t\t - Expected wait: 1 second');
				console.log('\t\t - Actual wait: ' + waitTime/1000000000 + ' seconds');
				var waitedShortEnough = (waitTime < 1000000000);
				waitedShortEnough.should.be.true;
				value.should.eql(0);
				done();
			});
			
			timerA.clearTimeout();
			
		});
		
		
        
    });
    
    //######## setInterval function ########
    describe('setInterval && clearInterval', function(){
	
		//Test #8 - setInterval works
        it('#8 successfully works\n\n', function(done){
        
            var task = function(){
                console.log('\t\t - task was run!');
            };
            
            
            timerA.setInterval(task, [], '0.1s', function(){
                done();
            });
            
            timerA.setTimeout(function(){
                console.log('\t\t - clearing interval');
                timerA.clearInterval();
            }, [], '5s');

        });

		it('#9 setInterval with interval = 0: incrementing a variable as fast as possible.', function(done){

			var i=0;
			var taskCount = 0;

			var task = function(){
				i++;
			}

			var launchTask = function(){
				console.log("Task is being launched!");
				timerA.setInterval(task, [], '0s', function(){
					console.log("Task count = " + taskCount);
					if(taskCount < 10){
						console.log("relaunching");
						taskCount++;
						console.log("i = " + i);
						i = 0;
						launchTask();
					} else {
						console.log("Test #8 done!")
						done();
					}
				});

				console.log("T8 - setting timeout");
				timerA.setTimeout(function(){
					console.log('\t\t T8 - clearing interval');
					timerA.clearInterval();
				}, [], '0.2s');
			}

			console.log("starting the initial task");
			// Trigger the first launch
			launchTask();

		});

		it('#10 setInterval - clearing interval from within the task, non-zero timeout', function(done){

			
			console.log("Starting test #9");
			console.log("Clearing the interval from the task, zon-zero timeout");
				
			var task = function(){
				console.log("Running some task!");
				var i = 0;
				while(i<100){
					i++;
				}
				console.log("Clearing the interval");
				timerA.clearInterval();
			};

			timerA.setInterval(task, [], '1s', function(){
				console.log("Test #9 done!");
				done();


			});
		});

		it('#11 setInterval - clearing the interval from within the task, zero timeout', function(done){

			console.log("Starting test #10");
			console.log("Clearing the interval from the task, zero timeout");
			var i=0;
			var task = function(){
				if(i < 10){
					console.log("i = " + i);
					i++;
				} else {
					timerA.clearInterval();
				}
			};

			timerA.setInterval(task, [], '0s', function(){
				done();
			});

		});
        
    });
    
});




