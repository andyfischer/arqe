
import QueryContext from '../QueryContext'
import CommandParams from '../CommandParams'
import { emitCommandError } from '../CommandUtils'
import Tuple from '../Tuple'

export default function runQueryCommand(params: CommandParams) {

    const { tuple, input, output } = params;

    if (tuple.tags.length < 2) {
        emitCommandError(output, "expected two arguments");
        output.done();
        return;
    }

    const from = tuple.getIndex(0);
    const to = tuple.getIndex(1);

    input.sendTo({
        next(t: Tuple) {
            const tag = t.getTag(from.attr);
            if (!tag) {
                output.next(t)
                return;
            }
            t = t.removeAttr(from.attr).addTag(tag.setAttr(to.attr));
            output.next(t);
        },
        done() {
            output.done()
        }
    })
}
