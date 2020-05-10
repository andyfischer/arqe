"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = __importDefault(require("./parseCommand"));
function createUniqueEntity(graph, typename) {
    const result = graph.runSync(`set ${typename}/#unique`);
    const parsed = parseCommand_1.default(result);
    if (parsed.command !== 'set')
        throw new Error('expected reply with "set": ' + result);
    return parsed.tags[0].tagValue;
}
exports.createUniqueEntity = createUniqueEntity;
