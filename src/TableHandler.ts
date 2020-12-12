
import Tuple, { newTuple, isTuple } from './Tuple'
import TupleTag, { newTag, newSimpleTag } from './TupleTag';
import { TupleStreamCallback } from './TableMount'
import Relation from './Relation'
import { isUniqueTag, isEnvTag, isSubqueryTag } from './knownTags'
import Query from './Query'

const contextInputStream = 'context.inputStream'
const contextOutputStream = 'context.outputStream'
const contextEvalHelper = 'context.evalHelper'
const contextSubquery = 'context.subquery'

export interface PreCallStep {
    injectEvalHelper?: boolean
    injectInputStream?: boolean
    injectOutputStream?: boolean
    injectFromEnv?: string
    injectSubquery?: boolean
    injectSubqueryFunc?: string
    injectSubqueryResult?: Query
}

function getTagsWithUnique(tuple: Tuple) {
    return tuple.tags.filter((tag: TupleTag) => isUniqueTag(tag));
}

function getRequiredValueTags(tuple: Tuple) {
    return tuple.tags.filter((tag: TupleTag) => {
        if (isUniqueTag(tag))
            return false;
        if (isEnvTag(tag))
            return false;
        if (isSubqueryTag(tag))
            return false;
        return !!tag.attr;
    })
}

function isPreRun(tag: TupleTag) {
    return (isTuple(tag.value)
        && tag.value.tags[0]
        && ((tag.value.tags[0].attr === 'get')
            || (tag.value.tags[0].attr === 'join')));
}

export default class Handler {
    verb: string
    inputPattern: Tuple
    requiredValues: TupleTag[]
    tagsWithUnique: TupleTag[]
    preRunQueries: TupleTag[]

    steps: PreCallStep[] = []
    callback: TupleStreamCallback
    postResultModify: Relation

    constructor(verb: string, mountPattern: Tuple, callback: TupleStreamCallback) {

        const steps: PreCallStep[] = [];
        const postResultModify: Tuple[] = [];
        const preRunQueries: TupleTag[] = [];
        const tagsWithUnique: TupleTag[] = [];

        function checkOneMountTag(mountTag: TupleTag) {
            if (mountTag.attr === contextEvalHelper) {
                steps.push({injectEvalHelper: true});
                mountPattern = mountPattern.removeAttr(contextEvalHelper);
                postResultModify.push(newTuple(newTag('remove-attr', contextEvalHelper)));
                return;
            }

            if (mountTag.attr === contextInputStream) {
                steps.push({injectInputStream: true});
                mountPattern = mountPattern.removeAttr(contextInputStream);
                postResultModify.push(newTuple(newTag('remove-attr', contextInputStream)));
                return;
            }

            if (mountTag.attr === contextOutputStream) {
                steps.push({injectOutputStream: true});
                mountPattern = mountPattern.removeAttr(contextOutputStream);
                postResultModify.push(newTuple(newTag('remove-attr', contextOutputStream)));
            }

            if (mountTag.attr === contextSubquery) {
                steps.push({injectSubquery: true});
                mountPattern = mountPattern.removeAttr(contextSubquery);
                postResultModify.push(newTuple(newTag('remove-attr', contextSubquery)));
            }

            if (isEnvTag(mountTag)) {
                steps.push({injectFromEnv: mountTag.attr});
                mountPattern = mountPattern.removeAttr(mountTag.attr);
                postResultModify.push(newTuple(newTag('remove-attr', mountTag.attr)));
                return;
            }

            if (isSubqueryTag(mountTag)) {
                steps.push({injectSubqueryFunc: mountTag.attr});
                mountPattern = mountPattern.removeAttr(mountTag.attr);
                postResultModify.push(newTuple(newTag('remove-attr', mountTag.attr)));
                return;
            }

            if (isUniqueTag(mountTag)) {
                tagsWithUnique.push(mountTag);
                return;
            }

            if (isPreRun(mountTag)) {
                return;
            }
        }

        for (const tag of mountPattern.tags)
            checkOneMountTag(tag);

        this.verb = verb;
        this.steps = steps;
        this.postResultModify = new Relation(postResultModify);
        this.requiredValues = getRequiredValueTags(mountPattern);
        this.tagsWithUnique = tagsWithUnique;

        if (mountPattern.hasAttr("evalHelper"))
            throw new Error("internal error: CommandEntry should not see 'evalHelper' attr");

        this.inputPattern = mountPattern;
        this.callback = callback;
    }

    checkHasRequiredValues(input: Tuple) {
        for (const tag of this.requiredValues) {
            const matchingTag = input.getTag(tag.attr);
            if (!matchingTag || !matchingTag.hasValue() || matchingTag.isAbstractValue())
                return false;
        }
        return true;
    }
}
