
import Graph from '../../Graph'
import { ChaosMode } from './TestRunner'
import parseCommand, { parsedCommandToString, appendTagInCommand } from '../../parseCommand'

export const ReparseCommand: ChaosMode = {
    shortDescription: 'reparse command',
    modifyRunCommand(command: string) {
        const parsed = parseCommand(command);
        command = parsedCommandToString(parsed);
        return command;
    }
}

export const InsertExtraTag: ChaosMode = {
    shortDescription: 'insert extra tag',
    modifyRunCommand(command: string) {
        return appendTagInCommand(command, 'extra');
    }
}

export const GetInheritedBranch: ChaosMode = {
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
