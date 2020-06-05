
import Tuple from './Tuple'
import { patternTagToString } from './stringifyQuery'

export default function stringifyRelationStream() {
    let searchPattern = null;
    let outputCount = false;
    let outputExtended = false;
    let outputList = false;
    let sawError = null;

    return (rel: Tuple) => {

        if (rel.hasType('command-meta')) {
            if (rel.hasType('search-pattern')) {
                searchPattern = rel.removeTypes(['command-meta','search-pattern']);
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
                return '#error ' + sawError.getTagValue('message');
            }

            if (rel.hasType('deleted')) {
                return 'delete ' + rel.removeType('command-meta').removeType('deleted').stringify()
            }

            return null;
        }

        const tags = rel.tags.filter(tag => {
            if (searchPattern && !outputExtended && searchPattern.fixedTagsForType[tag.tagType])
                return false;

            return true;
        });

        const tagStrs = tags.map(patternTagToString);

        let str = tagStrs.join(' ');

        return str;
    }
}
