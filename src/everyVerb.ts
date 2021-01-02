
import Tuple, { newTuple, isTuple } from './Tuple'
import TupleTag, { newTag } from './TupleTag'
import { emitCommandError, emitCommandOutputFlags } from './CommandUtils'
import findTablesForPattern from './findTablesForPattern'
import CommandParams from './CommandParams'
import runJoinStep from './verbs/join'
import countCommand from './verbs/count'
import orderByCommand from './verbs/orderBy'
import watchCommand from './verbs/watch'
import setCommand from './verbs/set'
import getCommand from './verbs/get'
import runCommand from './verbs/run'
import rewriteCommand from './verbs/rewrite'
import runVerbOne from './verbs/one'
import deleteCommand from './verbs/delete'
import runJustStep from './verbs/just'
import QueryContext from './QueryContext'
import singleValue from './verbs/val'
import runQueryCommand from './verbs/run-query'
import renameCommand from './verbs/rename'
import traceCommand from './verbs/trace'
import envCommand from './verbs/env'
import browseCommand from './verbs/browse'
import { toRelation } from './coerce'
import { compileTupleModificationStream } from './compilation/TupleModificationFunc'
import Relation from './Relation'

export type VerbCallback = (params: CommandParams) => void

export const builtinVerbs: { [name: string]: VerbCallback } = {
    join: (params) => runJoinStep(params),
    just: (params) => runJustStep(params),
    get: (params) => getCommand(params),
    set: (params) => setCommand(params),
    run: (params) => runCommand(params),
    rewrite: (params) => rewriteCommand(params),
    delete: (params) => deleteCommand(params),
    count: (params) => countCommand(params),
    one: (params) => runVerbOne(params),
    'order-by': (params) => orderByCommand(params),
    watch: (params) => watchCommand(params),
    'val': (params) => singleValue(params),
    'run-query': (params) => runQueryCommand(params),
    rename: (params) => renameCommand(params),
    trace: (params) => traceCommand(params),
    env: (params) => envCommand(params),
    browse: (params) => browseCommand(params),
}
