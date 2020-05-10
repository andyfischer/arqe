import Relation from './Relation';
import GraphListener from './GraphListenerV3';
import Graph from './Graph';
export default class ExpireAtListener implements GraphListener {
    graph: Graph;
    constructor(graph: Graph);
    onRelationUpdated(rel: Relation): void;
    onRelationDeleted(rel: Relation): void;
}
