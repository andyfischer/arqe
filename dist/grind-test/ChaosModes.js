"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const parseCommand_1 = __importStar(require("../parseCommand"));
exports.ReparseCommand = {
    shortDescription: 'reparse command',
    modifyRunCommand(command) {
        const parsed = parseCommand_1.default(command);
        command = parseCommand_1.parsedCommandToString(parsed);
        return command;
    }
};
exports.InsertExtraTag = {
    shortDescription: 'insert extra tag',
    modifyRunCommand(command) {
        return parseCommand_1.appendTagInCommand(command, 'extra');
    }
};
exports.GetInheritedBranch = {
    shortDescription: 'get inherited branch',
    setupNewGraph(graph) {
        graph.run('set typeinfo/chaosbranch .inherits');
    },
    modifyRunCommand(command) {
        if (command.startsWith('get ')) {
            command = parseCommand_1.appendTagInCommand(command, 'chaosbranch/123');
        }
        return command;
    }
};
//# sourceMappingURL=ChaosModes.js.map