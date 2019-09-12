
import ScopeValue from './ScopeValue'

const MissingValue = Symbol('missing');

export default class Scope {
    parent?: Scope

    values: { [name: string]: ScopeValue }

    constructor() {
    }

    getValueOpt(name: string, defaultValue: any) {
        if (this.values[name])
            return this.values[name].current;

        if (this.parent)
            return this.parent.getValueOpt(name, defaultValue);
    }

    getValue(name: string) {
        const found = this.getValueOpt(name, MissingValue);

        if (found === MissingValue)
            throw new Error('value not found for: ' + name);

        return found;
    }

    modify(name: string, callback: (val: any) => any) {
    }
}
