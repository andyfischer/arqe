import { dir } from "console"
import { FsDirectory } from "./tables/Filesystem"

interface CommandInfo {
    directTableAccess?: boolean
}

export const ValidCommands: { [name: string]: CommandInfo } = {
    'join': {
        directTableAccess: true
    },
    'get': {
        directTableAccess: true
    },
    'set': {
        directTableAccess: true
    },
    'select': {
        directTableAccess: true
    },
    'insert': {
        directTableAccess: true
    },
    'update': {
        directTableAccess: true
    },
    'delete': {
        directTableAccess: true
    },
    'count': {},
    'listen': {},
    'order-by': {},
    'watch': {}
};