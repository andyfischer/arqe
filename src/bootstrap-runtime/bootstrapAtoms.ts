
import { Scope } from '../scope'
import { mountFunction } from '../vm'
import defCommand from './defCommand'

export default function bootstrap(scope: Scope) {
    mountFunction(scope, 'def-command', {
        inputs: [{
            fromMeta: 'scope'
        },{
            fromPosition: 0,
            fromName: 'command-name',
            isRequired: true
        }],
        callback: defCommand,
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
