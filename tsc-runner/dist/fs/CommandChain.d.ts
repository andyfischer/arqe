import Command from './Command';
export default class CommandChain {
    commands: Command[];
    stringify(): string;
}
