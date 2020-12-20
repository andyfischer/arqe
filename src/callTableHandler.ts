
import Tuple, { newTuple, isTuple } from './Tuple'
import TupleTag from './TupleTag'
import { emitCommandError } from './CommandUtils'
import Stream from './Stream'
import Pipe from './Pipe'
import { QueryLike } from './coerce'
import QueryContext from './QueryContext';
import { compileTupleModificationStream } from './compilation/TupleModificationFunc'
import QueryEvalHelper from './QueryEvalHelper';
import TableHandler from './TableHandler'
import { isUniqueTag, isEnvTag, isSubqueryTag } from './knownTags'

const contextInputStream = 'context.inputStream'
const contextEvalHelper = 'context.evalHelper'

interface PreparedCall {
    handlerInput: Tuple
    postStripTags: TupleTag[]
    preRunQueries: {
        mountTag: TupleTag
        query: Tuple
    }[]
}

function prepareHandlerCall(cxt: QueryContext, incomingInput: Tuple, mountPattern: Tuple): PreparedCall {

    const postStripTags = [];
    const updatedTags = [];
    const preRunQueries = []

    mountPattern.tags.forEach(tag => {
        if (isSubqueryTag(tag)) {
            const func = (query: QueryLike, output?: Stream) => {
                return cxt.graph.run(query, output);
            }
            
            postStripTags.push(tag);
            updatedTags.push(tag.setVal(func));
            return;
        }

        if (isEnvTag(tag)) {
            const val = cxt.getEnv(tag.attr);
            updatedTags.push(tag.setVal(val));
            postStripTags.push(tag);
            return;
        }

        if (tag.attr === contextEvalHelper) {
            const verb = cxt.verb;
            const helper = new QueryEvalHelper(cxt, verb, incomingInput);
            updatedTags.push(tag.setVal(helper));
            postStripTags.push(tag);
            return;
        }

        if (tag.attr === contextInputStream) {
            postStripTags.push(tag);
            updatedTags.push(tag.setVal(cxt.input));
            return;
        }

        if (isTuple(tag.value)) {
            preRunQueries.push({
                query: tag.value,
                mountTag: tag
            });
        }
    });

    //console.log('updatedTags = ', updatedTags.map(t=>t.stringify()))

    let handlerInput = incomingInput;

    for (const tag of updatedTags)
        handlerInput = handlerInput.setTag(tag);

    return {
        handlerInput,
        postStripTags,
        preRunQueries
    }
}

export function callTableHandler(cxt: QueryContext, handler: TableHandler, inputPattern: Tuple, out: Stream) {
    
    out = compileTupleModificationStream(handler.postResultModify, out);

    const preparedCall = prepareHandlerCall(cxt, inputPattern, handler.declaredMountPattern);
    //console.log(`calling (${handler.declaredMountPattern.stringify()}) with (${inputPattern.stringify()})`
    //            +`, sending: (${handlerInput.stringify()})`)

    try {
        const result: any = handler.callback(preparedCall.handlerInput, out);

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
