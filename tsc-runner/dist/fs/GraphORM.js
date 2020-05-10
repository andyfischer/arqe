"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = __importStar(require("./parseCommand"));
function createUniqueEntity(graph, typename) {
    const result = graph.runSync(`set ${typename}/#unique`);
    const parsed = parseCommand_1.default(result);
    if (parsed.commandName !== 'set')
        throw new Error('expected reply with "set": ' + result);
    return parsed.tags[0].tagValue;
}
exports.createUniqueEntity = createUniqueEntity;
function isPrimitive(val) {
    return (val !== Object(val));
}
;
async function saveObject(graph, patternStr, object) {
    const parsed = parseCommand_1.parsePattern(patternStr);
    let unique = null;
    for (const tag of parsed.tags)
        if (tag.tagValue === '#unique')
            unique = tag;
    if (!unique)
        throw new Error('expected a #unique tag: ' + patternStr);
    const response = (await graph.runAsync('set ' + patternStr));
    const parsedResponse = parseCommand_1.default(response);
    const resolvedPattern = parsedResponse.toPattern();
    for (const key in object) {
        const val = object[key];
        if (!isPrimitive(val))
            continue;
        await graph.runAsync('set '
            + resolvedPattern.addTag('option/' + key).stringify()
            + ' == ' + object[key]);
    }
    return resolvedPattern;
}
exports.saveObject = saveObject;
//# sourceMappingURL=GraphORM.js.map