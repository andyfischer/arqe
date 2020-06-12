
import Tuple from './Tuple'
import { patternTagToString } from './stringifyQuery'

export default function stringifyRelationStream() {
    let searchPattern = null;
    let outputCount = false;
    let outputExtended = false;
    let outputList = false;
    let sawError = null;

    return (rel: Tuple) => {

        if (rel.hasAttr('command-meta')) {
            if (rel.hasAttr('search-pattern')) {
                searchPattern = rel.removeTypes(['command-meta','search-pattern']);
                return;
            }

            if (rel.hasAttr('output-flag')) {
                if (rel.getVal('output-flag') === 'extended')
                    outputExtended = true;
                if (rel.getVal('output-flag') === 'list')
                    outputList = true;
                return;
            }

            if (rel.hasAttr('error')) {
                return '#error ' + sawError.getTagValue('message');
            }

            if (rel.hasAttr('deleted')) {
                return 'delete ' + rel.removeAttr('command-meta').removeAttr('deleted').stringify()
            }

            return null;
        }

        const tags = rel.tags.filter(tag => {
            if (searchPattern && !outputExtended && searchPattern.fixedTagsForType[tag.attr])
                return false;

            return true;
        });

        const tagStrs = tags.map(patternTagToString);

        let str = tagStrs.join(' ');

        return str;
    }
}
