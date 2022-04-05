const { describe, test } = require("@jest/globals");
const { MicroDIContainer } = require("../src/microdi");

describe('MicroDIContainer', () => {
    const di = new MicroDIContainer()

    test('register', () => {
        di.register(IFoo, () => new Foo())
            .register('toto', () => 'TOTO')
            .register('a', ctx => new A(ctx.b))
            .register('c', () => new C())
            .register('d', () => 'I am d')
            .register('b', ctx => new B(ctx.c, ctx.d))

        const c = di.context
        console.log(di.context.toto);
    })
});

/** @interface */
class IFoo {
    hi() { }
}

/** @implements {IFoo} */
class Foo {
    hi() { return 'Hi!' }
}

class A extends IFoo {
    constructor(b) {
        super()
        this.b = b
    }

    hi() { return `Hi from A, and ${this.b}` }
}

class B extends IFoo {
    constructor(c, d) {
        super()
        this.c = c
        this.d = d
    }

    hi() { return `Hi from B, and ${this.c} and ${this.d}` }
}

class C {
    constructor() { }
}
