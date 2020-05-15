# Hexagonal Architecture

## Overview

Hexagonal architecture is a pattern of software architecture involving abstracting away all input and output
functionality to keep just your business logic at the core.
It's an extension of the adapter pattern and dependency injection patterns used to abstract away
environment specific dependencies to leave your business logic free of such distractions.

See:
- [Hexagonal Architecture: What Is It and How Does It Work?](https://blog.ndepend.com/hexagonal-architecture/) 
- https://en.wikipedia.org/wiki/Dependency_injection
- https://en.wikipedia.org/wiki/Adapter_pattern

## About Application Architectures

When we write software, there are multiple areas of concern to deal with:

1. The runtime environment (Spring, Express.js, AWS Lambda, Kubernetes…)
2. Interfaces to external components (Database, web services, …)
3. Domain specific data persistence (user details, data lake, telemetry data…)
4. Application logic.

The hacker approach is to glob all of this together, like: [smushed.ts](src/bad/smushed.ts)

It's straight forward, brief, and all four concerns are smushed together. What's the problem?

### Testability

In the smushed implementation, a unit test must deal with the runtime's event structure, database interfacing, and application logic all in one test. 
Further, every handler is going to have to including runtime environment specifics. 
Every test that deals with the database has to deal with the specific database behavior, 
including all the permutations of the various ways it can fail. 
Code like this is why people skip unit testing entirely; ironically this is the most fragile code and thus in need of testing the most.

Why is this style fragile? Take a look at the database handling. Is robust database interfacing code ever that simple? 
Is this leaking connections? Where is the retry logic? This implementation is happy-path coding, and fragile. 
If you have to deal with all the details of robust database handling in every handler, 
then it quickly overwhelms all other concerns hiding what you are actually trying to accomplish.
As problems pop up, a coder is likely to enhance the error handling in one function
while the others continue to have the same bugs.

### Portability

Sounds all like a basic violation of the Don't Repeat Yourself (DRY) principal, doesn't it?
Indeed DRY is at the heart of hexagonal architecture. 
Hexagonal isn't the only software architecture that deals with DRY; variations of layered architectures also deal with DRY.
Whether it's the frontend Model/View/Controller (MVC) and variants, or the backend layers of controller/service/repository,
layering is a way of splitting concerns. 
From these layering approach, people often have a preference of coding "top down", or "bottom up". 
The idea here is a *linear* approach with what matters most, your application logic, somewhere in the middle of the flow. What does this look like?

    Request Handler -> Application Logic -> External Data

Whether you are coding top-down or bottom-up, 
you are starting your focus on dealing with your environment specific concerns and not at the core of what your application is.
Additionally, while layering helps to separate the concerns it leaves them highly coupled.

### Center Out approach

With hexagonal architecture, your application is at the center. 
That is where you begin, because it is what is important. 
Your application logic need not concern itself with whether it is called from a serverless function or a monolithic container. 
Nor is the application logic concern whether user data comes from a user pool, relational database, NoSQL database, or web service. 

Your business logic does need to *interface* with the outside environment though, and it does this through adapters.
Most high-level languages have interfaces, and that's what we're talking about here. 
Implementations of these interfaces are the adapters. So you have a "User Interface", 
and an implementation that deals with whereever that user data is actually stored. 
Change your mind on where to store the data? Change the adapter, *not* the application logic.

The choice of word "hexagonal" is misleading, as it implies something special about the number 
six (sides of a hexagon). The hexagon shape visually highlights the difference from layer architecture - it isn't just in one end and out the other.
Your application logic is in the center of the shape, and each side is an interface or a category of interfaces. 
You will have an many interfaces (or sides) as you need. 

<a href="https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)" style="text-align: center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/7/75/Hexagonal_Architecture.svg" height="480" width="480">
</a><br></br>Source: <a href="https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)">Wikipedia</a>


## Benefits of Hexagonal Architecture

*Code is now DRY.* 
Need to interface with user data? Implement and test that one time for every use, with all the error control and retry logic needed to make it robust.

*Application logic is concise.* 
You deal with the business requirements, without environment details getting in the way. 
Test the logic, without all the permutations of external factors. 
Because external interfaces have a limited API, their mocks are easily reused between tests.

*Application logic is portable.* 
Want to write your applications as AWS cloud native? 
All the details of Lambdas, DynamoDB, and Cognito are outside of your application logic. 
Write new adapters and you are now running in Google Cloud's Kubernetes, Firebase, etc.. 
Even if you never plan for your application to run in another environment, 
do it anyway because the effort results in cleaner code and you never know what the future may bring.

## No More Smush

Here's that [smushed](src/bad/smushed.ts) example rewritten with hexagonal architecture:
- [package.service.ts](src/good/package.service.ts) is the application logic - the center of the architecture!
- [package.repository.ts](src/good/package-repository.ts) handles data storage. This happens to use DynamoDB.
- [package.lambda.ts](src/good/package.lambda.ts) deals with adapting from AWS API Gateway and Lambda as the entry point.

Each has example unit tests with full coverage: [package.service.spec.ts](src/good/package.service.spec.ts), [package.repository.spec.ts](src/good/package-repository.spec.ts), [package.lambda.spec.ts](src/good/package.lambda.spec.ts)

## To Interface, or Not To Interface?

Notice that the example didn't define explicit Typescript `interface` types for the adapters.
Writing interfaces to only have one implementation violates the DRY principal. 
I'm reminded of the C/C++ days, when every function was declaration twice: once for the implementation and once in the header.

Separate out the interface from the adapter *on demand*.
Initially you'll only have one implementation of your interface, so there's no need. 
Depending on the language features and unit test framework, that on demand need could happen right away. 
For strongly typed languages like C# and Java, if your test framework doesn't have an ability to mock based on a concrete class, 
then you'll need an interface in order to make your test mocks. So be it, write explicit interfaces. 
For loosely typed languages though, a mock can be created simply by matching the "shape" of your implementation 
and thus an explicit interface isn't needed. If a second adapter is developed though, 
that's when the on-demand need comes into play to ensure that the implementations maintain the same API.

