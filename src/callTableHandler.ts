
import Tuple from './Tuple'
import Tag from './Tag'
import { TupleStreamCallback } from './TableMount'
import QueryContext from './QueryContext'
import Stream from './Stream'
import { QueryLike } from './coerce'
import QueryEvalHelper from './QueryEvalHelper';
import { randomHex } from './utils'
import { emitCommandError } from './CommandUtils'
import { VerbHandler } from './TableMount'
import { runQuery } from './query/runQuery'
import Pipe, { newPrefilledPipe } from './Pipe'
import Query from './Query'

const contextInputStream = 'context.inputStream'
const contextEvalHelper = 'context.evalHelper'

function translateQueryForAlias(input: Tuple, sourceQuery: Query) {
    return sourceQuery.remapTuples((term:Tuple) => {
        if (term.getVerb() === 'get') {
            return term.remapTags((tag: Tag) => {
                if (!tag.hasValue() && input.hasValue(tag.attr))
                    return tag.setValue(input.getValue(tag.attr));

                return tag;
            });
        } else {
            return term;
        }
    });
}

function fitOutputToSchema(schema: Tuple, output: Tuple) {
    return schema.remapTags((schemaTag: Tag) => {
        if (schemaTag.isTupleValue())
            schemaTag = schemaTag.dropValue();
        const outputTag = output.getTag(schemaTag.attr);
        if (outputTag && outputTag.hasValue())
            return outputTag;

        return schemaTag;
    });
}

function getInjectTags(mountPattern: Tuple, cxt: QueryContext, callInput: Tuple) {
    const injectTags = [];

    mountPattern.tags.forEach(mountTag => {
        //console.log('looking at mount tag: ', mountTag.stringify())
        const verb = mountTag.getTupleVerb();

        if (verb === 'subquery') {
            const func = (query: QueryLike, output?: Stream) => {
                return cxt.graph.run(query, output);
            }
            
            // postStripTags.push(mountTag);
            injectTags.push(mountTag.setVal(func));
            return;
        }

        if (verb === 'env') {
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

        if (verb === 'unique') {
            injectTags.push(mountTag.setVal(randomHex(8)));
            return;
        }

        if (mountTag.getTupleVerb() === 'scope') {
            injectTags.push(mountTag.setVal(cxt));
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
                                 handler: VerbHandler,
                                 scope: QueryContext,
                                 input: Tuple) {

    let handlerInput = input;

    // Insert any injected values that the mount pattern requests.
    for (const injectTag of getInjectTags(handler.mountPattern, scope, input)) {
        handlerInput = handlerInput.setTag(injectTag);
    }

    // Call the native callback
    if (handler.nativeCallback) {

        const callbackOut = new Pipe('callTableHandler nativeCallback output');

        const out = callbackOut
        .map((t:Tuple) => {
            if (!t.isCommandMeta())
                //t = t.filterTags(tag => input.hasAttr(tag.attr));
                t = fitOutputToSchema(handler.mount.schema, t);

            return t;
        }, 'filter native callback');

        try {
            const result: any = handler.nativeCallback(handlerInput, callbackOut);

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

        return out;
    }

    if (handler.query) {
        // Run the destination query instead

        // console.log('running sub query: ', handler.query.stringify())

        const updatedQuery = translateQueryForAlias(handlerInput, handler.query);

        const out = runQuery(scope.newChild(), updatedQuery, newPrefilledPipe([ ]))
        .map(t => {
            if (t.isCommandMeta()) {
                if (t.isError())
                    return t;

                return;
            }

            return fitOutputToSchema(handler.mount.schema, t);
        }, 'query fitOutputToSchema');

        return out;
    }
}
