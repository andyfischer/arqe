
import Command from './Command'

export default class CommandChain {
    commands: Command[] = []

    str() {
        return this.commands.map(c => c.stringify()).join(' | ');
    }
}
