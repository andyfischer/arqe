
import { Reducer, everyReducer } from '../framework'
import { print } from '../utils'
import applyQuery from './applyQuery'
import { CommandDatabase } from '../reducers/commandDatabase'
import '../reducers'

export default class Snapshot {

    liveValues: { [name: string]: any } = {}
    liveDocuments: Reducer[] = []
    liveDocumentsByName: { [name: string]: Reducer } = {}

    constructor() {
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

    // ParseContext
    isRelation(s: string) {
        const relations = this.getValue('relations');
        return !!relations[s];
    }

    isCommand(s: string) {
        const db: CommandDatabase = this.getValue('commandDB');
        return !!db.byName[s];
    }

    getLastIncompleteClause() {
        return this.getValueOpt('lastIncompleteClause').found;
    }
    // end ParseContext

    hasDocument(documentName: string) {
        const doc = this.liveDocumentsByName[documentName];
        return !!doc;
    }

    getValueOpt(name: string) {
        if (this.liveValues[name])
            return { found: this.liveValues[name] }

        const doc = this.liveDocumentsByName[name];
        if (doc)
            return { found: doc.value }

        return {};
    }

    getValue(name: string) {
        const get = this.getValueOpt(name);

        if (!get.found)
            throw new Error('value not found for: ' + name);

        return get.found;
    }

    async applyQuery(queryString: string) {
        return await applyQuery(this, queryString);
    }
}
