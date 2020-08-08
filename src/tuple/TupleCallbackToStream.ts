import Tuple from "../Tuple";
import Stream from "../Stream";
import { emitCommandError } from "../CommandMeta";

type TupleCallback = (tuple: Tuple) => any | any[] | Promise<any> | Promise<any[]> | void

export default function toStream(callback: TupleCallback) {
    return (tuple: Tuple, out: Stream) => {

        let result;

        try {
            result = callback(tuple);

        } catch (err) {
            emitCommandError(out, err);
            out.done();
        }
    
        if (!result) {
            out.done();
            return;
        }
    
        if (result.then) {
            result
                .then(resolved => {
                    if (Array.isArray(resolved)) {
                        for (const v of resolved)
                            out.next(v)
                    } else {
                        out.next(resolved);
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
                    out.next(v)
            } else {
                out.next(result);
            }
            out.done();
        }
    }
}