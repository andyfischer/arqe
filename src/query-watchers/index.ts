// generated file

import { Snapshot } from '../framework';
import fileScope from './file-scope';
import growRelationDatabase from './growRelationDatabase';
import invalidQueryCheck from './invalidQueryCheck';
import saveAutocompleteStrings from './saveAutocompleteStrings';
import writeFactsToLog from './writeFactsToLog';

export function mountEveryQueryWatcher(snapshot: Snapshot) {
    snapshot.mountQueryWatcher('file-scope', fileScope)
    snapshot.mountQueryWatcher('growRelationDatabase', growRelationDatabase)
    snapshot.mountQueryWatcher('invalidQueryCheck', invalidQueryCheck)
    snapshot.mountQueryWatcher('saveAutocompleteStrings', saveAutocompleteStrings)
    snapshot.mountQueryWatcher('writeFactsToLog', writeFactsToLog)
}