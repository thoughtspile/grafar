'use strict';

(function(global) {
	var _GY = global.grafaryaz || (global.grafaryaz = {}),
		Table = _GY.Table,
		//Node = _GY.Node,
		//IdNode = _GY.IdNode,
		union = _GY.union,
		setMinus = _GY.setMinus;
	// note:
	//   Node and IdNode / Plan are cyclically defined with parser_script

	function joinInput(nodes) {
		return nodes.map(function(f) {
				return f.requires;
			})
			.reduce(union, []);
	}
	
	
	function Plan(nodes, targetRef) {
		//this.steps = [];
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
			//console.log('STEP MAPS', stepMaps);
			target = joinInput(stepMaps);
			prePlan = [{maps: stepMaps, extenders: []}].concat(prePlan);
			counter--;
		}
		
		Object.getOwnPropertyNames(extensions).forEach(function(names) {
			extensions[names].first += prePlan.length;
			extensions[names].last += prePlan.length;
			for (var i = extensions[names].first + 1; i <= extensions[names].last; i++)
				names.split(',').forEach(function(name) {
					prePlan[i].maps.push(new _GY.IdNode(name));
				});
			prePlan[extensions[names].first].extenders.push(extensions[names].node);
		});
		
		this.steps = prePlan.map(function(rawStep) {
			return new Plan.Step(rawStep.maps, rawStep.extenders);
		});
	}

	Plan.prototype.execute = function() {
		var temp = this.steps.reduce(function(table, step) {
			return step.proceed(table);
		}, new Table());
		return temp;
	};

	Plan.Step = function(maps, extenders) {
		this.ranges = extenders;
		this.map = maps.reduce(function(pv, cv) {return pv.merge(cv);}, new _GY.Node());
	};

	Plan.Step.prototype.proceed = function(state) {
		var s = new Date().getTime();
		var temp = state.map(this.map);
		this.ranges.forEach(function(extender) {
			temp = temp.times(new Table(extender.supplies, extender.f()(), {cont: extender.mode === 'in'}));
		});
		console.log(new Date().getTime() - s, 'ms to proceed (with ' + 
			this.ranges.length + ' ranges and a ' + 
			this.map.requires.length + ' -> ' + this.map.supplies.length + ' mapping)');
		return temp;
	};
	
	// global
	
	_GY.Plan = Plan;
}(this));