
import VMEffect from './VMEffect'
import OutputSignature from './OutputSignature'

export default function outputValueToEffect(taskId: number, value: any, output: OutputSignature) {
    switch (output.type) {

    case 'set-env':
        return {
            type: output.type,
            name: output.name,
            taskId,
            value
        }
    case 'save-result':
        return {
            type: output.type,
            taskId,
            value
        }
    }

    throw new Error('unhandled output.type: ' + output.type);
}
