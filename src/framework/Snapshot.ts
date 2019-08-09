
import { Reducer, everyReducer } from '../framework'
import { print } from '../utils'
import { Query } from '..'
import submitQuery, { QueryOptions } from './submitQuery'
import { getInitialCommandDatabase, getCommandDatabase, CommandDatabase } from '../types/CommandDatabase'
import CommandImplementation from '../types/CommandImplementation'
import '../reducers'

const MissingValue = Symbol('missing');

export default class Snapshot {

    globalValues: { [name: string]: any } = {}
    fileScopedValues: { [name: string]: any } = {}

    liveDocuments: Reducer[] = []
    liveDocumentsByName: { [name: string]: Reducer } = {}

    commandImplementations: { [name: string]: CommandImplementation } = {}

    constructor() {
        // Bootstrap values
        this.globalValues['commandDatabase'] = getInitialCommandDatabase();

        // Builtin documents
        for (const reducerDef of everyReducer)
            this.mountDocument(reducerDef());
    }

    mountDocument(reducer: Reducer) {
        if (!reducer.name)
            throw new Error('missing name');

        if (this.liveDocumentsByName[reducer.name])
            throw new Error('already have a reducer with name: ' + reducer.name);

        this.liveDocuments.push(reducer);
        this.liveDocumentsByName[reducer.name] = reducer;

        return reducer;
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

    hasDocument(documentName: string) {
        const doc = this.liveDocumentsByName[documentName];
        return !!doc;
    }

    getValueOpt(name: string, defaultValue: any) {
        if (this.fileScopedValues[name])
            return this.fileScopedValues[name];

        if (this.globalValues[name])
            return this.globalValues[name];

        const doc = this.liveDocumentsByName[name];
        if (doc)
            return doc.value;

        return defaultValue;
    }

    getValue(name: string) {
        const get = this.getValueOpt(name, MissingValue);

        if (get === MissingValue)
            throw new Error('value not found for: ' + name);

        return get;
    }

    async submitQuery(queryString: string, options?: QueryOptions) {
        return await submitQuery(this, queryString, options);
    }

    implementCommand(name, impl: CommandImplementation) {
        this.commandImplementations[name] = impl;
    }
}
