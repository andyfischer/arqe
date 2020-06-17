
import Tuple from './Tuple'
import TupleReceiver from './TupleReceiver'
import PatternTag from './PatternTag'
import { patternTagToString } from './stringifyQuery'

export default function receiveToStringList(onDone: (s: string|string[]) => void): TupleReceiver {

    let searchPattern = null;
    let actionPerformed = null;
    let outputExists = false;
    let outputCount = false;
    let outputExtended = false;
    let outputList = false;
    let sawError: Tuple = null;

    const rels: Tuple[] = [];

    function stringifyTuple(rel: Tuple) {

        const tags = rel.tags.filter((tag: PatternTag) => {
            if (searchPattern && !outputExtended
                && searchPattern.derivedData().fixedTagsForAttr.has(tag.attr))
                return false;

            return true;
        });

        const tagStrs = tags.map(patternTagToString);
        tagStrs.sort();

        let str = tagStrs.join(' ');

        return str;
    }

    return {
        next: (rel: Tuple) => {

            if (rel.hasAttr('command-meta')) {
                if (rel.hasAttr('action-performed')) {
                    actionPerformed = rel;
                    return;
                }

                if (rel.hasAttr('search-pattern')) {
                    searchPattern = rel.removeTypes(['command-meta', 'search-pattern']);
                    return;
                }

                if (rel.hasAttr('output-flag')) {
                    if (rel.getVal('output-flag') === 'exists')
                        outputExists = true;
                    if (rel.getVal('output-flag') === 'count')
                        outputCount = true;
                    if (rel.getVal('output-flag') === 'extended')
                        outputExtended = true;
                    if (rel.getVal('output-flag') === 'list')
                        outputList = true;
                    return;
                }

                if (rel.hasAttr('error')) {
                    if (!sawError)
                        sawError = rel;
                    return;
                }
            }

            rels.push(rel);
        },
        finish: () => {
            if (sawError) {
                onDone('#error ' + sawError.getVal('message'));
                return;
            }

            if (actionPerformed) {
                onDone('#done');
                return;
            }

            if (searchPattern && !searchPattern.isMultiMatch()) {
                if (rels.length === 0) {
                    onDone('#null');
                } else {
                    if (outputExtended) {
                        onDone('set ' + rels[0].stringifyRelation());
                    } else {
                        onDone('#exists');
                    }
                }

                return;
            }

            if (outputExists) {
                if (rels.length === 0)
                    onDone('#null');
                else
                    onDone('#exists');

                return;
            }

            if (outputCount) {
                onDone(rels.length + '');
                return;
            }

            onDone(rels.map(rel => stringifyTuple(rel)))
        }
    }
}
