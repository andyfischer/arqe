import { GraphLike, Relation, receiveToRelationListPromise } from './fs'

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }
    
    listenToFileChanges(callback: (filename: string) => void) {
        const command = `listen file-watch filename/* version`;
        this.graph.run(command, {
            relation(rel: Relation) {
                if (rel.hasType('command-meta'))
                    return;
                callback(rel.getTagValue("filename"));
            },
            finish() {  }
        });
    }
}
