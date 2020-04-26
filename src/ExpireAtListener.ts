
import Relation from './Relation'
import GraphListener from './GraphListenerV3'
import Graph from './Graph'

export default class ExpireAtListener implements GraphListener {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }

    onRelationUpdated(rel: Relation) {
        if (rel.hasType('expires-at')) {
            const now = Date.now();
            const expireTime = parseInt(rel.getTagValue('expires-at'));
            const delay = expireTime - now;

            setTimeout((() => {
                console.log('Deleting relation because of expires-at: ' + rel.stringify());
                this.graph.run('delete ' + rel.stringify());
            }), delay);
        }
    }

    onRelationDeleted(rel: Relation) {
    }
}
