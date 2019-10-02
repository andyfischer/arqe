
import Scope from './Scope'

export default function scopeFromObject(object: { [key: string]: any }) {
    const scope = new Scope();
    for (const key in object) {
        scope.createSlot(key);
        scope.set(key, object[key]);
    }
    return scope;
}
