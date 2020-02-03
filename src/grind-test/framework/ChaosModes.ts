
import Graph from '../../Graph'
import ChaosMode from './ChaosMode'
import parseCommand from '../../parseCommand'
import { parsedCommandToString, appendTagInCommand } from '../../stringifyQuery'

export const ReparseCommand: ChaosMode = {
    name: 'reparseCommand',
    shortDescription: 'reparse command',
    modifyRunCommand(command: string) {
        const parsed = parseCommand(command);
        command = parsedCommandToString(parsed);
        return command;
    }
}

export const InsertExtraTag: ChaosMode = {
    name: 'insertExtraTag',
    shortDescription: 'insert extra tag',
    modifyRunCommand(command: string) {
        return appendTagInCommand(command, 'extra');
    }
}

export const GetInheritedBranch: ChaosMode = {
    name: 'getInheritedBranch',
    shortDescription: 'get inherited branch',
    setupNewGraph(graph: Graph) {
        graph.run('set typeinfo/chaosbranch .inherits')
    },
    modifyRunCommand(command: string) {
        if (command.startsWith('get ')) {
            command = appendTagInCommand(command, 'chaosbranch/123');
        }
        return command;
    }
}

// Modes to add:
//  - Scramble tag order
//  - Enable specific optimizations
