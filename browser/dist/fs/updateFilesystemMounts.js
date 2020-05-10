"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PlainFileStorage_1 = __importDefault(require("./PlainFileStorage"));
const RelationPattern_1 = require("./RelationPattern");
function updateFilesystemMounts(cxt) {
    const result = [];
    for (const mount of cxt.getRelations('filesystem-mount/*')) {
        const mountKey = mount.getTag("filesystem-mount");
        const options = cxt.getOptionsObject(mountKey);
        if (!options.directory)
            continue;
        options.filenameType = options.filenameType || 'filename';
        const storage = new PlainFileStorage_1.default();
        storage.filenameType = options.filenameType;
        storage.directory = options.directory;
        result.push({
            pattern: RelationPattern_1.commandToRelationPattern(`get ${mountKey} filename/*`),
            storage
        });
    }
    return result;
}
exports.default = updateFilesystemMounts;
