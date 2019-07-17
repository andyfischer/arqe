
import { Query } from '../query'
import { Snapshot } from '../framework'

interface Arg {
    isMain?: boolean
    isRequired?: boolean
}

export interface CommandDefinition {
    name: string
    mainArg?: string
    args: { [key: string]: Arg }
    hasNoImplementation?: boolean
}

export interface CommandDatabase {
    byName: { [name: string]: CommandDefinition }
}

export function getInitialCommandDatabase(): CommandDatabase {
    return {
        byName: {
            'def-command': {
                name: 'def-command',
                args: {
                    'command-name': {
                        isRequired: true
                    }
                },
                mainArg: 'command-name',
                hasNoImplementation: true
            },
            'def-relation': {
                name: 'def-relation',
                args: {
                    'relation-name': {
                        isRequired: true
                    }
                },
                mainArg: 'relation-name',
                hasNoImplementation: true
            }
        }
    }
}

export function getCommandDatabase(key: Snapshot | Query): CommandDatabase {

    const snapshot = (key as any).snapshot || key;

    return snapshot.getValue('commandDatabase');
}
