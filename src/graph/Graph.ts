
class Edge {
    id: string
    a: Node
    b: Node
}

class Node {
    edges: { [otherId: string]: Edge } = {}
}

export default class Graph {
    nodes: { [id: string]: Node } = {}
    nextId = 1

    createNode(): string {
        const id = ''+this.nextId;
        this.nextId += 1;
        this.nodes[id] = new Node()
        return id;
    }

    createEdge(a: string, b: string) {
        if (a === b)
            throw new Error("can't connect a node to itself");

        const aNode = this.nodes[a];
        const bNode = this.nodes[b];

        if (!aNode)
            throw new Error("node ID not found: " + a);
        
        if (!bNode)
            throw new Error("node ID not found: " + b);

        if (aNode.edges[b])
            return aNode.edges[b].id;

        const id = ''+this.nextId;
        const edge = new Edge()
        edge.id = id;
        edge.a = aNode;
        edge.b = bNode;

        return id;
    }
}
