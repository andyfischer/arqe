
import { Scope } from '../scope'
import { mountFunction } from '../vm'

export function bootstrap(scope: Scope) {
    mountFunction(scope, 'def-command', {
        inputs: [{
            fromMeta: 'scope'
        },{
            fromPosition: 0,
            fromName: 'command-name',
            isRequired: true
        }],
        callback: (scope: Scope, commandName: string) => {
        },
        outputs: []
    });

    mountFunction(scope, 'def-relation', {
        inputs: [{
            fromPosition: 0,
            fromName: 'relation-name',
            isRequired: true
        }],
        callback: null,
        outputs: []
    });
}
