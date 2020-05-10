"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PatternTag_1 = require("../../PatternTag");
const parseCommand_1 = require("../../parseCommand");
const stringifyQuery_1 = require("../../stringifyQuery");
exports.ReparseCommand = {
    name: 'reparseCommand',
    shortDescription: 'reparse command',
    modifyRunCommand(s) {
        const chain = parseCommand_1.parseCommandChain(s);
        s = stringifyQuery_1.stringifyCommandChain(chain);
        return s;
    }
};
function withParsed(commandStr, callback) {
    const parsed = parseCommand_1.parseCommandChain(commandStr);
    const result = callback(parsed) || parsed;
    return stringifyQuery_1.stringifyCommandChain(result);
}
function modifyCommand(chain, i, callback) {
    const modified = callback(chain.commands[i]);
    if (modified)
        chain.commands[i] = modified;
}
exports.InsertExtraTag = {
    name: 'insertExtraTag',
    shortDescription: 'insert extra tag',
    modifyRunCommand(s) {
        return withParsed(s, chain => {
            for (const command of chain.commands) {
                const pattern = command.toPattern();
                if (pattern.hasType('typeinfo') || pattern.hasType('filesystem-mount'))
                    return;
                command.pattern = command.pattern.addTagObj(PatternTag_1.newTag('extra'));
            }
        });
    }
};
exports.GetInheritedBranch = {
    name: 'getInheritedBranch',
    shortDescription: 'get inherited branch',
    setupNewGraph(graph) {
        graph.run('set typeinfo/chaosbranch .inherits');
    },
    modifyRunCommand(s) {
        return withParsed(s, chain => {
            for (const command of chain.commands) {
                if (command.commandName === 'get')
                    command.pattern = command.pattern.addTagObj(PatternTag_1.newTag('chaosbranch', '123'));
            }
        });
    }
};
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}
exports.ScrambleTagOrder = {
    name: 'scrambleTagOrder',
    shortDescription: 'scramble tag order',
    modifyRunCommand(command) {
        return withParsed(command, chain => {
            for (const command of chain.commands)
                command.pattern = command.pattern.modifyTagsList(tags => shuffle(tags));
        });
    }
};
function activeChaosModes() {
    if (process.env.MIN_CHAOS)
        return [];
    return [
        exports.ReparseCommand,
        exports.InsertExtraTag,
        exports.GetInheritedBranch,
        exports.ScrambleTagOrder
    ];
}
exports.activeChaosModes = activeChaosModes;
//# sourceMappingURL=ChaosModes.js.map