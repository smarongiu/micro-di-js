const _ = require('lodash')

class MicroDIC {
  constructor() {
    this._factories = {}
    this._instancies = {}
    this._dependencyStack = {}
    this._ctxProxy = new Proxy(this, {
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
    })
  }

  /**
   * @return {Object<string,any>}
   */
  get context() {
    return this._ctxProxy
  }

  get registeredTypes() {
    return _.keys(this._factories)
  }

  /**
   * @param {Class<T>|string} type
   * @param {function(): T} factory
   */
  register(type, factory) {
    const name = nameOf(type)
    this._factories[name] = factory
  }

  /**
   * @param {Class<T>|string} type
   * @param {T} instance
   */
  registerInstance(type, instance) {
    const name = nameOf(type)
    this._instancies[name] = instance
  }

  /**
   * @param {T|string} type
   * @return {T}
   */
  resolve(type) {
    const name = nameOf(type)

    let instance = this._instancies[name]
    if (instance) return instance

    const factory = this._factories[name]
    if (factory) {
      if (!this._dependencyStack[name]) this._dependencyStack[name] = []
      const stack = this._dependencyStack[name]
      if (_.includes(stack, name)) {
        throw new Error(`Circular dependency detected for type: ${type}`)
      }
      stack.push(name)

      instance = factory()
      this._instancies[name] = instance

      delete this._dependencyStack[name]
      return instance
    }

    throw new Error(`Instance not found for type: ${type}`)
  }
}

function nameOf(claz) {
  return _.isObject(claz) ? claz.name : claz
}









const dic = new MicroDIC()

/** @interface */
class IPinco {
  ciao() {}
}

/** @implements {IPinco} */
class Pinco {
  ciao() { console.log('ciao pinco') }
}

class A extends IPinco {
  constructor(b) {
    super()
    this.b = b
  }

  ciao() { console.log('ciao A', this.b) }
}

class B extends IPinco {
  constructor(c, d) {
    super()
    this.c = c
    this.d = d
  }

  ciao() { console.log('ciao B', this.c, this.d) }
}

class C {
  constructor() {
  }
}

const c = dic.context
dic.register(IPinco, () => new Pinco())
dic.register('toto', () => 'TOTO')
dic.register('a', () => new A(c.b))
dic.register('c', () => new C())
dic.register('d', () => 'io sono d')
dic.register('b', () => new B(c.c, c.d))
c.x = () => 'je suis X'

c.c2 = () => new C()
c.c3 = new C()

console.log(c.a)
c.a.ciao()

console.log(dic.registeredTypes)
