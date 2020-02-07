
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
        const parsed = parseCommand(command);
        const pattern = parsed.toPattern();

        // Don't mess with certain relations.
        if (pattern.hasType('typeinfo') || pattern.hasType('filesystem-mount'))
            return command;

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

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export const ScrambleTagOrder: ChaosMode = {
    name: 'scrambleTagOrder',
    shortDescription: 'scramble tag order',
    modifyRunCommand(command: string) {
        const parsed = parseCommand(command);
        parsed.tags = shuffle(parsed.tags);
        const modified = parsedCommandToString(parsed);
        // console.log(`scramble: ${command} -> ${modified}`)
        return modified;
    }
}

// Modes to add:
//  - Scramble tag order
//  - Enable specific optimizations
