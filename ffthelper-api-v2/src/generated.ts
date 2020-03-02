import Graph from './fs/Graph'
import Relation from './fs/Relation'

export class GraphAPI {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }

    run(...inputs: any[]) {
    }

    getWinner(matchTag) {
        // Run query search
        const queryStr = `get ${matchTag} winner`;
        
        console.log('Running query: ' + queryStr)
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        
        console.log('Got results: [' + rels.map(rel => rel.str()).join(', ') + ']')
        
        // Expect one result
        if (rels.length === 0) {
            throw new Error("No relation found for: " + queryStr)
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + queryStr)
        }
        
        const rel = rels[0];
        return rel.getValue();
    }
}
