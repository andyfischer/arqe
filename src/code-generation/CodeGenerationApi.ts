import { GraphLike, Relation, receiveToRelationListPromise } from '..'

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }
    
    listCodeGenerationTargets(): string[] {
        const command = `get code-generation/*`;
        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => rel.getTag("code-generation"));
    }
    
    codeGenerationTargetStrategy(target: string): string {
        const command = `get ${target} strategy/*`;
        const rels: Relation[] = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
        
        // Expect one result
        if (rels.length === 0) {
            throw new Error("No relation found for: " + command)
        }
        
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command)
        }
        
        const rel = rels[0];
        return rel.getTagValue("strategy");
    }
}
