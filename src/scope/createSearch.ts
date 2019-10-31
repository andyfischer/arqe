
import Scope from './Scope'
import RelationSearch from './RelationSearch'
import parseTag from './parseTag'

export default function createSearch(scope: Scope, pattern: string) {
    const items = pattern.split(' ');
    const search = new RelationSearch()

    search.tagCount = items.length;

    for (const item of items) {
        if (item === '*')
            continue;

        if (item.endsWith('*')) {
            search.tagPrefixes.push(item.replace(/\*$/, ''));
            continue;
        }

        search.exactTags.push(item);
    }

    // Update with any existing relations
    for (const existingRelationTag in scope.relations) {
        const parsed = parseTag(existingRelationTag);
        search.maybeInclude(parsed);
    }

    return search;
}
