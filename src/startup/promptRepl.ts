
import Prompt from 'prompt'
import { Snapshot } from '../snapshot'

async function get(): Promise<string> {
    return new Promise((resolve,reject) => {
        Prompt.get(' >', (err, result) => {
            if (err)
                reject(err);
            else
                resolve(result[' >']);
        });
    }) as any;
}

export default async function promptRepl(snapshot: Snapshot) {

    Prompt.message = ''
    Prompt.delimiter = ''
    Prompt.start();

    try {
        while (true) {
            const input = await get();
            // console.log('input: ' + JSON.stringify(input));
            await snapshot.applyQuery(input);
        }
    } catch (err) {
        if (err.message == 'canceled') {
            console.log();
            return;
        }

        throw err;
    }
}
