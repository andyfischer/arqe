
import CommandExecutionParams from '../CommandParams'
import Tuple from '../Tuple';
import TupleTag from '../TupleTag';

export default function runJustStep(params: CommandExecutionParams) {
    const { tuple, input, output } = params;

    input.sendTo({
        next(t: Tuple) {
            if (t.isCommandMeta()) {
                output.next(t)
                return;
            }

            const modified = t.remapTags((tag: TupleTag) => {
                if (tag.attr && tuple.hasAttr(tag.attr)) {
                    return tag;
                } else {
                    return null;
                }
            })

            if (modified.isEmpty())
                return;

            output.next(modified);
        },
        done() {
            output.done();
        }
    })
}
