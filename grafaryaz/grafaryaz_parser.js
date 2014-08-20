'use strict';

(function(global) {
	// import
	
	var _GY = global.grafaryaz || (global.grafaryaz = {}),
		haveCommon = _GY.haveCommon,
		isExisty = _GY.isExisty,
		firstMatch = _GY.firstMatch,
		intersection = _GY.intersection,
		union = _GY.union,
		unique = _GY.unique,
		setMinus = _GY.setMinus,
		Plan = _GY.Plan;

		
	// locals
	
	var prefixes = {
		sin: 'Math.sin',
		cos: 'Math.cos',
		sqrt: 'Math.sqrt',
		tan: 'Math.tan',
		pow: 'grafaryaz.pow',
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
		parserConfig = {
			samples: 70,
			tol: 0.01,
			samplesPerDOF: 24
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
		var s = new Date().getTime();
		
		var nodes = MathSystem.strToAtomicNodes(str);
		console.log('atomic node soup', snapNodeState(nodes), 'in', new Date().getTime() - s);
		nodes = MathSystem.collapseNodes(nodes);
		console.log('molecular node soup', snapNodeState(nodes), 'in', new Date().getTime() - s);
		
		this.plan = new Plan(nodes, targetRef);
		
		console.log(new Date().getTime() - s, 'ms per parse');
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

	
	MathSystem.prototype.sample = function() {
		return this.plan.execute();
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
				//console.log(l);
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

	Node.prototype.grad = function() {
		return new Node();
	};

	Node.prototype.toString = function() {
		return '(' + this.requires.join(', ') + ') -> (' + this.supplies.join(',') + ') : ' + this.body + ' ' + this.mode;
	};

	Node.prototype.f = function() {
		// we would like to make these functions pass-by-reference, so that they need to accept a single array argument.
		//
		// it is OK with in (since it currently takes no arguments)
		// it is OK with implicit, since the input is generated inside traceZeroSet and is output-ordered
		// the problem arises when using eq-map.
		//   * the actual input is stored in a table object, and its order depends on some random things like the order of applying extensions
		//   * the desired input order depends on the whole other set of random things, like the order in which the statements were listed
		//
		// possible solutions:
		//   * have a set of variables appear in a deterministic order (such as lexicographic or something).
		//   this would lead to complications in both table multiplication and node merging
		//   * transform table order to match the desired eq-map order.
		//   this would involve reordering in times. To match the state after eq-map, two strategies can be used:
		//   reorder the R1 mappings after merge or apply a special table reordering step.
		//   * transform the nodes' input order. This is my current favourite. We simply need to change the order in which the input variables
		//   are listed after the planning step terminates. The drawback: on different Plan runs we might need to re-construct the functions.
		//   Besides, it is not quite clear as to how we can determine the state output order (but should be fairly simple).
		// 
		// And a side note regarding the method used now: we have to implicitly create an arguments object with a necessary ordering.
		// this is both time- and space-consuming activity. Besides, the Array->Array maps have an added benefit of neatness.
		var body = MathSystem.formatFunction(this.body);
		if (this._f === null) {
			if (this.mode === 'eq')
				this._f = new Function(this.variables, 'return [' + body + '];');
			else if (this.mode === 'in')
				this._f = new Function(this.variables, 'return seq(' + body + ',' + parserConfig.samples + ');');
			else if (this.mode === 'implicit') {
				//console.log(this.body, body);				
				this.variables.forEach(function(n, i) {
					body = body.replace(new RegExp('\\b' + n + '\\b', 'g'), 'pt[' + i + ']');
				});
				//console.log(body);
				this._f = new Function(this.variables, 'return traceZeroSet(' + new Function('pt', 'return ' + body) + ', false,' + this.variables.length + ');');
			}
		}
		return this._f;
	};

	function IdNode(name) {
		Node.call(this, name, name, 'eq');
	}

	IdNode.prototype = new Node();


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
	
	_GY.MathSystem = MathSystem;
	_GY.config = parserConfig;
	_GY.Node = Node;
	_GY.IdNode = IdNode;
}(this));