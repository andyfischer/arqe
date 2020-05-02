import { GraphLike, Relation, receiveToRelationListPromise } from ".."

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        this.graph = graph;
    }

    eventListener(handler: (evt) => void) {

        // eventType/testEvent1
        this.graph.run("listen test-event-handler val/*", {
            relation(rel: Relation) {
                if (rel.hasType('command-meta'))
                    return;
                handler({
    id: 'valueChanged',
    val: rel.getTagValue("val"),
});
            },
            finish() { }
        });

        // eventType/testEvent2
        this.graph.run("listen test-event-handler obj/*", {
            relation(rel: Relation) {
                if (rel.hasType('command-meta'))
                    return;
                handler({
    id: 'objectChanged',
    obj: rel.getTag("obj"),
});
            },
            finish() { }
        });

        // eventType/testDeletionEvent
        this.graph.run("listen test-event-handler obj/*", {
            relation(rel: Relation) {
                if (rel.hasType('command-meta') && rel.hasType('deleted')) {
                    handler({
    id: 'objectDeleted',
    obj: rel.getTag("obj"),
});
                }
            },
            finish() { }
        });
    }
}