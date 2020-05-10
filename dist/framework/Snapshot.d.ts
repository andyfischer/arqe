import CommandImplementation from '../types/CommandImplementation';
import QueryWatcher from './QueryWatcher';
import { Scope } from '../scope';
export default class Snapshot {
    typeSnapshot: boolean;
    commandImplementations: {
        [name: string]: CommandImplementation;
    };
    queryWatchers: QueryWatcher[];
    globalScope: Scope;
    fileScope: Scope;
    constructor();
    modifyGlobal(name: string, modifier: (val: any) => any): void;
    isRelation(s: string): boolean;
    isCommand(s: string): boolean;
    getLastIncompleteClause(): any;
    getValueOpt(name: string, defaultValue: any): any;
    getValue(name: string): any;
    implementCommand(name: any, impl: CommandImplementation): void;
    implement(name: any, impl: CommandImplementation): void;
    mountQueryWatcher(name: any, watcher: QueryWatcher): void;
}
