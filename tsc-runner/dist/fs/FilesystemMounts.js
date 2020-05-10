"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = require("./parseCommand");
const PlainFileStorage_1 = __importDefault(require("./PlainFileStorage"));
const RelationPattern_1 = require("./RelationPattern");
class FilesystemMounts {
    constructor(graph) {
        this.graph = graph;
        graph.run("listen filesystem-mount/*", resp => this.onChange());
        graph.run("listen filesystem-mount/* option/*", resp => this.onChange());
    }
    *iterateMounts() {
        for (const id in this.mounts)
            yield this.mounts[id];
    }
    regenerateMounts() {
        const mounts = {};
        const mountKeys = this.graph.runSync("get filesystem-mount/*");
        for (const mountKey of mountKeys) {
            if (!mountKey.startsWith("filesystem-mount"))
                throw new Error("internal error, expected filesystem-mount: " + mountKey);
            const options = {};
            for (const res of this.graph.runSync(`get ${mountKey} option/*`)) {
                const rel = parseCommand_1.parseRelation(res);
                options[rel.getTagValue("option")] = rel.getPayload();
            }
            options.filenameType = options.filenameType || 'filename';
            if (!options.directory)
                continue;
            const storage = new PlainFileStorage_1.default();
            storage.filenameType = options.filenameType;
            storage.directory = options.directory;
            const mount = {
                pattern: RelationPattern_1.commandToRelationPattern(`get ${mountKey} filename/*`),
                storage
            };
            mounts[mountKey] = mount;
        }
        return mounts;
    }
    onChange() {
        this.mounts = this.regenerateMounts();
    }
}
exports.default = FilesystemMounts;
//# sourceMappingURL=FilesystemMounts.js.map