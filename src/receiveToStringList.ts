
import Relation from './Relation'
import RelationReceiver from './RelationReceiver'
import { patternTagToString } from './stringifyQuery'

export default function receiveToStringList(onDone: (s: string|string[]) => void): RelationReceiver {

    let searchPattern = null;
    let actionPerformed = null;
    let outputExists = false;
    let outputCount = false;
    let outputExtended = false;
    let outputList = false;
    let sawError = null;

    const rels: Relation[] = [];

    function stringifyRelation(rel: Relation) {

        const tags = rel.tags.filter(tag => {
            if (searchPattern && !outputExtended && searchPattern.fixedTagsForType[tag.tagType])
                return false;

            return true;
        });

        const tagStrs = tags.map(patternTagToString);
        tagStrs.sort();

        let str = tagStrs.join(' ');

        return str;
    }

    return {
        relation: (rel: Relation) => {

            if (rel.hasType('command-meta')) {
                if (rel.hasType('action-performed')) {
                    actionPerformed = rel;
                    return;
                }

                if (rel.hasType('search-pattern')) {
                    searchPattern = rel.removeTypes(['command-meta', 'search-pattern']);
                    return;
                }

                if (rel.hasType('output-flag')) {
                    if (rel.getTagValue('output-flag') === 'exists')
                        outputExists = true;
                    if (rel.getTagValue('output-flag') === 'count')
                        outputCount = true;
                    if (rel.getTagValue('output-flag') === 'extended')
                        outputExtended = true;
                    if (rel.getTagValue('output-flag') === 'list')
                        outputList = true;
                    return;
                }

                if (rel.hasType('error')) {
                    if (!sawError)
                        sawError = rel;
                    return;
                }
            }

            rels.push(rel);
        },
        finish: () => {
            if (sawError) {
                onDone('#error ' + sawError.getTagValue('message'));
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

            onDone(rels.map(rel => stringifyRelation(rel)))
        }
    }
}
