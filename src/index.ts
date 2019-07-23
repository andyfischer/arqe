
export { createExpressApp } from './express-promised-app'
export { print, randomHex } from './utils'
export { loadMainSnapshot } from './framework'

if (require.main === module) {
    require('./startup/main');
}
