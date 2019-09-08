
import { Snapshot } from '../framework'
import saveAutocompleteStrings from './saveAutocompleteStrings'
import fileScope from './file-scope'

export function mountEveryQueryWatcher(snapshot: Snapshot) {
    snapshot.mountQueryWatcher('saveAutocompleteStrings', saveAutocompleteStrings);
    snapshot.mountQueryWatcher('file-scope', fileScope);
}

