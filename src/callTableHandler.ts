
import Tuple, { newTuple } from './Tuple'
import { emitCommandError } from './CommandUtils'
import Stream from './Stream'
import Pipe from './Pipe'
import { QueryLike } from './coerce'
import QueryContext from './QueryContext';
import { compileTupleModificationStream } from './compilation/TupleModificationFunc'
import QueryEvalHelper from './QueryEvalHelper';
import TableHandler from './TableHandler'

const contextInputStream = 'context.inputStream'
const contextOutputStream = 'context.outputStream'
const contextEvalHelper = 'context.evalHelper'
const contextSubquery = 'context.subquery'

function insertEvalHelperTag(cxt: QueryContext, tuple: Tuple) {
    const verb = cxt.verb;
    const helper = new QueryEvalHelper(cxt, verb, tuple);
    return tuple.setVal(contextEvalHelper, helper);
}

export function callTableHandler(cxt: QueryContext, handler: TableHandler, tuple: Tuple, out: Stream) {
    
    out = compileTupleModificationStream(handler.postResultModify, out);

    for (const step of handler.steps) {
        if (step.injectEvalHelper) {
            tuple = insertEvalHelperTag(cxt, tuple);
        }

        if (step.injectInputStream) {
            tuple = tuple.setVal(contextInputStream, cxt.input);
        }
        
        if (step.injectOutputStream) {
            tuple = tuple.setVal(contextOutputStream, out);
        }

        if (step.injectFromEnv) {
            tuple = tuple.setVal(step.injectFromEnv, cxt.getEnv(step.injectFromEnv));
        }

        if (step.injectSubqueryFunc) {
            const func = (query: QueryLike) => {
                const pipe = new Pipe();
                cxt.graph.run(query, pipe);
                return pipe;
            }
            tuple = tuple.setVal(step.injectSubqueryFunc, func);
        }

        if (step.injectSubquery) {
            tuple = tuple.setVal(contextSubquery, (query: QueryLike, out: Stream) => cxt.makeSubquery(query, out));
        }
    }

    try {
        const result: any = handler.callback(tuple, out);

        if (result && result.then) {
            result.catch(err => {
                emitCommandError(out, err);
                out.done();
            });
        }
    } catch (err) {
        emitCommandError(out, err);
        out.done();
    }

    return true
}
