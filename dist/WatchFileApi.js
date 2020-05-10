"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
class API {
    constructor(graph) {
        this.graph = graph;
    }
    async findFileWatch(filename) {
        const command = `get file-watch/* filename(${filename})`;
        const { receiver, promise } = _1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            return null;
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getTag("file-watch");
    }
    async createFileWatch(filename) {
        const command = `set file-watch/(unique) filename(${filename}) version/0`;
        const { receiver, promise } = _1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("Multiple results found for: " + command);
        }
        const rel = rels[0];
        return rel.getTag("file-watch");
    }
    listenToFile(watch, callback) {
        const command = `get listen file-watch/${watch} version/*`;
        this.graph.run(command, {
            relation(rel) { callback(rel); },
            finish() { }
        });
    }
}
exports.default = API;
//# sourceMappingURL=WatchFileApi.js.map