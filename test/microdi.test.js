const { describe, test, beforeEach } = require("@jest/globals");
const { MicroDIContainer } = require("../src/microdi");

describe('MicroDIContainer: basic tests', () => {
    let di

    beforeEach(() => {
        di = new MicroDIContainer()
    })

    test('register interface by factory', () => {
        di.register(IFoo, () => new Foo())
        const x = di.resolve(IFoo)
        expect(x).toBeInstanceOf(Foo)
        expect(x.hi()).toEqual('Hi!')
    })

    test('register named factory', () => {
        di.register('c', () => new C())
        expect(di.resolve('c')).toBeInstanceOf(C)
    })

    test('register named factory with simple dependency', () => {
        di.register('depC', () => new C())
        di.register('depA', ctx => new A(ctx.depC))
        
        expect(di.resolve('depA')).toBeInstanceOf(A)
        expect(di.resolve('depA').b).toBe(di.resolve('depC'))
    })

    test('register a named string', () => {
        di.register('title', () => 'MyTitle')
        expect(di.resolve('title')).toEqual('MyTitle')
    })

    test('register a named object', () => {
        di.register('aDep', () => ({ title: 'test', count: 42 }))
        expect(di.resolve('aDep').title).toEqual('test')
        expect(di.resolve('aDep').count).toEqual(42)
    })

    test('register a circular dependency should throw on resolve', () => {
        di.register('x', ctx => new A(ctx.x))
        expect(() => di.resolve('x')).toThrow()
    })

    test('resolve a not registered type should throw', () => {
        expect(() => di.resolve('unkown')).toThrow()
    })

    test('merge another container', () => {
        di.register('title', () => 'Hey')

        const module1 = new MicroDIContainer()
            .register('text1', () => 'module1 text')

        di.mergeContainer(module1)

        expect(di.context.title).toEqual('Hey')
        expect(di.context.text1).toEqual('module1 text')
    })
});


describe('MicroDIContainer: using context', () => {
    let di, ctx

    beforeEach(() => {
        di = new MicroDIContainer()
        ctx = di.context
    })

    test('register named factory', () => {
        ctx.c = () => new C()
        expect(ctx.c).toBeInstanceOf(C)
    })

    test('register named factory with simple dependency', () => {
        ctx.depC = () => new C()
        ctx.depA = () => new A(ctx.depC)
        
        expect(ctx.depA).toBeInstanceOf(A)
        expect(ctx.depA.b).toBe(ctx.depC)
    })

    test('register a named string', () => {
        di.register('title', () => 'MyTitle')
        expect(di.resolve('title')).toEqual('MyTitle')
    })

    test('register a named object', () => {
        ctx.aDep = () => ({ title: 'test', count: 42 })
        expect(ctx.aDep.title).toEqual('test')
        expect(ctx.aDep.count).toEqual(42)
    })

    test('register a circular dependency should throw on resolve', () => {
        ctx.x = ctx => new A(ctx.x)
        expect(() => ctx.x).toThrow()
    })

    test('get a not registered type should throw', () => {
        expect(() => ctx.unkown).toThrow()
    })
});


describe('MicroDIContainer: real-life container case', () => {
    let di = new MicroDIContainer(), ctx
    
    beforeAll(() => {
        di.register('depA', ctx => new A(ctx.depB, 'Lucy'))
        di.register('depB', ctx => new B(ctx.depC, ctx.myInfo))
        di.register('depC', () => new C())
        di.register('myInfo', ctx => ({ name: ctx.myName, title: 'Test' }))
        di.register('myName', 'TestMe')
        ctx = di.context
    })

    test('resolve myName', () => {
        expect(ctx.myName).toEqual('TestMe')
    })

    test('resolve myInfo', () => {
        expect(ctx.myInfo).toEqual({
            name: 'TestMe',
            title: 'Test'
        })
    })

    test('resolve depC', () => {
        expect(ctx.depC).toBeInstanceOf(C)
    })

    test('resolve depB', () => {
        expect(ctx.depB).toBeInstanceOf(B)
        expect(ctx.depB.c).toBe(ctx.depC)
        expect(ctx.depB.d).toBe(ctx.myInfo)
    })

    test('resolve depA', () => {
        expect(ctx.depA).toBeInstanceOf(A)
        expect(ctx.depA.b).toBe(ctx.depB)
        expect(ctx.depA.name).toBe('Lucy')
    })
})




/** @interface */
class IFoo {
    hi() { }
}

/** @implements {IFoo} */
class Foo {
    hi() { return 'Hi!' }
}

class A extends IFoo {
    constructor(b, name) {
        super()
        this.b = b
        this.name = name
    }

    hi() { return `Hi from ${this.name}!` }
}

class B extends IFoo {
    constructor(c, d) {
        super()
        this.c = c
        this.d = d
    }

    hi() { return `Hi from B!` }
}

class C {}
