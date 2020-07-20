import Tuple from "./Tuple";
import Stream from "./Stream";
import { emitCommandError } from "./CommandMeta";

export type NativeHandlerProtocol =
    'js_object'
    | 'tuple';

export default interface NativeHandler {
    name?: string
    func: any
    protocol: NativeHandlerProtocol 
}

function callWithJsObjectProtocol(handler: NativeHandler, input: Tuple, out: Stream) {
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

    if (result && result.then) {
        result
            .then(finish)
            .catch(err => {
                emitCommandError(out, err);
                out.done();
            })
    } else {
        finish(result);
    }
}

export function callNativeHandler(handler: NativeHandler, input: Tuple, out: Stream) {
    switch (handler.protocol) {
        case 'js_object':
            return callWithJsObjectProtocol(handler, input, out)
        case 'tuple':
            return handler.func(input, out);
    }

    throw new Error('unrecognized: ' + handler.protocol)
}

export function jsObjectHandler(func): NativeHandler {
    return {
        func,
        name: func.name,
        protocol: 'js_object'
    }
}