
import Tuple, { isTuple, emptyTuple } from './Tuple'
import { toTuple, TupleLike } from './coerce'

export default class MemoryStorage {

    everyItem = new Map<string, { key: Tuple, value: Tuple }>()

    get(key: Tuple): Tuple | null {
        return this.everyItem.get(key.stringify()).value;
    }

    *find(pattern: Tuple) {
        for (const { key, value } of this.everyItem.values()) {
            if (pattern.isSupersetOf(key))
                yield value;
        }
    }

    set(key: Tuple, value: Tuple) {
        this.everyItem.set(key.stringify(), {key, value});
    }

    asTableDefinition() {
        return {
            'memory key value': {
                find: (i,o) => {
                    const keyTag = i.getTag('key');

                    if (keyTag.hasValue()) {
                        for (const value of this.find(keyTag.value))
                            o.next({value});
                        o.done();
                        return;
                    }

                    // Yield every item
                    for (const { key, value } of this.everyItem.values())
                        o.next({key, value});

                    o.done();
                },
                set: (i, o) => {
                    this.set(i.get('key'), i.get('value'));
                    o.done();
                }
            }
        }
    }
}
