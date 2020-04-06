
import IDSource from './IDSource'

interface Entity {
    attrs: { [name: string]: string }
}

export default class ObjectSpace {
    name: string
    idSource: IDSource

    objects: { [id: string]: Entity } = {}
    attributes: { [name: string]: boolean } = {}

    constructor(name: string) {
        this.idSource = new IDSource(name + '-');
    }

    addAttribute(name: string) {
        console.log(`added attribute ${name}.${name}`);
        this.attributes[name] = true;
    }

}
