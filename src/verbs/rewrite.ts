import CommandExecutionParams from '../CommandParams'
import QueryContext from '../QueryContext';
import Tuple from '../Tuple'
import Tag from '../Tag'

export function recursivelyReplaceFromTerms(template: Tuple, inputValue: Tuple) {
    return template.remapTags((tag: Tag) => {
        if (tag.isTupleValue()) {
            if (tag.value.getVerb() === 'from') {

                const fixedTag = tag.remapValue(fromTuple => {

                    return fromTuple.remapTags(fromTupleTag => {
                        if (fromTupleTag.attr === 'from')
                            return null;

                        return fromTupleTag.setValue(inputValue.getValue(fromTupleTag.attr));
                    })
                });

               return fixedTag;
            }

            if (tag.value.getVerb() === 'from-val') {

                const fromTupleTag = tag.value.tags[1];
                const fromAttr = (fromTupleTag && fromTupleTag.attr) || tag.attr;

                if (inputValue.hasAttr(fromAttr)) {
                    const newValue = inputValue.getValue(fromAttr);
                    return tag.setValue(newValue);
                } else {
                    return null;
                }
            }

            if (tag.value.getVerb() === 'from-all') {
                return tag.setValue(inputValue);
            }

            return tag.remapValue(tupleValue => recursivelyReplaceFromTerms(tupleValue, inputValue));
        }

        return tag;
    });
}

export default function rewriteVerb(params: CommandExecutionParams) {
    const { tuple, input, output } = params;

    input
    .map((t: Tuple) => {
        return recursivelyReplaceFromTerms(tuple, t);
    }, 'recursivelyReplaceFromTerms')
    .sendTo(output);
}
