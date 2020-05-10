"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
class API {
    constructor(graph) {
        this.graph = graph;
    }
    async findFileWatch(filename) {
        const command = `get file-watch filename(${filename}) version`;
        const { receiver, promise } = __1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            return null;
        }
        if (rels.length > 1) {
            throw new Error("(findFileWatch) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTag("file-watch");
    }
    async findFileWatch2(filename) {
        const command = `get file-watch filename(${filename}) version`;
        const { receiver, promise } = __1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            return null;
        }
        if (rels.length > 1) {
            throw new Error("(findFileWatch2) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTag("file-watch");
    }
    listenToFile(watch, callback) {
        const command = `listen -get ${watch} filename version`;
        this.graph.run(command, {
            relation(rel) {
                if (rel.hasType('command-meta'))
                    return;
                callback(rel.getTagValue("version"));
            },
            finish() { }
        });
    }
    async postChange(filename) {
        const command = `set file-watch/* filename(${filename}) version/(increment)`;
        const { receiver, promise } = __1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
    }
    async findWatchesForFilename(filename) {
        const command = `get file-watch/* filename(${filename}) version`;
        const { receiver, promise } = __1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
        return rels.map(rel => rel.getTag("file-watch"));
    }
    async createWatch(filename) {
        const command = `set file-watch/(unique) filename(${filename}) version/0`;
        const { receiver, promise } = __1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
        if (rels.length === 0) {
            throw new Error("(createWatch) No relation found for: " + command);
        }
        if (rels.length > 1) {
            throw new Error("(createWatch) Multiple results found for: " + command);
        }
        const oneRel = rels[0];
        return oneRel.getTag("file-watch");
    }
    async incrementVersion(filename) {
        const command = `set file-watch/* filename(${filename}) version/(increment)`;
        const { receiver, promise } = __1.receiveToRelationListPromise();
        this.graph.run(command, receiver);
        const rels = (await promise)
            .filter(rel => !rel.hasType("command-meta"));
    }
}
exports.default = API;
//# sourceMappingURL=WatchFileApi.js.map