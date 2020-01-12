
interface ProtocolError {
    problem: string
    causedBy?: string
    causedByIndex?: number
}

export default function verifyRespondProtocol(originalCommand: string, onError: (e: ProtocolError) => void) {

    let first = true;
    let sawStart = false;
    let sawDone = false;
    let messageNumber = 0;
    let finished = false;

    setTimeout(() => {
        if (!finished) {
            onError({
                problem: "Response didn't finish after 5 seconds"
            });
        }
    }, 5000);

    return (message) => {

        if (typeof message !== 'string') {
            onError({
                problem: "Message wasn't a string value",
                causedBy: message,
                causedByIndex: messageNumber
            });
        }

        if (!first && !sawStart) {
            onError({
                problem: "Saw more than one respond() call (and it's not a streaming reply)",
                causedBy: message,
                causedByIndex: messageNumber
            });
        }

        if (sawStart && sawDone) {
            onError({
                problem: "Saw a message after #done",
                causedBy: message,
                causedByIndex: messageNumber
            });
        }

        messageNumber += 1;
        first = false;

        if (message === '#start') {
            if (sawStart) {
                onError({
                    problem: 'Saw duplicate #start messages',
                    causedBy: message,
                    causedByIndex: messageNumber
                });
            }
            sawStart = true;
        }

        if (message === '#done')
            sawDone = true;

        if (sawDone)
            finished = true;

        if (!sawStart)
            finished = true;
    }
}
