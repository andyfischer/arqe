
import Command from './Command'

export default class CommandChain {
    commands: Command[] = []

    stringify() {
        return this.commands.map(c => c.stringify()).join(' | ');
    }
}
