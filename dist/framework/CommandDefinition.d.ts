import { Query } from '..';
export declare type CommandImplementation = (query: Query) => void;
export default interface CommandDefinition {
    name: string;
    run: CommandImplementation;
}
