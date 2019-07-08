
import { print } from '../utils'
import { Query } from '..'
import { QueryOptions } from '../query'
import { getZeroCommandDatabase, getCommandDatabase, CommandDatabase } from '../types/CommandDatabase'
import { getZeroRelationDatabase, getRelationDatabase } from '../types/RelationDatabase'
import CommandImplementation from '../types/CommandImplementation'
import QueryWatcher from './QueryWatcher'
import { mountEveryQueryWatcher } from '../query-watchers'
import { implementEveryCommand } from '../commands'
import { Scope, Graph } from '../scope'
import setupBuiltinSlots from '../scope/setupBuiltinSlots'

const MissingValue = Symbol('missing');

export default class Snapshot {

    typeSnapshot = true

    commandImplementations: { [name: string]: CommandImplementation } = {}
    queryWatchers: QueryWatcher[] = []

    globalScope: Scope
    fileScope: Scope

    constructor() {
        const graph = new Graph()
        this.globalScope = new Scope(graph)
        this.fileScope = new Scope(graph)

        setupBuiltinSlots(this.globalScope);

        // Bootstrap values
        this.globalScope.set('commandDatabase', getZeroCommandDatabase());
        this.globalScope.set('relationDatabase', getZeroRelationDatabase());

        mountEveryQueryWatcher(this);
        implementEveryCommand(this);
    }

    modifyGlobal(name: string, modifier: (val: any) => any) {
        this.globalScope.modify(name, modifier);
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
        let found = this.fileScope.getOptional(name, MissingValue);

        if (found !== MissingValue)
            return found;

        found = this.globalScope.getOptional(name, MissingValue);
        if (found !== MissingValue)
            return found;

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
