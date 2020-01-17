
import { Query } from '..'
import { Snapshot, CommandImplementation } from '../framework'

interface Arg {
    isMain?: boolean
    isRequired?: boolean
}

export interface CommandDefinition {
    name: string
    mainArgs: string[]
    args: { [key: string]: Arg }
    takesAnyArgs?: boolean
    hasNoImplementation?: boolean
    run?: CommandImplementation
    fromLazyModule?: string
    notForHumans?: boolean
}

export interface CommandDatabase {
    byName: { [name: string]: CommandDefinition }
}

export function getZeroCommandDatabase(): CommandDatabase {
    return {
        byName: {
            'def-command': {
                name: 'def-command',
                args: {
                    'command-name': {
                        isRequired: true
                    }
                },
                mainArgs: ['command-name']
            },
            'def-relation': {
                name: 'def-relation',
                args: {
                    'relation-name': {
                        isRequired: true
                    }
                },
                mainArgs: ['relation-name']
            }
        }
    }
}

export function getCommandDatabase(key: Snapshot | Query): CommandDatabase {
    const snapshot = (key as any).snapshot || key;
    
    if (!snapshot.typeSnapshot) {
        throw new Error("expected Snapshot");
    }

    return snapshot.getValue('commandDatabase');
}
