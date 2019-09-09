// generated file

import { Snapshot } from '../framework';
import fileScope from './file-scope';
import growRelationDatabase from './growRelationDatabase';
import saveAutocompleteStrings from './saveAutocompleteStrings';

export function mountEveryQueryWatcher(snapshot: Snapshot) {
    snapshot.mountQueryWatcher('file-scope', fileScope)
    snapshot.mountQueryWatcher('growRelationDatabase', growRelationDatabase)
    snapshot.mountQueryWatcher('saveAutocompleteStrings', saveAutocompleteStrings)
}