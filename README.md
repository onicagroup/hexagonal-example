Hexagonal architecture is a pattern of software architecture involving abstracting away all I/O functionality to keep just your business logic at the core. It's an extension of the adapter pattern and dependency injection patterns used to abstract away environment specific dependencies to leave your business logic free of such distractions.

See:
https://blog.ndepend.com/hexagonal-architecture/
https://en.wikipedia.org/wiki/Dependency_injection
https://en.wikipedia.org/wiki/Adapter_pattern

Why Hexagonal?

When we write software, there are multiple areas of concern to deal with:

	1. The runtime environment (Spring, Express.js, AWS Lambda, Kubernetes…)
	2. Interfaces to external components (Database, web services, …)
	3. Domain specific data persistence (user details, data lake, telemetry data…)
	4. Application logic.

The hacker approach is to glob all of this together, like:

@see smooshed.ts

It's straight forward, brief, and all four concerns are smushed together. What's the problem?

Testability

A unit test must deal with the runtime's event structure, database interfacing, and application logic all in one test. Further, every handler is going to have to including runtime environment specifics. Every test that deals with the database has to deal with the specific database behavior, including all the permutations of the various ways it can fail. Code like this is why people skip unit testing entirely, while dealing with the most fragile code.

Why is this style fragile? Take a look at the database handling. Is robust database interfacing code ever that simple? Is this leaking connections? Where's the retry logic? This implementation is happy-path coding, and fragile. If you have to deal with all the details of robust database handling in every handler though, then it quickly overwhelms all other concerns. As problems pop up, a coder is likely to enhance the error handling in one function, while the others continue to have the same bugs.

Portability

--

Sounds all like a basic violation of the Don't Repeat Yourself (DRY) principal, doesn't it. Indeed DRY is at the heart of hexagonal architecture. It isn't the only approach. It isn't the only software architecture that deals with DRY, there's variations of layered architectures.

Whether it's the frontend Model/View/Controller (MVC) and variants, or the back-end layers of controller - service - repository, layering is a way of splitting concerns. From these layering approach, people often have a preference of coding "top down", or "bottom up". The idea here is a linear approach with what matters most, your application logic, somewhere in the middle of a linear flow. What does this look like?

    Request Handler -> Application Logic -> External Data

Whether you are coding top down or bottom up, your starting your focus on dealing with your environment specific concerns, and not at the core of what your application is.

--

Center Out approach

With hexagonal architecture, your application is at the center. That is where you begin, because it is what is important. It is also does not care about external concerns. Your application logic need not concern itself with whether it is called from a serverless function or a monolithic container. Nor is the application logic concern whether user data comes from a user pool, relational database, NoSQL database, or web service. 

Your business logic does need to interface without the outside environment though, and it does this through interfaces to adapters. Most high-level languages have interfaces, and that's what we're talking about here. Implementations of these interfaces are the adapters. So you have have a UserInterface, and an implementation that deals with wherever that user data is actually stored. Change your mind on where to store the data? Change the adapter, not the application logic.

The choice of word "hexagonal" is misleading, as it implies something special about the number 
six (sides of a hexagon). There isn't. You core business logic can have any number of interfaces.

In fact, drawn out this design looks more like a wheel and spokes:

TODO: Diagram

Let's get back to the why:

Code is now DRY. How do you interface with user data? Implement and test that once, with all the error control and retry logic needed to make it robust, for every use.

Application logic is concise. You deal with the business requirements, without environment details getting in the way. Test the logic, without all the permutations of external factors. Because external interfaces have a limited API, their mocks are easily reused between tests.

Application logic is portable. Want to write your applications as AWS cloud native? All the details of Lambdas, DynamoDB, and Cognito are outside of your application logic. Write new adapters and you're now running in Google Cloud's Kubernetes, Firebase, etc.. Even if you never plan for your application to run in another environment, do it anyway because it results in cleaner code and you never know what the future may bring.

@see other files

Explicit interfaces? Writing interfaces to only have one implementation violates the DRY principal. It reminds me of my C++ days, of having to write every function declaration twice: once for the implementation and once in the header. Actually separate out the interface on demand. Initially you'll only have one implementation of your interface, so there's no need. Depending on the language features and unit test framework, that on demand need could happen right away. For strongly typed languages like C# and Java, if your test framework doesn't have an ability to mock based on a concrete class, then you'll need an interface in order to make your test mocks. So be it, write explicit interfaces. For loosely typed languages though, a mock can be created simply by matching the "shape" of your implementation and thus an explicit interface isn't needed. If a second implementation is developed though, that's when the on-demand need comes into play to ensure that the implementations maintain the same API.

