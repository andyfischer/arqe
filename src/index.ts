
export { createExpressApp } from './express-promised-app'
export { print, printError, randomHex } from './utils'
export { declareCommand, declareReducer, loadMainSnapshot, Snapshot } from './framework'
export { AgentFramework } from './agents'
export { Query, parseQuery } from './parse-query'

if (require.main === module) {
    require('./startup/main');
}
