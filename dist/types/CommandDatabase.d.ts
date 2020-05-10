import { Query } from '..';
import { Snapshot, CommandImplementation } from '../framework';
interface Arg {
    isMain?: boolean;
    isRequired?: boolean;
}
export interface CommandDefinition {
    name: string;
    mainArgs: string[];
    args: {
        [key: string]: Arg;
    };
    takesAnyArgs?: boolean;
    hasNoImplementation?: boolean;
    run?: CommandImplementation;
    fromLazyModule?: string;
    notForHumans?: boolean;
}
export interface CommandDatabase {
    byName: {
        [name: string]: CommandDefinition;
    };
}
export declare function getZeroCommandDatabase(): CommandDatabase;
export declare function getCommandDatabase(key: Snapshot | Query): CommandDatabase;
export {};
