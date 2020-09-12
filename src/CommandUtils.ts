
import CommandParams from './CommandParams'
import QueryContext from './QueryContext'
import { runGet } from './commands/get'
import { joinNStreams_v2 } from './StreamUtil'
import Stream from './Stream'

export function getSearchAndInputCombined(cxt: QueryContext, params: CommandParams, out: Stream) {
    const joined = joinNStreams_v2(2, out);
    params.input.sendTo(joined);
    runGet(cxt, params.tuple, joined);
}
