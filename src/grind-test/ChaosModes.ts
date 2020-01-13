
import { ChaosMode } from './TestRunner'
import parseCommand, { parsedCommandToString, appendTagInCommand } from '../parseCommand'

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

// Modes to add:
//  - Scramble tag order
//  - Enable specific optimizations
