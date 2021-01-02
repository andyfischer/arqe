
import Tuple from './Tuple'
import { TupleStreamCallback } from './TableMount'
import QueryContext from './QueryContext'
import Stream from './Stream'
import { isUniqueTag, isEnvTag, isSubqueryTag } from './knownTags'
import { QueryLike } from './coerce'
import QueryEvalHelper from './QueryEvalHelper';
import { randomHex } from './utils'
import { emitCommandError } from './CommandUtils'

const contextInputStream = 'context.inputStream'
const contextEvalHelper = 'context.evalHelper'

function getInjectTags(mountPattern: Tuple, cxt: QueryContext, callInput: Tuple) {
    //console.log('getInjectTags.. ', mountPattern.stringify())
    const injectTags = [];

    mountPattern.tags.forEach(mountTag => {
        //console.log('looking at mount tag: ', mountTag.stringify())
        if (isSubqueryTag(mountTag)) {
            const func = (query: QueryLike, output?: Stream) => {
                return cxt.graph.run(query, output);
            }
            
            // postStripTags.push(mountTag);
            injectTags.push(mountTag.setVal(func));
            return;
        }

        if (isEnvTag(mountTag)) {
            const val = cxt.getEnv(mountTag.attr);
            injectTags.push(mountTag.setVal(val));
            // postStripTags.push(mountTag);
            return;
        }

        if (mountTag.attr === contextEvalHelper) {
            const verb = cxt.verb;
            const helper = new QueryEvalHelper(cxt, verb, callInput);
            injectTags.push(mountTag.setVal(helper));
            // postStripTags.push(mountTag);
            return;
        }

        if (mountTag.attr === contextInputStream) {
            // postStripTags.push(mountTag);
            injectTags.push(mountTag.setVal(cxt.input));
            return;
        }

        if (isUniqueTag(mountTag)) {
            injectTags.push(mountTag.setVal(randomHex(8)));
            return;
        }
        
        // how to best control eager evaluation? Tags can have tuple values

        /*
        if (isTuple(mountTag.value)) {
            preRunQueries.push({
                query: mountTag.value,
                mountTag: mountTag
            });
        }
        */
    });

    return injectTags;
}

export function callTableHandler(tableSchema: Tuple,
                                   mountPattern: Tuple,
                                   callback: TupleStreamCallback,
                                   cxt: QueryContext,
                                   input: Tuple,
                                   out: Stream) {

    /*
    console.log('callTableHandlerV2', {
        tableSchema: tableSchema.stringify(),
        mountPattern: mountPattern.stringify(),
        input: input.stringify()
    });
    */

    let handlerInput = input;

    // Insert any injected values that the mount pattern requests.
    for (const injectTag of getInjectTags(mountPattern, cxt, input)) {
        handlerInput = handlerInput.setTag(injectTag);
    }

    // Set up output stream
    const filteredOut: Stream = {
        next(t) {
            // Only include attributes that were asked for
            if (!t.isCommandMeta())
                t = t.filterTags(tag => input.hasAttr(tag.attr));
            out.next(t);
        },
        done() {
            out.done();
        }
    }

    // Call the native callback
    try {
        const result: any = callback(handlerInput, filteredOut);

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
}
