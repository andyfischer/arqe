import Graph from "../Graph";
import { receiveToTupleList } from "../receiveUtils";
import Pipe from "../utils/Pipe";
import Tuple from "../Tuple";
import { run } from "./utils";

let graph: Graph;

it("supports context.inputStream and context.outputStream", () => {
    graph = new Graph({
        provide: {
            'msg': {
                name: 'msg',
                'get context.inputStream context.outputStream': (input, out) => {
                    const inStream: Pipe = input.getVal('context.inputStream');
                    const outStream = input.getVal('context.outputStream');

                    outStream.next(input.setVal("msg", "sent on outStream"));

                    let inputs: Tuple[] = [];
                    // inStream.sendTo(receiveToTupleList(l => { inputs = l }));

                    for (const input of inputs) {
                        outStream.next(input.setVal("msg", "saw input: " + input.stringify()))
                    }

                    out.next(input.setVal("msg", "sent on main output"));
                    out.done();
                }
            }
        }
    });

    expect(run(graph, "get msg")).toEqual([
        'msg[sent on outStream]',
        'msg[sent on main output]'
    ]);

    /*
    expect(run(graph, "single-value inputValue | get msg")).toEqual([
        'msg(sent on outStream)',
        // 'inputValue msg(saw input: inputValue)',
        'msg(sent on main output)'
    ]);
    */
})
