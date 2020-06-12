
import Graph from '../../Graph'
import Command from '../../Command'
import CommandChain from '../../CommandChain'
import { newTag } from '../../PatternTag'
import { parseCommandChain } from '../../parseCommand'
import { stringifyCommandChain, appendTagInCommand } from '../../stringifyQuery'

export interface ChaosMode {
    name: string
    shortDescription: string
    setupNewGraph?: (graph: Graph) => void
    modifyRunCommand?: (command: string) => string
}

export const ReparseCommand: ChaosMode = {
    name: 'reparseCommand',
    shortDescription: 'reparse command',
    modifyRunCommand(s: string) {
        const chain = parseCommandChain(s);
        s = stringifyCommandChain(chain);
        return s;
    }
}

function withParsed(commandStr: string, callback: (chain: CommandChain) => CommandChain | void): string {
    const parsed: CommandChain = parseCommandChain(commandStr);
    const result: CommandChain = callback(parsed) || parsed;
    return stringifyCommandChain(result);
}

function modifyCommand(chain: CommandChain, i: number, callback: (command: Command) => Command) {
    const modified = callback(chain.commands[i]);

    if (modified)
        chain.commands[i] = modified;
}

export const InsertExtraTag: ChaosMode = {
    name: 'insertExtraTag',
    shortDescription: 'insert extra tag',
    modifyRunCommand(s: string) {

        return withParsed(s, chain => {

            for (const command of chain.commands) {
                // Don't mess with certain relations.
                const pattern = command.toPattern();

                if (pattern.hasAttr('typeinfo') || pattern.hasAttr('filesystem-mount'))
                    return;

                command.pattern = command.pattern.addTagObj(newTag('extra'));
            }
        });
    }
}

export const GetInheritedBranch: ChaosMode = {
    name: 'getInheritedBranch',
    shortDescription: 'get inherited branch',
    setupNewGraph(graph: Graph) {
        graph.run('set typeinfo/chaosbranch .inherits')
    },
    modifyRunCommand(s: string) {
        return withParsed(s, chain => {
            for (const command of chain.commands) {
                if (command.commandName === 'get')
                    command.pattern = command.pattern.addTagObj(newTag('chaosbranch', '123'));
            }
        })
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
        return withParsed(command, chain => {
            for (const command of chain.commands)
                command.pattern = command.pattern.modifyTagsList(tags => shuffle(tags));
        });
    }
}

// Modes to add:
//  - Enable specific optimizations

export function activeChaosModes() {
    if (process.env.MIN_CHAOS)
        return []

    return [
        ReparseCommand,
        InsertExtraTag,
        GetInheritedBranch,
        ScrambleTagOrder
    ]

}
