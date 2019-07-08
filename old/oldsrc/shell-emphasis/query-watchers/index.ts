// generated file

import { Snapshot } from '../framework';
import bootstrapScripts from './bootstrapScripts';
import commandDatabase from './commandDatabase';
import fileScope from './file-scope';
import growRelationDatabase from './growRelationDatabase';
import invalidQueryCheck from './invalidQueryCheck';
import lastIncompleteClause from './lastIncompleteClause';
import lastQueryStr from './lastQueryStr';
import saveAutocompleteStrings from './saveAutocompleteStrings';
import tracer from './tracer';
import writeFactsToLog from './writeFactsToLog';

export function mountEveryQueryWatcher(snapshot: Snapshot) {
    snapshot.mountQueryWatcher('bootstrapScripts', bootstrapScripts)
    snapshot.mountQueryWatcher('commandDatabase', commandDatabase)
    snapshot.mountQueryWatcher('file-scope', fileScope)
    snapshot.mountQueryWatcher('growRelationDatabase', growRelationDatabase)
    snapshot.mountQueryWatcher('invalidQueryCheck', invalidQueryCheck)
    snapshot.mountQueryWatcher('lastIncompleteClause', lastIncompleteClause)
    snapshot.mountQueryWatcher('lastQueryStr', lastQueryStr)
    snapshot.mountQueryWatcher('saveAutocompleteStrings', saveAutocompleteStrings)
    snapshot.mountQueryWatcher('tracer', tracer)
    snapshot.mountQueryWatcher('writeFactsToLog', writeFactsToLog)
}