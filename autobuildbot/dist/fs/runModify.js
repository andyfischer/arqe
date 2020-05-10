"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const runSearch_1 = __importDefault(require("./runSearch"));
const RelationSearch_1 = require("./RelationSearch");
const runDelete_1 = __importDefault(require("./runDelete"));
const runSet_1 = __importDefault(require("./runSet"));
function translateValueWithExpr(value, expr) {
    const func = expr[0];
    if (func === 'increment')
        return (parseInt(value, 10) + 1) + '';
    throw new Error('Unrecognized expression: ' + func);
}
function modifyWithPattern(rel, pattern) {
    for (const tag of rel.tags) {
        const patternTag = pattern.findTagWithType(tag.tagType);
        if (patternTag.valueExpr) {
            const update = tag => tag.setValue(translateValueWithExpr(tag.tagValue, patternTag.valueExpr));
            rel = rel.updateTagOfType(tag.tagType, update);
        }
    }
    return rel;
}
function runModify(graph, pattern, output) {
    const exprTags = pattern.tags.filter(t => !!t.valueExpr);
    if (exprTags.length === 0)
        throw new Error('expected an expression tag value: ' + pattern.stringify());
    let isDone = false;
    function foundRelation(rel) {
        const updated = modifyWithPattern(rel, pattern);
        runDelete_1.default(graph, rel, {
            relation(rel) { },
            finish() {
                if (isDone)
                    console.error('warning: out of order in runModify');
            }
        });
        runSet_1.default(graph, updated, {
            relation(rel) { },
            finish() {
                if (isDone)
                    console.error('warning: out of order in runModify');
            }
        });
    }
    runSearch_1.default(graph, RelationSearch_1.relationSearchFromPattern(pattern, {
        relation: foundRelation,
        finish: () => {
            isDone = true;
            output.finish();
        }
    }));
}
exports.default = runModify;
//# sourceMappingURL=runModify.js.map