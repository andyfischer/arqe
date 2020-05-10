"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const Pattern_1 = require("../Pattern");
const PatternTag_1 = require("../PatternTag");
const fs_1 = require("../context/fs");
class PlainFileStorage {
    async runSearch(search) {
        const { pattern } = search;
        const tag = pattern.getOneTagForType(this.filenameType);
        if (tag.starValue) {
            const files = await fs_1.readDir(this.directory);
            for (const filename of files) {
                const tags = pattern.fixedTags.concat([PatternTag_1.newTag(this.filenameType, filename)]);
                const rel = Pattern_1.commandTagsToRelation(tags, null);
                rel.payloadUnavailable = true;
                search.relation(rel);
            }
        }
        else {
            const filename = tag.tagValue;
            const fullFilename = path_1.default.join(this.directory, filename);
            const contents = await fs_1.readFile(fullFilename, 'utf8');
            const rel = Pattern_1.commandTagsToRelation(pattern.fixedTags, contents);
            search.relation(rel);
        }
        search.finish();
    }
    async runSave(relation, output) {
        output.finish();
    }
}
exports.default = PlainFileStorage;
//# sourceMappingURL=PlainFileStorage.js.map