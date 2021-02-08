
import Tuple, { newTuple, isTuple } from './Tuple'
import { emitCommandError, emitCommandOutputFlags } from './CommandUtils'
import findTablesForPattern from './findTablesForPattern'
import CommandParams from './CommandParams'

import annotateVerb from './verbs/annotate'
import browseCommand from './verbs/browse'
import countCommand from './verbs/count'
import deleteCommand from './verbs/delete'
import dropCommand from './verbs/drop'
import getCommand from './verbs/get'
import runJoinStep from './verbs/join'
import justVerb from './verbs/just'
import orderByCommand from './verbs/order-by'
import watchCommand from './verbs/watch'
import setCommand from './verbs/set'
import limitCommand from './verbs/limit'
import runCommand from './verbs/run'
import rewriteCommand from './verbs/rewrite'
import reverseVerb from './verbs/reverse'
import runVerbOne from './verbs/one'
import QueryContext from './QueryContext'
import singleValue from './verbs/val'
import runQueryCommand from './verbs/run-query'
import renameCommand from './verbs/rename'
import traceCommand from './verbs/trace'
import envCommand from './verbs/env'

import { toRelation } from './coerce'
import { compileTupleModificationStream } from './compilation/TupleModificationFunc'
import Relation from './Relation'

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
