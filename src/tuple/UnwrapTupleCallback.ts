import Tuple from '../Tuple'
import Stream from '../Stream'
import { emitCommandError } from '../CommandUtils'

type ObjectCallback = (obj: any, tuple?: Tuple) => any | any[] | Promise<any> | Promise<any[]> | void

export function unwrapTuple(callback: ObjectCallback) {
    return (input: Tuple, out: Stream) => {

        let result;

        try {
            result = callback(input.toProxyObject(), input);
        } catch (err) {
            emitCommandError(out, err);
            out.done();
        }
    
        if (!result) {
            out.done();
            return;
        }

        function toTuple(object) {
            let t = input;
            for (const k in object) {
                t = t.setVal(k, object[k]);
            }
            return t;
        }
    
        if (result.then) {
            result
                .then(resolved => {
                    if (Array.isArray(resolved)) {
                        for (const v of resolved)
                            out.next(toTuple(v))
                    } else {
                        out.next(toTuple(resolved));
                    }
                    out.done();
                })
                .catch(err => {
                    emitCommandError(out, err);
                    out.done();
                })
        } else {
            if (Array.isArray(result)) {
                for (const v of result)
                    out.next(toTuple(v))
            } else {
                out.next(toTuple(result));
            }
            out.done();
        }
    }

}