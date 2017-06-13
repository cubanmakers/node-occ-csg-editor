const assert = require("assert");

class WidgetBase {

    constructor(name/*:string*/) {
        this.name = name;
        this._dependencies = {};
        this._id = null; // unattached entity
        this._widgetConnectors = [];
    }

    _addDependantEntity(entity) {
        assert(entity instanceof WidgetBase);
        assert(entity._id > 0, "_addDependantEntity: _id is missing : Entity must be registered");
        const found = this._dependencies[entity._id];
        assert(!found, "_addDependantEntity: should not find entity in dependencies");
        this._dependencies[entity._id] = entity;
    }

    _removeDependantEntity(entity) {
        assert(entity instanceof WidgetBase);
        const _shape = this._dependencies[entity._id];
        if (!_shape) {
            throw new Error("expecting entity to be found on _dependencies " + entity._id);
        }
        this._dependencies[entity._id] = null;
    }

    getDependantEntities() {
        if (!this._dependencies) {
            return [];
        }
        return Object.keys(this._dependencies).map(k => this._dependencies[k]).filter(e => !!e);
    }

    canDelete() {
        return this.getDependantEntities().length === 0;
    }

    dispose() {
        this._id = "disposed";
    }

    getWidgetConnectors() {
        return (this._widgetConnectors || []);
    }

}
exports.WidgetBase = WidgetBase;