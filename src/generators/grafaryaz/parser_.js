'use strict';

(function(global) {
	var _G = global.grafar,
		parserConfig = _G.config.grafaryaz,
		seq = _G.seq,
		traceZeroSet = _G.traceZeroSet,
		haveCommon = _G.haveCommon,
		isExisty = _G.isExisty,
		firstMatch = _G.firstMatch,
		union = _G.union,
		unique = _G.unique,
		setMinus = _G.setMinus;
	
	var prefixes = {
		sin: 'Math.sin',
		cos: 'Math.cos',
		sqrt: 'Math.sqrt',
		tan: 'Math.tan',
		pow: 'grafar.pow',
		min: 'Math.min',
		max: 'Math.max',
		exp: 'Math.exp',
		abs: 'Math.abs',
		log: 'Math.log'
	},
		regexTemplates = {
			number: '[+-]?[0-9]*\\.?[0-9]+',
			integer: '[+-]?[0-9]*',
			id: '[A-Za-z_]+[A-Za-z0-9_]*',
			postVar: '(?=$|[\\+\\s-*/^,)])',
			postFunc: '(?=\\()'
		};
	regexTemplates.literal = '(?:' + regexTemplates.number + '|' + regexTemplates.id + ')';
	var	parserRegex = {
			range: new RegExp('^\\[' + regexTemplates.number + '\\,' + regexTemplates.number + '\\]$'),
			set: new RegExp('^\\{(?:' + regexTemplates.number + ',)*' + regexTemplates.number + '\\}$'),
			id: new RegExp('^' + regexTemplates.id + '$|^$'), // includes empty string
			number: new RegExp('^' + regexTemplates.number + '$|^$'), // includes empty string
			variables: new RegExp(regexTemplates.id + regexTemplates.postVar, 'g'),
			functions: new RegExp(regexTemplates.id + regexTemplates.postFunc, 'g'),
			literals: new RegExp(regexTemplates.literal, 'g'),
			signature: new RegExp('^' + regexTemplates.id + '\\((?:' + regexTemplates.id + ',)*' + regexTemplates.id + '\\)$'),
			call: new RegExp('^' + regexTemplates.id + '\\((?:' + regexTemplates.literal + ',)*' + regexTemplates.literal + '\\)$'),
			allCalls: new RegExp(regexTemplates.id + '\\((?:' + regexTemplates.literal + ',)*' + regexTemplates.literal + '\\)', 'g'), // call site this is called
			pds: new RegExp(regexTemplates.id + '\'' + regexTemplates.id, 'g'),
			//brackets: /[\[\]\{\}]/g,
			comparator: /(==|@=|<=|>=)/
		};

		
	var MathSystem = {};
	// these two are just plain ugly
	MathSystem.pullDerivatives = function(nodes) {
		var newNodes = [];
		nodes.forEach(function(node) {
			node = node.clone();
			union(MathSystem.extractFunctions(node.body), MathSystem.extractVariables(node.body)).forEach(function(funcID) {
				if (funcID.match(/delta_[A-Za-z0-9]+_[A-Za-z0-9_]+/g)) {
					var temp = funcID.split('_'),
						fName = temp[1],
						over = temp.slice(2),
						def = nodes.filter(function(node) {
							return node.supplies[0] === fName;
						})[0];
					over.forEach(function(varName) {
						def = def.diff(varName);
					});
					def.supplies[0] = 'delta_' + def.supplies[0];
					newNodes.push(def);
				}
			});
			newNodes.push(node);
		});
		return newNodes;
	};

	MathSystem.inlineCalls = function(nodes) {
		var newNodes = [];
		nodes.forEach(function(node) {
			node = node.clone();
			MathSystem.extractCalls(node.body).forEach(function(call) {
				var fname = MathSystem.extractFunctions(call)[0];
				if (!prefixes.hasOwnProperty(fname)) {
					var def = nodes.filter(function(node) {
							return node.supplies[0] === fname;
						})[0],
						subs = MathSystem.extractLiterals(call), // includes the funciton id
						newDef = def.body,
						versionName = subs.join('_');
					def.variables.forEach(function(vname, i) {
						newDef = inlineSubstitute(newDef, vname, subs[i + 1]);
					});
					newNodes.push(new Node(versionName, newDef, 'eq'));
					node = new Node(node.supplies[0], node.body.replace(call, versionName), 'eq');
				}
			});
			newNodes.push(node);
		});
		return newNodes;
	};

	MathSystem.extractCalls = function(str) {
		return (str.match(parserRegex.allCalls) || []).reduce(unique, []);
	};

	MathSystem.extractVariables = function(str) {
		return (str.match(parserRegex.variables) || []).reduce(unique, []);
	};

	MathSystem.extractLiterals = function(str) {
		return (str.match(parserRegex.literals) || []).reduce(unique, []);
	};

	MathSystem.extractFunctions = function(str) {
		return (str.match(parserRegex.functions) || []).reduce(unique, []);
	};

	MathSystem.formatFunction = function(str) {
		str = MathSystem.uncaret(str);
		str = str.replace(parserRegex.functions, function(match) {
			return prefixes.hasOwnProperty(match)? prefixes[match]: match;
		});	
		return str;		
	};

	function inlineSubstitute(body, name, sub) {
		return body.replace(new RegExp('\\b' + name + '\\b', 'g'), '(' + sub + ')');
	}

	MathSystem.uncaret = function(str) {
		while (str.indexOf('^') !== -1) {
			var powI = str.indexOf('^'),
				i = powI - 1,
				nest = 0;
			if (str[i] === ')') {
				nest = 0;
				do {
					if (str[i] === ')')
						nest++;
					else if (str[i] === '(')
						nest--;
					i--;
				} while (nest !== 0);
			}
			while (i >= 0 && /[a-zA-Z0-9_.]/.test(str[i]))
				i--;
			var baseI = i + 1;
			
			i = powI + 1;
			while (i <= str.length - 1 && /[a-zA-Z0-9_.]/.test(str[i]))
				i++;
				
			if (str[i] === '(') {
				nest = 0;
				do {
					if (str[i] === '(')
						nest++;
					else if (str[i] === ')')
						nest--;
					i++;
				} while (nest !== 0);
			}
			var expI = i;

			var prefix = str.substring(0, baseI),
				base = str.substring(baseI, powI),
				exponent = str.substring(powI + 1, expI),
				suffix = str.substring(expI, str.length);
			str = prefix + 'pow(' + base + ',' + exponent + ')' + suffix;
		}
		return str;
	};
	

	function ductParse(str, params) {
		var target = ['x', 'y', 'z'],
			fixed = {},
			targetConstraints = [];
		//var c = str.split('&').map(function());
		//var fixed = setMinus(Object.keys(params).filter(function(r) {return !Array.isArray(params[r])}), ['x', 'y', 'z']);
		//for (var i = 0; i < fixed.length; i++)
		//	str = inlineSubstitute(str, fixed[i], params[fixed[i]]);
		str = str.replace(/<[^=]/g, '<=').replace(/>[^=]/g, '>=');
		var constraints = str.split('&');
		for (var i = 0; i < constraints.length; i++) {
			var sides = constraints[i].split(/\s*(<=|>=|==)\s*/g);
			if (parserRegex.id.test(sides[0]) && target.indexOf(sides[0]) === -1 && parserRegex.number.test(sides[2])) {
				fixed[sides[0]] = sides[2];
			} else {
				if (sides[1] === '==')
					constraints[i] = 'abs(' + sides[0] + '-(' + sides[2] + '))';
				else if (sides[1] === '>=')
					constraints[i] = sides[2] + '-' + sides[0];
				else if (sides[1] === '<=')
					constraints[i] = sides[0] + '-' + sides[2];
				targetConstraints.push(MathSystem.formatFunction(constraints[i]));
			}
		}
		var fixedList = Object.keys(fixed);
		//console.log(fixedList, targetConstraints);
		targetConstraints = targetConstraints.map(function(str) {
			for (var i = 0; i < fixedList.length; i++)
				str = inlineSubstitute(str, fixedList[i], fixed[fixedList[i]]);
			return str;
		})
		var body = targetConstraints.length > 1? 'Math.max(' + targetConstraints.join(',') + ')': targetConstraints[0],
			vars = union(MathSystem.extractVariables(body), ['x', 'y', 'z']);
		//console.log(body);
		for (var i = 0; i < vars.length; i++)
			body = inlineSubstitute(body, vars[i], 'pt[' + i + ']');
		var coref = new Function('pt', 'return ' + body);
		var f = traceZeroSet(coref, vars);
		return f;
	}
	
	var loopBody = 'for (var $i = 0; $i < l; $i++)\n';
	
	function ductGenerator(str, name) {
		var body = MathSystem.formatFunction(str),
			vars = MathSystem.extractVariables(str);
		for (var i = 0; i < vars.length; i++)
			body = inlineSubstitute(body, vars[i], 'data.' + vars[i] + '[$i]');
		return new Function('data', 'l', 'extras', loopBody +  'data.' + name + '[$i] = ' + body + ';');
	}
	
	function ductConstraint(str, opts) {
		opts = opts || {};
		var sides = str.split(/(==|@=)/g);
		if (sides[1] === '==' && parserRegex.variables.test(sides[0])) {
			var using = MathSystem.extractVariables(sides[2]);
			return {
				what: sides[0],
				using: using,
				maxlen: using? opts.maxlen || 200: null,
				as: ductGenerator(sides[2], sides[0])
			};
		}
		throw new Error('imparsible!');
	}
	
	// exports
	
	_G.MathSystem = MathSystem;
	_G.ductGenerator = ductGenerator;
	_G.ductConstraint = ductConstraint;
	_G.ductParse = ductParse;
	_G.Node = Node;
}(this));