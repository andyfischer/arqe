
import TupleReceiver from './TupleReceiver'
import { parseCommandChain } from './parseCommand'
import CommandChain from './CommandChain'
import Pattern from './Pattern'
import Tuple from './Tuple'
import { internalError } from './logError'

interface Validation {
}

class SetShouldEmitRelation {
    static maybeCreate(commandStr: string, command: CommandChain) {
        if (command.commands.length > 1)
            return null;

        if (command.commands[0].commandName != 'set')
            return null;

        for (const tag of command.commands[0].toPattern().tags) {
            if (tag.valueExpr)
                return null;
        }

        return new SetShouldEmitRelation(commandStr, command.commands[0].toPattern());
    }

    commandStr: string;
    pattern: Pattern;
    sawRelation: boolean = false;
    commandErrored: boolean = false;

    constructor(commandStr: string, pattern: Pattern) {
        this.commandStr = commandStr;
        this.pattern = pattern;
    }

    next = (rel: Tuple) => {
        if (rel.hasAttr('command-meta')) {
            if (rel.hasAttr('error'))
                this.commandErrored = true;
        }

        this.sawRelation = true;
    }

    finish = () => {
        if (!this.sawRelation && !this.commandErrored) {
            internalError('SetShouldEmitRelation validation failed on: ' + this.commandStr);
        }
    }
}

const validationClasses = [
    SetShouldEmitRelation
]

export default function watchAndValidateCommand(commandStr: string, output: TupleReceiver) {

    const parsed = parseCommandChain(commandStr);

    if (parsed.commands.length == 0)
        throw new Error('no command found, commandStr = ' + commandStr);

    const validations = [];

    for (const clss of validationClasses) {
        const validation = clss.maybeCreate(commandStr, parsed);
        if (validation)
            validations.push(validation);
    }

    let sentFinish = false;
    let finishStackTrace = null;

    return {
        next(rel) {
            for (const v of validations)
                v.next(rel);

            output.next(rel);
        },
        finish() {
            if (sentFinish) {
                console.error('Validation failed, received two finish() calls: ' + commandStr);
                console.error('First finish() call: ' + finishStackTrace.stack);
                console.error('Second finish call: ' + (new Error()).stack);
                internalError('Validation failed, received two finish() calls: ' + commandStr);
                return;
            }

            for (const v of validations)
                v.finish();

            sentFinish = true;
            finishStackTrace = new Error();

            output.finish();
        }
    }
}
