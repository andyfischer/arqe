"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Relation_1 = __importDefault(require("./Relation"));
const stringifyQuery_1 = require("./stringifyQuery");
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
            // Directory listing
            const files = await readDir(this.directory);
            for (const filename of files) {
                const tags = pattern.fixedTags.concat([{
                        tagType: this.filenameType,
                        tagValue: filename
                    }]);
                const ntag = stringifyQuery_1.normalizeExactTag(tags);
                const rel = new Relation_1.default(ntag, tags, null);
                rel.payloadUnavailable = true;
                search.foundRelation(rel);
            }
        }
        else {
            // File contents
            const filename = tag.tagValue;
            const fullFilename = path_1.default.join(this.directory, filename);
            const contents = await readFile(fullFilename, 'utf8');
            const ntag = stringifyQuery_1.normalizeExactTag(pattern.tags);
            const rel = new Relation_1.default(ntag, pattern.fixedTags, contents);
            search.foundRelation(rel);
        }
        search.finishSearch();
    }
    async runSave(set) {
        set.saveFinished(null);
    }
}
exports.default = PlainFileStorage;
