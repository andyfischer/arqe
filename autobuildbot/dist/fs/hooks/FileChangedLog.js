"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notifyFileChanged_1 = require("../file-watch/notifyFileChanged");
class FileChangedLog {
    constructor(graph) {
        this.graph = graph;
    }
    hookSearch(search) {
        return false;
    }
    hookSave(save) {
        const { relation } = save;
        if (relation.hasType('log') && relation.hasType('file-changed')) {
            notifyFileChanged_1.notifyFileChanged(this.graph, relation.getTagValue('filename'));
            save.output.relation(relation);
            save.output.finish();
            return true;
        }
        return false;
    }
}
exports.default = FileChangedLog;
//# sourceMappingURL=FileChangedLog.js.map