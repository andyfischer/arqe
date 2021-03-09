
import Tuple from '../Tuple'
import { builtinVerbs } from '../verbs/_directory'

interface RunnableTerm {
    verb: string
    params: Tuple
    flags: Tuple
}

export function extractVerbForTerm(term: Tuple): RunnableTerm {

    let verb;
    let params = term;
    let flags;

    if (term.hasValue('verb')) {
        verb = term.getValue('verb');
        params = params.removeAttr('verb');
    }

    if (!verb) {
        // Find the verb.
        for (const attr of term.attrs()) {
            if (builtinVerbs[attr]) {
                verb = attr;
                params = params.removeAttr(attr);
            }
        }
    }

    if (term.hasValue('flags')) {
        flags = term.getValue('flags');
        params = params.removeAttr('flags')
    }

    return {
        verb,
        params,
        flags
    }
}

