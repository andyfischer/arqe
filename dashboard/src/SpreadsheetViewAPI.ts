import { Graph, Relation } from 'ik'

export default class API {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }
    
    run(command: string) {
        this.graph.run(command);
    }
    
    listColumns(spreadsheet: string): string[] {
        const queryStr = `${spreadsheet} col/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTag("col"));
    }
    
    listRows(spreadsheet: string): string[] {
        const queryStr = `${spreadsheet} row/*`;
        const rels: Relation[] = this.graph.getRelationsSync(queryStr);
        return rels.map(rel => rel.getTag("row"));
    }
}
