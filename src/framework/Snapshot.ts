
import { print } from '../utils'
import { Query } from '..'
import { QueryOptions } from '../query'
import { getZeroCommandDatabase, getCommandDatabase, CommandDatabase } from '../types/CommandDatabase'
import { getZeroRelationDatabase, getRelationDatabase } from '../types/RelationDatabase'
import CommandImplementation from '../types/CommandImplementation'
import QueryWatcher from './QueryWatcher'
import { mountEveryQueryWatcher } from '../query-watchers'
import { implementEveryCommand } from '../commands'
import { Scope } from '../scope'

const MissingValue = Symbol('missing');

export default class Snapshot {

    typeSnapshot = true

    globalValues: { [name: string]: any } = {}

    commandImplementations: { [name: string]: CommandImplementation } = {}
    queryWatchers: QueryWatcher[] = []

    fileScope: Scope

    constructor() {
        this.fileScope = new Scope()

        // Bootstrap values
        this.globalValues['commandDatabase'] = getZeroCommandDatabase();
        this.globalValues['relationDatabase'] = getZeroRelationDatabase();

        mountEveryQueryWatcher(this);
        implementEveryCommand(this);
    }

    modifyGlobal(name: string, modifier: (val: any) => any) {
        const result = modifier(this.globalValues[name]);
        this.globalValues[name] = result;
    }

    isRelation(s: string) {
        const relations = this.getValue('relations');
        return !!relations[s];
    }

    isCommand(s: string) {
        const db: CommandDatabase = getCommandDatabase(this);
        return !!db.byName[s];
    }

    getLastIncompleteClause() {
        return this.getValueOpt('lastIncompleteClause', null);
    }

    getValueOpt(name: string, defaultValue: any) {
        const found = this.fileScope.getOptional(name, MissingValue);

        if (found !== MissingValue)
            return found;

        if (this.globalValues[name])
            return this.globalValues[name];

        return defaultValue;
    }

    getValue(name: string) {
        const get = this.getValueOpt(name, MissingValue);

        if (get === MissingValue)
            throw new Error('value not found for: ' + name);

        return get;
    }

    implementCommand(name, impl: CommandImplementation) {
        this.commandImplementations[name] = impl;
    }

    implement(name, impl: CommandImplementation) {
        this.commandImplementations[name] = impl;
    }

    mountQueryWatcher(name, watcher: QueryWatcher) {
        this.queryWatchers.push(watcher);
    }
}
