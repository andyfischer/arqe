
import Relation from './Relation'
import { commandTagToString } from './stringifyQuery'

export default function stringifyRelationStream() {
    let searchPattern = null;
    let outputCount = false;
    let outputExtended = false;
    let outputList = false;
    let sawError = null;

    return (rel: Relation) => {

        if (rel.hasType('command-meta')) {
            if (rel.hasType('search-pattern')) {
                searchPattern = rel
                    .removeType('command-meta')
                    .removeType('search-pattern')
                    .freeze();

                return;
            }

            if (rel.hasType('output-flag')) {
                if (rel.getTagValue('output-flag') === 'extended')
                    outputExtended = true;
                if (rel.getTagValue('output-flag') === 'list')
                    outputList = true;
                return;
            }

            if (rel.hasType('error')) {
                return '#error ' + sawError.getPayload();
            }

            return null;
        }

        const tags = rel.tags.filter(tag => {
            if (searchPattern && !outputExtended && searchPattern.fixedTagsForType[tag.tagType])
                return false;

            return true;
        });

        const tagStrs = tags.map(commandTagToString);

        let str = tagStrs.join(' ');
        
        if (!outputList)
            str += (rel.hasPayload() ? ` == ${rel.getPayload()}` : '');

        if (rel.wasDeleted) {
            str = 'delete ' + str;
        }

        return str;

        /*
                if (searchPattern && !searchPattern.isMultiMatch()) {
                    if (rels.length === 0) {
                        onDone('#null');
                    } else {
                        if (rels[0].hasPayload()) {
                            onDone(rels[0].getPayload());
                        } else if (outputExtended) {
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
        */
    }
}
