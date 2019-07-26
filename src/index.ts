
export { createExpressApp } from './express-promised-app'
export { print, printError, randomHex } from './utils'
export { loadMainSnapshot, Snapshot } from './framework'
export { AgentFramework } from './agents'

if (require.main === module) {
    require('./startup/main');
}

