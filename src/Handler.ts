
import Tuple, { newTuple, isTuple, newTupleWithVerb } from './Tuple'
import Tag, { newTag, newSimpleTag } from './Tag';
import Query from './Query'
import TableMount, { TupleStreamCallback } from './TableMount'
import QueryContext from './QueryContext'
import Stream from './Stream'
import { QueryLike } from './coerce'
import QueryEvalHelper from './QueryEvalHelper';
import { randomHex } from './utils'
import { emitCommandError } from './CommandUtils'
import { runQuery } from './query/runQuery'
import Pipe, { newPrefilledPipe } from './Pipe'

const contextInputStream = 'context.inputStream'
const contextEvalHelper = 'context.evalHelper'

function getTagsWithUnique(tuple: Tuple) {
    return tuple.tags.filter((tag: Tag) => tag.getTupleVerb() === 'unique');
}

function getRequiredValueTags(tuple: Tuple) {
    return tuple.tags.filter((tag: Tag) => {
        const verb = tag.getTupleVerb();
        if (verb === 'unique')
            return false;
        if (verb === 'env')
            return false;
        if (verb === 'subquery')
            return false;
        if (verb === 'scope')
            return false;
        return !!tag.attr;
    })
}

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

function fitOutputToTable(table: TableMount, input: Tuple, output: Tuple) {

    let fittedOutput = table.schema.remapTags((templateTag: Tag) => {

        if (templateTag.isTupleValue())
            templateTag = templateTag.dropValue();

        const outputTag = output.getTag(templateTag.attr);
        if (outputTag && outputTag.hasValue())
            return outputTag;

        return templateTag;
    });

    if (table.matcher.matchesStar) {
        // Star match - Any arbitrary attrs that appeared in the input can appear in the output.
        // Check if we need to add any.
        for (const outputTag of output.tags) {
            const attr = outputTag.attr;
            if (!fittedOutput.has(attr) && input.hasAttr(attr)) {
                fittedOutput = fittedOutput.addTag(outputTag);
            }
        }
    }

    return fittedOutput;
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

export default class Handler {
    verb: string
    mountPattern: Tuple
    requiredValues: Tag[]
    tagsWithUnique: Tag[]
    mount: TableMount

    nativeCallback?: TupleStreamCallback
    query?: Query

    constructor(mount: TableMount, verb: string, mountPattern: Tuple) {
        this.mount = mount;
        this.verb = verb;
        this.requiredValues = getRequiredValueTags(mountPattern);
        this.tagsWithUnique = getTagsWithUnique(mountPattern);

        if (mountPattern.hasAttr("evalHelper"))
            throw new Error("internal error: CommandEntry should not see 'evalHelper' attr");

        this.mountPattern = mountPattern;
    }

    setNativeCallback(nativeCallback: TupleStreamCallback) {
        this.nativeCallback = nativeCallback;
    }

    setQuery(query: Query) {
        this.query = query;
    }

    checkHasRequiredValues(input: Tuple) {
        for (const tag of this.requiredValues) {
            const matchingTag = input.getTag(tag.attr);
            if (!matchingTag || !matchingTag.hasValue() || matchingTag.isAbstractValue())
                return false;
        }
        return true;
    }

    call(scope: QueryContext, input: Tuple): Pipe {
        let handlerInput = input;

        // Pre modify input

        // Wrap star inputs
        //if (this.mount.matcher.matchesStar)
        //    input = this.mount.matcher.transformInputForStar(input);

        const postFixResult = (singleOutput: Tuple) => {

            if (singleOutput.isCommandMeta()) {
                if (singleOutput.isError())
                    return singleOutput;

                return null;
            }

            singleOutput = fitOutputToTable(this.mount, input, singleOutput);
            return singleOutput;
        }

        // Insert any injected values that the mount pattern requests.
        for (const injectTag of getInjectTags(this.mountPattern, scope, input)) {
            handlerInput = handlerInput.setTag(injectTag);
        }

        // Call the native callback
        if (this.nativeCallback) {

            const callbackOut = new Pipe('callTableHandler nativeCallback output');

            const out = callbackOut
            .map(postFixResult);

            try {
                const callbackResult: any = this.nativeCallback(handlerInput, callbackOut);

                if (callbackResult && callbackResult.then) {
                    callbackResult.catch(err => {
                        emitCommandError(out, err);
                        callbackOut.done();
                    });
                }
            } catch (err) {
                emitCommandError(out, err);
                callbackOut.done();
            }

            return out;
        }

        if (this.query) {
            // Run the destination query instead

            // console.log('running sub query: ', handler.query.stringify())

            const updatedQuery = translateQueryForAlias(handlerInput, this.query);

            const out = runQuery(scope.newChild(), updatedQuery, newPrefilledPipe([ ]))
            .map(postFixResult);

            return out;
        }
    }

}
