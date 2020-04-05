
import ObjectSpace from './ObjectSpace'
import GraphListener from './GraphListenerV3'
import Relation from './Relation'

export default class ObjectColumnsSpace implements GraphListener {
    columns: { [name: string]: ObjectSpace } = {}

    onRelationCreated(rel: Relation) {
        console.log('ocs saw create: ', rel.stringify());
    }

    onRelationUpdated(rel: Relation) {
        console.log('ocs saw update: ', rel.stringify());
    }

    onRelationDeleted(rel: Relation) {
        console.log('warning: ObjectColumnsSpace does not support relation deletion');
    }
}
