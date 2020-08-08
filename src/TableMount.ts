
import Tuple from './Tuple'
import CommandPatternMatcher from './CommandPatternMatcher'
import { emitCommandError } from './CommandMeta'
import Stream from './Stream'
import QueryWatch from './QueryWatch';
import { TupleTag } from '.';

export type TupleStreamCallback = (input: Tuple, out: Stream) => void

export default class TableMount {
    name: string
    schema: Tuple
    handlers = new CommandPatternMatcher<TupleStreamCallback>()
    watches = new Map();

    constructor(name: string, schema: Tuple) {
        this.name = name;
        this.schema = schema;
    }

    addHandler(commandStr: string, handler: TupleStreamCallback) {
        this.handlers.addCommandStr(commandStr, handler);
    }

    hasHandler(commandName: string, tuple: Tuple) {
        return !!this.handlers.find(commandName, tuple);
    }

    callInsertUnique(uniqueTag: TupleTag, tuple: Tuple, out: Stream): boolean {
        // Find a matching entry that has ((unique)) for this tag.
        const callback = this.handlers.findWithUnique('insert', uniqueTag, tuple);

        if (!callback)
            return false;

        callback(tuple, out);
        return true;
    }

    callWithDefiniteValues(commandName: string, tuple: Tuple, out: Stream): boolean {
        const callback = this.handlers.findWithDefiniteValues(commandName, tuple);
        if (!callback)
            return false;

        callback(tuple, out);
        return true;
    }

    callWithDefiniteValuesOrError(commandName: string, tuple: Tuple, out: Stream) {
        if (!this.callWithDefiniteValues(commandName, tuple, out)) {
            emitCommandError(out, `Table ${this.name} doesn't support: ${commandName} ${tuple.stringify()}`)
            out.done();
            return;
        }
    }

    addWatch(pattern: Tuple, watchId: string, watch: QueryWatch, out: Stream) {
        this.watches.set(watchId, watch);
        this.callWithDefiniteValues('add-watch', pattern, out);
    }
}