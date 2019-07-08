
import Command from './Command'

export default class CommandChain {
    commands: Command[];

    constructor(commands: Command[] = []) {
        this.commands = commands;
    }

    stringify() {
        return this.commands.map(c => c.stringify()).join(' | ');
    }
}
