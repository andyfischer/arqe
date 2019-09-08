
import { Snapshot } from '../framework'
import saveAutocompleteStrings from './saveAutocompleteStrings'

export function mountEveryQueryWatcher(snapshot: Snapshot) {
    snapshot.mountQueryWatcher('saveAutocompleteStrings', saveAutocompleteStrings);
}

