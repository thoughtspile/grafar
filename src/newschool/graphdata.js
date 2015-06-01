(function(global) {
	var grafar = global.grafar;
	var isExisty = grafar.isExisty;
    var add = grafar.add;
    var remove = grafar.remove;
	
	
	function GraphNode() {
		this.children = [];
		this.parents = [];
    }
    
    GraphNode.isGraphNode = function(obj) {
        return Array.isArray(obj.children) &&
            Array.isArray(obj.parents);// &&
            //obj.addChild === graphNode.addChild &&
            //obj.dropChild === graphNode.dropChild;
    };
	
	GraphNode.edge = function(from, to) {
		if (GraphNode.isGraphNode(from))
            add(from.children, to);
        if (GraphNode.isGraphNode(to))
            add(to.parents, from);
	};
	
	GraphNode.removeEdge = function(from, to) {
        if (GraphNode.isGraphNode(from))
            remove(from.children, to);
        if (GraphNode.isGraphNode(to))
            remove(to.parents, from);
	};
    
    GraphNode.sources = function(nodes) {
        if (!Array.isArray(nodes))
            nodes = [nodes];
        var res = [];
        return res;
    };
	
    
	grafar.GraphNode = GraphNode;
}(this));