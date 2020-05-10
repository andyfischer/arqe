"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GetResponseFormatter_1 = __importDefault(require("./GetResponseFormatter"));
const GetResponseFormatterExists_1 = __importDefault(require("./GetResponseFormatterExists"));
const GetResponseFormatterCount_1 = __importDefault(require("./GetResponseFormatterCount"));
const SetResponseFormatter_1 = __importDefault(require("./SetResponseFormatter"));
function collectRelationReceiverOutput(onDone) {
    const list = [];
    return {
        start() { },
        relation(rel) { list.push(rel); },
        isDone() { return false; },
        finish() {
            onDone(list);
        }
    };
}
exports.collectRelationReceiverOutput = collectRelationReceiverOutput;
function receiveToStringRespond(graph, command, respond) {
    if (command.commandName === 'set') {
        return new SetResponseFormatter_1.default(graph, command, respond);
    }
    if (command.commandName === 'delete') {
        return {
            start() { },
            relation() { },
            isDone() { return false; },
            finish() { respond('#done'); }
        };
    }
    if (command.commandName === 'dump') {
        return {
            start() { respond('#start'); },
            relation(rel) { respond(rel.stringifyToCommand()); },
            isDone() { return false; },
            finish() { respond('#done'); }
        };
    }
    if (command.flags.count) {
        return new GetResponseFormatterCount_1.default(respond);
    }
    if (command.flags.exists) {
        return new GetResponseFormatterExists_1.default(respond);
    }
    const formatter = new GetResponseFormatter_1.default();
    const pattern = command.toPattern();
    formatter.extendedResult = command.flags.x || command.commandName === 'listen';
    formatter.listOnly = command.flags.list;
    formatter.asMultiResults = pattern.isMultiMatch();
    formatter.respond = respond;
    formatter.pattern = pattern;
    formatter.schema = graph.schema;
    return formatter;
}
exports.receiveToStringRespond = receiveToStringRespond;
//# sourceMappingURL=RelationReceiver.js.map