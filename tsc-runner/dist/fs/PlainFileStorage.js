"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RelationPattern_1 = require("./RelationPattern");
const util_1 = __importDefault(require("util"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const readFile = util_1.default.promisify(fs_1.default.readFile);
const readDir = util_1.default.promisify(fs_1.default.readdir);
const writeFile = util_1.default.promisify(fs_1.default.writeFile);
class PlainFileStorage {
    async runSearch(search) {
        const { pattern } = search;
        const tag = pattern.getOneTagForType(this.filenameType);
        if (tag.starValue) {
            const files = await readDir(this.directory);
            for (const filename of files) {
                const tags = pattern.fixedTags.concat([{
                        tagType: this.filenameType,
                        tagValue: filename
                    }]);
                const rel = RelationPattern_1.commandTagsToRelation(tags, null);
                rel.payloadUnavailable = true;
                search.relation(rel);
            }
        }
        else {
            const filename = tag.tagValue;
            const fullFilename = path_1.default.join(this.directory, filename);
            const contents = await readFile(fullFilename, 'utf8');
            const rel = RelationPattern_1.commandTagsToRelation(pattern.fixedTags, contents);
            search.relation(rel);
        }
        search.finish();
    }
    async runSave(set) {
        set.saveFinished(null);
    }
}
exports.default = PlainFileStorage;
//# sourceMappingURL=PlainFileStorage.js.map