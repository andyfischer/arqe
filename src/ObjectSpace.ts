
import IDSource from './IDSource'

export default class ObjectSpace {
    name: string
    idSource: IDSource

    constructor(name: string) {
        this.idSource = new IDSource(name + '-');
    }

}
