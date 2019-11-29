
import { commandArgsToString } from './parseCommand'

export interface CommandArg {
    tagType: string
    tagValue: string
    subtract?: boolean
    starValue?: boolean
    tagTypeInherits?: boolean
}

export default class Command {
    command: string
    args: CommandArg[]

    toCommandString() {
        return this.command + ' ' + commandArgsToString(this.args);
    }
}
