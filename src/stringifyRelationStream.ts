
import Tuple from './Tuple'
import { patternTagToString } from './stringifyQuery'

export default function stringifyRelationStream() {
    let searchPattern: Tuple = null;
    let outputCount = false;
    let outputExtended = false;

    return (rel: Tuple) => {

        if (rel.hasAttr('command-meta')) {
            if (rel.hasAttr('search-pattern')) {
                searchPattern = rel.removeTypes(['command-meta','search-pattern']);
                return;
            }

            if (rel.hasAttr('output-flag')) {
                if (rel.getVal('output-flag') === 'extended')
                    outputExtended = true;
                return;
            }

            if (rel.hasAttr('error')) {
                return '#error ' + rel.getVal('message');
            }

            if (rel.hasAttr('deleted')) {
                return 'delete ' + rel.removeAttr('command-meta').removeAttr('deleted').stringify()
            }

            return null;
        }

        const tags = rel.tags.filter(tag => {
            if (searchPattern
                    && !outputExtended
                    && searchPattern.findTagForType(tag.attr)
                    && searchPattern.findTagForType(tag.attr).fixedValue())
                return false;

            return true;
        });

        const tagStrs = tags.map(patternTagToString);

        let str = tagStrs.join(' ');

        return str;
    }
}
