
import { commandArgsToString } from './parseCommand'

export interface CommandArg {
    tagType: string
    tagValue: string
    subtract?: boolean
    star?: boolean
}

export default class Command {
    command: string
    args: CommandArg[]

    toCommandString() {
        return this.command + ' ' + commandArgsToString(this.args);
    }
}
