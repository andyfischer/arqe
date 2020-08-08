
import Tuple from './Tuple'
import { tagToString } from './TupleTag';

export default function stringifyRelationStream() {
    let searchPattern: Tuple = null;
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
                    && searchPattern.getTag(tag.attr)
                    && searchPattern.getTag(tag.attr).hasValue())
                return false;

            return true;
        });

        const tagStrs = tags.map(tagToString);

        let str = tagStrs.join(' ');

        return str;
    }
}
