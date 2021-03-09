
import Tuple, { newTuple, isTuple } from '../Tuple'
import { emitCommandError, emitCommandOutputFlags } from '../CommandUtils'
import findTablesForPattern from '../findTablesForPattern'
import CommandParams from '../CommandParams'
import Relation from '../Relation'

import annotateVerb from './annotate'
import browseCommand from './browse'
import countCommand from './count'
import deleteCommand from './delete'
import dropCommand from './drop'
import getCommand from './get'
import runJoinStep from './join'
import justVerb from './just'
import orderByCommand from './order-by'
import watchCommand from './watch'
import setCommand from './set'
import limitCommand from './limit'
import runCommand from './run'
import rewriteCommand from './rewrite'
import reverseVerb from './reverse'
import runVerbOne from './one'
import singleValue from './val'
import runQueryCommand from './run-query'
import renameCommand from './rename'
import traceCommand from './trace'
import envCommand from './env'


export type VerbCallback = (params: CommandParams) => void

export const builtinVerbs: { [name: string]: VerbCallback } = {
    annotate: (params) => annotateVerb(params),
    delete: (params) => deleteCommand(params),
    drop: (params) => dropCommand(params),
    get: (params) => getCommand(params),
    join: (params) => runJoinStep(params),
    just: (params) => justVerb(params),
    limit: (params) => limitCommand(params),
    set: (params) => setCommand(params),
    run: (params) => runCommand(params),
    rewrite: (params) => rewriteCommand(params),
    count: (params) => countCommand(params),
    one: (params) => runVerbOne(params),
    'order-by': (params) => orderByCommand(params),
    watch: (params) => watchCommand(params),
    'val': (params) => singleValue(params),
    'run-query': (params) => runQueryCommand(params),
    rename: (params) => renameCommand(params),
    reverse: (params) => reverseVerb(params),
    trace: (params) => traceCommand(params),
    env: (params) => envCommand(params),
    browse: (params) => browseCommand(params),
}

