# micro-di-js
Minimalist dependency injection container for plain javascript

## Introduction
MicroDI is a simple dependency container for plain javascript projects or for for legacy code you want to inject dependencies with a almost zero impact on existing code. 
If you are on a typescript baseline probably this is not for you.

## Features
- Register types (like an interface or a class) or names
- Register by factory, concrete instances or generic objects
- Lazy instance creation
- Circular dependency detection
- Context accessors facility
- Mergeable containers


# Quick Start

### Registering dependencies
```javascript
// create a container
const di = new MicroDIContainer()

// register an Engine factory with name
di.register('myEngine', () => new Engine())

// register a Car with engine dependency
di.register('myCar', ctx => new Car(ctx.myEngine))

// N.B. ctx is same as di.context, it is passed to factories

// register another Car by type (like an interface)
di.register(ICar, ctx => new Car(ctx.myEngine))

// register a simple string
di.register('mainTitle', 'My great app')

// register an object based on dependecy
di.register('config', ctx => ({
    title: ctx.mainTitle,
    car: ctx.myCar
}))

// register by context accessor
di.context.mainTitle = 'My great app'
di.context.truck = ctx => new Truck(ctx.myEngine)

// container supports fluent register
di
  .register('a', () => new A())
  .register('b', () => new B())
  .register('c', () => new C())
```

### Resolving dependencies
```javascript
// using container resolve()
const car = di.resolve(ICar)
const car2 = di.resolve('myCar')
const config = di.resolve('config')
const title = di.resolve('mainTitle')
const truck = di.resolve('truck')

// using context accessor
const car = di.context.ICar
const car2 = di.context.car2
const config = di.context.config
const title = di.context.title
const truck = di.context.truck
```

### Merging containers
You can merge a container for more modularity.
```javascript
const mainContainer = new MicroDIContainer()

const module1 = new MicroDIContainer()
  .register('a', () => new A1())
  .register('b', () => new B1())
  .register('c', () => new C1())

const module2 = new MicroDIContainer()
  .register('x', () => new X())
  .register('y', () => new Y())
  .register('z', () => new Z())

mainContainer
    .mergeContainer(module1)
    .mergeContainer(module2)

const a = mainContainer.context.a
const y = mainContainer.context.y
```
