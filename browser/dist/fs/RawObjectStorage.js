"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Relation_1 = __importStar(require("./Relation"));
const stringifyQuery_1 = require("./stringifyQuery");
class RawObjectStorage {
    constructor(pattern) {
        this.value = {};
        this.linkedPattern = pattern;
        if (pattern.starValueTags.length !== 1) {
            throw new Error("RawObjectStorage expected to link with a single star value pattern, saw: "
                + stringifyQuery_1.commandTagsToString(pattern.tags));
        }
        this.variedType = pattern.starValueTags[0].tagType;
    }
    *findAllMatches(pattern) {
        const variedTag = pattern.getOneTagForType(this.variedType);
        const otherTags = pattern.tags.filter(tag => tag.tagType !== variedTag.tagType);
        if (variedTag.starValue) {
            for (const key in this.value) {
                yield Relation_1.commandTagsToRelation(otherTags.concat({
                    tagType: variedTag.tagType,
                    tagValue: key
                }), this.value[key]);
            }
        }
        else {
            const key = variedTag.tagValue;
            if (this.value[key] !== undefined) {
                yield Relation_1.commandTagsToRelation(otherTags.concat({
                    tagType: variedTag.tagType,
                    tagValue: key
                }), this.value[key]);
            }
        }
    }
    runSearch(get) {
        for (const rel of this.findAllMatches(get.pattern)) {
            get.foundRelation(rel);
            if (get.done)
                break;
        }
        get.finishSearch();
    }
    runSave(set) {
        set.saveFinished(new Relation_1.default('', [], ''));
    }
}
exports.default = RawObjectStorage;
