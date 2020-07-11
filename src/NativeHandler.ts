import Tuple from "./Tuple";
import Stream from "./Stream";

export default interface NativeHandler {
    name?: string
    func: any
}

export function callNativeHandler(handler: NativeHandler, input: Tuple, out: Stream) {
    const inputObject = input.toObject();
    const result = handler.func(inputObject);

    function sendOutput(item) {
        if (!item)
            return;

        let updatedTuple = input;

        for (const k in item)
            updatedTuple = updatedTuple.setVal(k, item[k]);

        out.next(updatedTuple);
    }

    function finish(result) {
        if (Array.isArray(result)) {
            for (const item of result)
                sendOutput(item);
        } else {
            sendOutput(result);
        }

        out.done();
    }

    if (result.then)
        result.then(finish)
    else
        finish(result);
}

