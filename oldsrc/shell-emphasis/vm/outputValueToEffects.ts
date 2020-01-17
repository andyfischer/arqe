
import VMEffect from './VMEffect'
import OutputSignature from './OutputSignature'
import Task from './Task'

export default function outputValueToEffects(task: Task, value: any, output: OutputSignature): VMEffect[] {
    switch (output.type) {

    case 'define':
        return [{
            type: output.type,
            name: output.name,
            fromTaskId: task.id,
            value
        }];

    case 'value':
        return [{
            type: output.type,
            fromTaskId: task.id,
            value
        }];
        
    case 'vmeffect':
        return value;

    }


    throw new Error('unhandled output.type: ' + output.type);
}
