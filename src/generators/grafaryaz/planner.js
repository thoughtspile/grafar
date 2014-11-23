'use strict';

(function(global) {
	var _G = global.grafar,
		config = _G.config.grafaryaz,
		Table2 = _G.Table2,
		union = _G.union,
		setMinus = _G.setMinus;

	function joinInput(nodes) {
		return nodes.map(function(f) {
				return f.requires;
			})
			.reduce(union, []);
	}
	
	
	function Plan(nodes, targetRef) {
		var target = targetRef.slice(),
			extensions = {},
			prePlan = [],
			counter = -1;
		
		while (target.length !== 0) {
			var stepMaps = [];
			while (target.length !== 0) {
				var name = target[0];
				
				for (var i = 0; i < nodes.length && nodes[i].supplies.indexOf(name) === -1; i++);
				if (i >= nodes.length)
					throw new Error('failed to find variable: ' + name);
					
				var temp = nodes[i],
					supplies = temp.supplies;
				target = setMinus(target, supplies);
				if (temp === undefined)
					throw new Error('variable not specified in any way:' + name);
				
				if (temp.mode === 'eq') {
					stepMaps.push(temp);
				} else if (temp.mode === 'in' || temp.mode === 'implicit') {
					if (!extensions.hasOwnProperty(name))
						extensions[supplies.join()] = {node: temp, last: counter};
					extensions[supplies.join()].first = counter;
				}
			}
			target = joinInput(stepMaps);
			prePlan = [{maps: stepMaps, extenders: []}].concat(prePlan);
			counter--;
		}
		
		Object.getOwnPropertyNames(extensions).forEach(function(names) {
			extensions[names].first += prePlan.length;
			extensions[names].last += prePlan.length;
			prePlan[extensions[names].first].extenders.push(extensions[names].node);
		});
		
		this.steps = prePlan.map(function(rawStep) {
			return new Plan.Step(rawStep.maps, rawStep.extenders);
		});
	}

	Plan.prototype.sequence = function() {
		return this.steps.reduce(function(pv, step) {
			step.maps.forEach(function(map) {
				pv.push(function(tab) {
					tab.addCol(map.supplies, map.f());
				});
			});
			step.ranges.forEach(function(extender) {
				var len = (extender.mode === 'in'? config.samples: Math.pow(config.samplesPerDOF, extender.variables.length));
				pv.push(function(tab) {
					tab.times(new Table2({capacity: len}) // argh
						.setLength(len)
						.addCol(extender.supplies, extender.f())
					);
				});
			});
			return pv;
		}, []);
	};
	
	Plan.Step = function(maps, extenders) {
		this.ranges = extenders;
		this.maps = maps;
	};
	
	
	// global
	
	_G.Plan = Plan;
}(this));