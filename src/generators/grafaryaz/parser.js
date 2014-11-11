'use strict';

(function(global) {
	var _G = global.grafar,
		parserConfig = _G.config.grafaryaz,
		stats = _G.stats,
		
		seq = _G.seq,
		traceZeroSet = _G.traceZeroSet,
		
		haveCommon = _G.haveCommon,
		isExisty = _G.isExisty,
		firstMatch = _G.firstMatch,
		union = _G.union,
		unique = _G.unique,
		setMinus = _G.setMinus,
		
		Plan = _G.Plan;

	stats.add('parse').add('merge').add('plan');
	// locals
	
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
			postVar: '(?=$|[\\)+\\-*\\/\\^\\,])',
			postFunc: '(?=\\()'
		};
	regexTemplates.literal = '(?:' + regexTemplates.number + '|' + regexTemplates.id + ')';
	var	parserRegex = {
			range: new RegExp('^\\[' + regexTemplates.number + '\\,' + regexTemplates.number + '\\]$'),
			set: new RegExp('^\\{(?:' + regexTemplates.number + ',)*' + regexTemplates.number + '\\}$'),
			id: new RegExp('^' + regexTemplates.id + '$|^$'), // includes empty string
			variables: new RegExp(regexTemplates.id + regexTemplates.postVar, 'g'),
			functions: new RegExp(regexTemplates.id + regexTemplates.postFunc, 'g'),
			literals: new RegExp(regexTemplates.literal, 'g'),
			signature: new RegExp('^' + regexTemplates.id + '\\((?:' + regexTemplates.id + ',)*' + regexTemplates.id + '\\)$'),
			call: new RegExp('^' + regexTemplates.id + '\\((?:' + regexTemplates.literal + ',)*' + regexTemplates.literal + '\\)$'),
			allCalls: new RegExp(regexTemplates.id + '\\((?:' + regexTemplates.literal + ',)*' + regexTemplates.literal + '\\)', 'g'), // call site this is called
			pds: new RegExp(regexTemplates.id + '\'' + regexTemplates.id, 'g'),
			//brackets: /[\[\]\{\}]/g,
			comparator: /(==|@=|<=|>=)/
		},
		compNames = (function() {
			var temp = {};
			temp['>='] = 'geq';
			temp['<='] = 'leq';
			temp['=='] = 'eq';
			temp['@='] = 'in';
			return temp;
		}());

	function snapNodeState(arr) {
		return arr.map(function(node) {
			return node.clone();
		});
	}
		
	function MathSystem(str, targetRef) {
		stats.enter('parse');
		
		var nodes = MathSystem.strToAtomicNodes(str);
		stats.exit('parse').enter('merge');
		nodes = MathSystem.collapseNodes(nodes);
		stats.exit('merge').enter('plan');
		
		this.plan = new Plan(nodes, targetRef);
		
		stats.exit('plan');
	}

	MathSystem.strToAtomicNodes = function(str) {
		str = str.replace(/ /g, '');
		var temp = str.split('&'),
			nodes = [];
		temp.forEach(function(line) {
			var sides = line.split(parserRegex.comparator);
			if (sides[1] === '@=' && parserRegex.range.test(sides[2]) && parserRegex.id.test(sides[0])) {
				var temp = sides[2].slice(1, sides[2].length - 1).split(',');
				nodes.push(new Node(sides[0], temp[0], 'geq'), new Node(sides[0], temp[1], 'leq'));
			} else {
				nodes.push(new Node(sides[0], sides[2], compNames[sides[1]]));
			}
		});
		return nodes;
	};

	
	MathSystem.collapseNodes = function(nodes) {
		nodes = MathSystem.genericCollapse(nodes);
		nodes = MathSystem.matchRanges(nodes);
		nodes = MathSystem.pullDerivatives(nodes);
		nodes = MathSystem.inlineCalls(nodes);
		
		return nodes;
	};

	MathSystem.genericCollapse = function(nodes) {
		// the chaotic order is no good; it misses possible intermediate substitutions
		// should be:
		//   i-merge (extend supplies)
		//   e-merge (transform supplies)
		//   loop ^^ while e-merge possible
		
		var flag = true;
		while (flag) {
			flag = false;
			var i = 0;
			while (i < nodes.length) {
				var j = 0;
				while (j < nodes.length) {
					if (haveCommon(nodes[i].supplies, nodes[j].supplies) && Node.mergeable(nodes[i], nodes[j])) {
						nodes[i].merge(nodes[j]);
						if (nodes[j].mode !== 'eq')
							nodes.splice(j ,1);
						j = 0;
						flag = true;
					} else {
						j++;
					}
				}
				i++;
			}
		};
		
		return nodes;
	};

	// this should now have unbounded generation
	MathSystem.matchRanges = function(nodes) {
		var bNodes = nodes.filter(function(node) {
				return node.mode === 'geq';
			}),
			tNodes = nodes.filter(function(node) {
				return node.mode === 'leq';
			});
		
		bNodes.forEach(function(bnode) {
			var tnode = firstMatch(tNodes, function(tnode) {
					return bnode.supplies[0] === tnode.supplies[0];
				});
			
			if (isExisty(tnode)) {
				nodes.push(new Node(bnode, tnode));				
				nodes = setMinus(nodes, [bnode, tnode]);
				tNodes = setMinus(tNodes, [tnode]);
			} else {
				bnode.toImplicit();
			}
		});
		tNodes.forEach(function(tnode) {
			tnode.toImplicit();
		});
		
		// add implicitization for unmatched bord
		
		return nodes;
	};
	
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


	// somewhat of a big issue:
	//   x @= [1, y] is not converted to implicit and can't be computed
	// in fact, it's not even parsed

	function Node(/*arguments*/) {
		if (arguments.length === 0) {
			Node.call(this, '', '', 'eq');
		} else if (arguments.length === 1) {
			var cloned = arguments[0];
			if (!cloned instanceof Node)
				throw new Error('node - cloning error');
			this.mode = cloned.mode;
			this.body = cloned.body;
			this.variables = cloned.variables.slice();
			this.requires = cloned.requires.slice();
			this.supplies = cloned.supplies.slice();
			//this.isBorder = cloned.isBorder;
		} else if (arguments.length === 2) {
			var node1 = arguments[0],
				node2 = arguments[1];
			if (!Node.mergeable(node1, node2))
				throw new Error('merge not possible ' + node1 + ' ' + node2);
				
			if (node1.mode === 'eq' && node2.mode === 'eq' && !haveCommon(node1.supplies, node2.supplies)) {
				this.mode = 'eq';
				this.body = node1.body + (node1.supplies.length > 0 && node2.supplies.length > 0? ',': '') + node2.body;
				this.supplies = node1.supplies.concat(node2.supplies);
				this.variables = union(node1.variables, node2.variables);
			} else if (node1.mode === 'eq' && (node2.mode === 'leq' || node2.mode === 'geq' || node2.mode === 'eq')) {
				Node.call(this, node1.clone().toImplicit(), node2.clone().toImplicit());
			} else if ((node1.mode === 'leq' && node2.mode === 'leq') || (node1.mode === 'geq' && node2.mode === 'geq')) {
				this.mode = node1.mode;
				this.body = (node1.mode === 'leq'? 'min': 'max') + '(' + node1.body + ',' +node2.body + ')';
				this.supplies = node1.supplies.slice();
				this.variables = union(node1.variables, node2.variables);
			} else if (node1.mode === 'geq' && node2.mode === 'leq') {
				this.mode = 'in';
				this.body = node1.body + ',' + node2.body;
				this.supplies = node1.supplies.slice();
				this.variables = union(node1.variables, node2.variables);
			} else if (node1.mode === 'implicit' && node2.mode === 'eq') {
				this.mode = 'implicit';
				this.body = node1.body;
				node2.supplies.forEach(function(name) {
					this.body = inlineSubstitute(this.body, name, node2.body);
				}.bind(this));
				this.variables = union(setMinus(node1.variables, node2.supplies), node2.variables);
			} else if (node1.mode === 'implicit' && (node2.mode === 'leq' || node2.mode === 'geq')) {
				Node.call(this, node1, node2.clone().toImplicit());
			} else if (node1.mode === 'implicit' && node2.mode === 'implicit') {
				this.mode = 'implicit';
				this.variables = union(node1.variables, node2.variables);
				this.body = 'max(' + node1.body + ', ' + node2.body + ')';
			}
		} else if (arguments.length === 3) {
			var l = arguments[0],
				r = arguments[1],
				mode = arguments[2];
				
			if (parserRegex.id.test(l)) {
				this.mode = mode;
				this.body = r;
				this.variables = MathSystem.extractVariables(this.body);
				this.supplies = MathSystem.extractVariables(l);
			} else if (parserRegex.signature.test(l)) {
				this.mode = mode;
				var rVariables = MathSystem.extractVariables(r),
					lVariables = MathSystem.extractVariables(l);
				if (setMinus(rVariables, lVariables).length !== 0) // another test needed
					throw new Error('incorrect signature');
				this.variables = lVariables.slice();
				this.body = r;
				this.supplies = MathSystem.extractFunctions(l);
			} else {
				this.mode = 'implicit';
				this.body = Node.implicitize(l, r, mode);
				this.variables = MathSystem.extractVariables(this.body);
			}
		}
		
		this._f = null;
		if (this.mode === 'implicit') {
			this.requires = [];
			this.supplies = this.variables;
		} else if (this.mode === 'eq' || this.mode === 'leq' || this.mode === 'geq' || this.mode === 'in') {
			this.requires = this.variables;
		}
	}

	Node.mergeable = function(node1, node2) {
		if (node1 === node2)
			return false;
		var disjointEq = node1.mode === 'eq' && node2.mode === 'eq' && !haveCommon(node1.supplies, node2.supplies),
			singleCommonArg = node1.supplies.length === 1 && node2.supplies.length === 1 && haveCommon(node1.supplies, node2.supplies),
			multipleDefinition = node1.mode === 'eq' && (node2.mode === 'leq' || node2.mode === 'geq' || node2.mode === 'eq'),
			rangeBoundCollapse = (node1.mode === 'leq' && node2.mode === 'leq') || (node1.mode === 'geq' && node2.mode === 'geq'),
			rangeBounds = node1.mode === 'geq' && node2.mode === 'leq',
			iSubs = node1.mode === 'implicit' && node2.mode === 'eq',
			iBound = node1.mode === 'implicit' && (node2.mode === 'leq' || node2.mode === 'geq'),
			iMerge = node1.mode === 'implicit' && node2.mode === 'implicit';
		return disjointEq || iSubs || iBound || iMerge ||
			(singleCommonArg && (multipleDefinition || rangeBoundCollapse || rangeBounds));
	};

	Node.implicitize = function(l, r, mode) {
		if (mode === 'eq') {
			return '((' + l + ')-(' + r + '))^2'; // or should it be sum-of squares?
		} else if (mode === 'leq') {
			return '(' + l + ')-(' + r + ')';
		} else if (mode === 'geq') {
			return '(' + r + ')-(' + l + ')';
		}
	};

	Node.prototype.toImplicit = function() {
		if (this.type !== 'implicit' && this.supplies.length === 1) {
			this.variables = union(this.requires, this.supplies);
			this.requires = [];
			this.body = Node.implicitize(this.supplies[0], this.body, this.mode);
			this.mode = 'implicit';
		}
		return this;
	};

	Node.prototype.merge = function(otherNode) {
		Node.call(this, this, otherNode);
		return this;
	};

	Node.prototype.clone = function() {
		return new Node(this);
	};

	Node.prototype.diff = function(over) {
		if (this.mode !== 'eq')
			throw new Error('differentiation not possible');
		var diffBody = '((' + inlineSubstitute(this.body, over, '(' + over + '+ .001)') + ')-(' + this.body + '))/(.001)',
			temp = this.clone();
		temp.supplies = [this.supplies[0] + '_' + over];
		temp.body = diffBody;
		return temp;
	};

	Node.prototype.f = function() {
		var body = MathSystem.formatFunction(this.body);
		if (!isExisty(this._f)) {
			if (this.mode === 'eq') {
				this.variables.forEach(function(n, i) {
					body = body.replace(new RegExp('\\b' + n + '\\b', 'g'), 'data[\'' + n + '\'][i]');
				});
				var output = this.supplies.map(function(n) { return 'data[\'' + n + '\'][i]'; }),
					input = [body];
				this._f = new Function('data', 'l', 'for (var i = 0; i < l; i++) {' + output.map(function(o, i) {
					return o + '=' + input[i] + ';'
				}) + '}');
			} else if (this.mode === 'in') {
				var sides = body.split(','),
					min = sides[0],
					max = sides[1];
				this._f = seq(min, max, this.supplies[0]);
			} else if (this.mode === 'implicit') {		
				this.variables.forEach(function(n, i) {
					body = body.replace(new RegExp('\\b' + n + '\\b', 'g'), 'pt[' + i + ']');
				});
				this._f = traceZeroSet(new Function('pt', 'return ' + body), this.variables);
			}
		}
		return this._f;
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
	
	
	// exports
	
	_G.MathSystem = MathSystem;
	_G.Node = Node;
}(this));