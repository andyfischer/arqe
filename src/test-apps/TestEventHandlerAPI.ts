import { GraphLike, Tuple, receiveToTupleListPromise } from ".."

export default class API {
    graph: GraphLike

    constructor(graph: GraphLike) {
        if (typeof graph.run !== 'function') {
            throw new Error('(code-generation/testEventHandler constructor) expected Graph or GraphLike: ' + graph);
        }

        this.graph = graph;
    }

    eventListener(handler: (evt) => void) {

        // eventType/testEvent1
        this.graph.run("listen test-event-handler val/*", {
            relation(rel: Tuple) {
                if (rel.hasAttr('command-meta'))
                    return;
                handler({
    id: 'valueChanged',
    val: rel.getVal("val"),
});
            },
            finish() { }
        });

        // eventType/testEvent2
        this.graph.run("listen test-event-handler obj/*", {
            relation(rel: Tuple) {
                if (rel.hasAttr('command-meta'))
                    return;
                handler({
    id: 'objectChanged',
    obj: rel.getTagAsString("obj"),
});
            },
            finish() { }
        });

        // eventType/testDeletionEvent
        this.graph.run("listen test-event-handler obj/*", {
            relation(rel: Tuple) {
                if (rel.hasAttr('command-meta') && rel.hasAttr('deleted')) {
                    handler({
    id: 'objectDeleted',
    obj: rel.getTagAsString("obj"),
});
                }
            },
            finish() { }
        });
    }

    pushObject(obj: string) {
        const command = `set test-event-handler ${obj}`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        // no output?
    }

    deleteObject(obj: string) {
        const command = `delete test-event-handler ${obj}`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        // no output?
    }

    pushValueChange(val: string) {
        const command = `set test-event-handler val/(set ${val})`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        // no output?
    }

    pushInitialValue(val: string) {
        const command = `set test-event-handler val/${val}`;

        const rels: Tuple[] = this.graph.runSync(command)
            .filter(rel => !rel.hasAttr("command-meta"));

        // no output?
    }
}