const _ = require('lodash')

class MicroDIContainer {
    constructor() {
        this._factories = {}
        this._instances = {}
        this._dependencyStack = {}
        this._ctxProxy = contextProxy(this)
    }

    /**
     * @return {MicroDIContext}
     */
    get context() {
        return this._ctxProxy
    }

    /**
     * @return {string[]}
     */
    get registeredTypes() {
        return _.keys(this._factories)
    }

    /**
     * @param {Class<T>|string} type
     * @param {function(MicroDIContext): T} factory
     * @returns {MicroDIContainer}
     */
    register(type, factory) {
        const name = nameOf(type)
        this._factories[name] = factory
        return this
    }

    /**
     * @param {Class<T>|string} type
     * @param {T} instance
     * @returns {MicroDIContainer}
     */
    registerInstance(type, instance) {
        const name = nameOf(type)
        this._instances[name] = instance
        return this
    }

    /**
     * @param {MicroDIContainer} other 
     * @returns {MicroDIContainer}
     */
    mergeContainer(other) {
        _.merge(this._instances, other._instances)
        _.merge(this._factories, other._factories)
        return this
    }    

    /**
     * @param {T|string} type
     * @return {T}
     */
    resolve(type) {
        const name = nameOf(type)

        let instance = this._instances[name]
        if (instance) return instance

        const factory = this._factories[name]

        if (_.isNil(factory)) {
            throw new Error(`Instance not found for type: ${type}`)
        }

        if (_.isFunction(factory)) {
            if (!this._dependencyStack[name]) this._dependencyStack[name] = []
            const stack = this._dependencyStack[name]
            if (_.includes(stack, name)) {
                throw new Error(`Circular dependency detected for type: ${type}`)
            }
            stack.push(name)

            instance = factory(this.context)
            this._instances[name] = instance

            delete this._dependencyStack[name]
        } else {
            instance = factory
            this._instances[name] = instance
        }

        return instance
    }
}


/**
 * @param {MicroDIContainer} target 
 * @returns {Proxy<MicroDIContainer>} 
 */
function contextProxy(target) {
    return new Proxy(target, {
        get: (target, prop, receiver) => {
            return target.resolve(prop)
        },
        set: (target, prop, value) => {
            if (_.isFunction(value)) {
                target.register(prop, value)
            } else {
                target.registerInstance(prop, value)
            }
        }
    });
}

function nameOf(claz) {
    return _.isObject(claz) ? claz.name : claz
}

module.exports = { MicroDIContainer }