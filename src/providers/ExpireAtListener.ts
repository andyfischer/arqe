
import Relation from '../Relation'
import RelationReceiver from '../RelationReceiver'
import Pattern from '../Pattern'
import StorageProvider from '../StorageProvider'
import Graph from '../Graph'

export default class ExpireAt implements StorageProvider {
    graph: Graph

    constructor(graph: Graph) {
        this.graph = graph;
    }

    async runSearch(pattern: Pattern, output: RelationReceiver) {
        output.finish();
    }

    async runSave(pattern: Pattern, output: RelationReceiver) {
        const target = pattern.removeType('expires-at');
        const now = Date.now();
        const expireTime = parseInt(pattern.getTagValue('expires-at'));
        const delay = expireTime - now;

        console.log({ now, expireTime, delay });

        setTimeout((() => {
            console.log('Deleting relation because of expires-at: ' + target.stringify());
            this.graph.run('delete ' + target.stringify());
        }), delay);
    }
}
