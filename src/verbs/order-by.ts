
import Pipe from '../Pipe'
import CommandExecutionParams from '../CommandParams'
import Tuple from '../Tuple'

export default function orderBy(params: CommandExecutionParams) {

    const { input, tuple, output } = params;
    const buffer: Tuple[] = []

    input.then(rel => {
        for (const t of rel.tuples) {
            if (t.isCommandMeta())
                output.next(t);

            buffer.push(t);
        }

        buffer.sort((a: Tuple, b: Tuple) => {
            for (const sortTag of tuple.tags) {

                if (!a.has(sortTag.attr))
                    return 1;
                if (!b.has(sortTag.attr))
                    return -1;

                const aval = a.get(sortTag.attr) + ''
                const bval = b.get(sortTag.attr) + ''

                if (aval !== bval)
                    return aval.localeCompare(bval);
            }

            return 0;
        });

        for (const t of buffer)
            output.next(t);

        output.done();
    })
}
