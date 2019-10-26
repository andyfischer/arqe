
import { Scope } from '../scope'

export default function defRelation(scope: Scope, relationName: string) {
    scope.insert({relation: relationName}, []);
}
