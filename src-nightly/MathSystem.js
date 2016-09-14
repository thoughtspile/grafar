import { grafar as _G } from './api';
import { isExisty } from './utils';
import { firstMatch, haveCommon, union, unique, setMinus } from './setUtils';
import { seq, traceZeroSet } from './generators';
import { config } from './config';

var parserConfig = config.grafaryaz,
	stats = _G.stats,
	Plan = _G.Plan;
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


function MathSystem(str, targetRef) {
	var nodes = MathSystem.strToAtomicNodes(str);
	nodes = MathSystem.collapseNodes(nodes);
	this.plan = new Plan(nodes, targetRef);
}

MathSystem.formatFunction = function(str) {
	str = MathSystem.uncaret(str);
	str = str.replace(parserRegex.functions, function(match) {
		return prefixes.hasOwnProperty(match)? prefixes[match]: match;
	});
	return str;
};

MathSystem.extractVariables = function(str) {
	return (str.match(parserRegex.variables) || []).reduce(unique, []);
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


function ductParse(str, params, section) {
	var fixed = setMinus(Object.keys(params).filter(function(r) {return !Array.isArray(params[r])}), ['x', 'y', 'z']),
		isSection = isExisty(section);
	for (var i = 0; i < fixed.length; i++)
		str = inlineSubstitute(str, fixed[i], params[fixed[i]]);
	str = str.replace(/<[^=]/g, '<=').replace(/>[^=]/g, '>=');
	var constraints = str.split('&');
	for (var i = 0; i < constraints.length; i++) {
		var sides = constraints[i].split(/(<=|>=|==)/g);
		if (sides[1] === '==')
			constraints[i] = 'abs(' + sides[0] + '-(' + sides[2] + '))';
		else if (sides[1] === '>=')
			constraints[i] = sides[2] + '- (' + sides[0] + ')';
		else if (sides[1] === '<=')
			constraints[i] = sides[0] + '- (' + sides[2] + ')';
		constraints[i] = MathSystem.formatFunction(constraints[i]);
	}
	var body = constraints.length > 1? 'Math.max(' + constraints.join(',') + ')': constraints[0],
		vars = union(MathSystem.extractVariables(body), ['x', 'y', 'z']);
	for (var i = 0; i < vars.length; i++)
		body = inlineSubstitute(body, vars[i], 'pt[' + i + ']');
	var coref = new Function('pt', 'return ' + body);
	var f = traceZeroSet(coref, vars);
	return f;
}

// exports

_G.MathSystem = MathSystem;
_G.ductParse = ductParse;
_G.Node = Node;
