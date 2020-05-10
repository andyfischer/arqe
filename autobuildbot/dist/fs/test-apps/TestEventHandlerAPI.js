"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class API {
    constructor(graph) {
        this.graph = graph;
    }
    eventListener(handler) {
        this.graph.run("listen test-event-handler val/*", {
            relation(rel) {
                if (rel.hasType('command-meta'))
                    return;
                handler({
                    id: 'valueChanged',
                    val: rel.getTagValue("val"),
                });
            },
            finish() { }
        });
        this.graph.run("listen test-event-handler obj/*", {
            relation(rel) {
                if (rel.hasType('command-meta'))
                    return;
                handler({
                    id: 'objectChanged',
                    obj: rel.getTag("obj"),
                });
            },
            finish() { }
        });
        this.graph.run("listen test-event-handler obj/*", {
            relation(rel) {
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
    pushObject(obj) {
        const command = `set test-event-handler ${obj}`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
    }
    deleteObject(obj) {
        const command = `delete test-event-handler ${obj}`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
    }
    pushValueChange(val) {
        const command = `set test-event-handler val/(set ${val})`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
    }
    pushInitialValue(val) {
        const command = `set test-event-handler val/${val}`;
        const rels = this.graph.runSync(command)
            .filter(rel => !rel.hasType("command-meta"));
    }
}
exports.default = API;
//# sourceMappingURL=TestEventHandlerAPI.js.map