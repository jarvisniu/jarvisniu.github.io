AngularJS
=========

From Wikipedia, the free encyclopedia


**AngularJS**, commonly referred to as **Angular**, is an open-source web application framework maintained by Google and a community of individual developers and corporations to address many of the challenges encountered in developing single-page applications. Its goal is to simplify both development and testing of such applications by providing a framework for client-side model–view–controller (MVC) architecture, along with components commonly used in rich internet applications.
The library works by first reading the HTML page, which has embedded into it additional custom tag attributes. Those attributes are interpreted as directives telling Angular to bind input or output parts of the page to a model that is represented by standard JavaScript variables. The values of those JavaScript variables can be manually set within the code, or retrieved from static or dynamic JSON resources.


Philosophy
----------

AngularJS is built around the belief that declarative programming should be used for building user interfaces and connecting software components, while imperative programming is better suited to defining an application's business logic.[1] The framework adapts and extends traditional HTML to present dynamic content through two-way data-binding that allows for the automatic synchronization of models and views. As a result, AngularJS de-emphasizes DOM manipulation with the goal of improving testability and performance.
AngularJS's design goals include:
Decouple DOM manipulation from application logic. This difficulty is dramatically affected by the way the code is structured.
Decouple the client side of an application from the server side. This allows development work to progress in parallel, and allows for reuse of both sides.
Provide structure for the journey of building an application: from designing the UI, through writing the business logic, to testing.
Angular implements the MVC pattern to separate presentation, data, and logic components. Using dependency injection, Angular brings traditionally server-side services, such as view-dependent controllers, to client-side web applications. Consequently, much of the burden on the server can be reduced.

Scope
-----

Angular uses the term "Scope" to mean something different than what it usually means in computer science.
Scope in computer science describes when in the program a particular binding is in effect. The ECMA-262 specification defines scope as a lexical environment that defines the environment in which a Function object is executed[2] in a similar way as scope is defined in lambda calculus[3]
In Angular, "scope" is a certain kind of object[4] that itself can be in scope or out of scope in any given part of the program, following the usual rules of variable scope in JavaScript like any other object.[5] When the term "scope" is used below, it means the Angular scope object and not the variable scope.

Bootstrapper
------------

The tasks performed by the AngularJS bootstrapper occur in three phases[6] after the DOM has been loaded:
Creation of a new Injector
Compilation of the directives that decorate the DOM
Linking of all directives to scope
AngularJS directives allow the developer to specify custom and reusable HTML-like elements and attributes that define data bindings and the behavior of presentation components. Some of the most commonly used directives are:
ng-app
Declares the root element of an AngularJS application, under which directives can be used to declare bindings and define behavior.
ng-bind
Sets the text of a DOM element to the value of an expression. For example, <span ng-bind="name"></span> will display the value of ‘name’ inside the span element. Any changes to the variable ‘name’ in the application's scope are reflected instantly in the DOM.
ng-model
Similar to ng-bind, but establishes a two-way data binding between the view and the scope.
ng-model-options
Allows tuning how model updates are done.
ng-class
Allows class attributes to be dynamically loaded.
ng-controller
Specifies a JavaScript controller class that evaluates HTML expressions.
ng-repeat
Instantiate an element once per item from a collection.
ng-show & ng-hide
Conditionally show or hide an element, depending on the value of a boolean expression. Show and hide is achieved by setting the CSS display style.
ng-switch
Conditionally instantiate one template from a set of choices, depending on the value of a selection expression.
ng-view
The base directive responsible for handling routes that resolve JSON before rendering templates driven by specified controllers.
ng-if
Basic if statement directive which allow to show the following element if the conditions are true. When the condition is false, the element is removed from the DOM. When true, a clone of the compiled element is re-inserted
ng-aria
A module for accessibility support of common ARIA attributes.
ng-animate
A module provides support for JavaScript, CSS3 transition and CSS3 keyframe animation hooks within existing core and custom directives..

Two-way data binding
--------------------

AngularJS' two-way data binding is its most notable feature, and it reduces the amount of code written[citation needed] by relieving the server backend of templating responsibilities. Instead, templates are rendered in plain HTML according to data contained in a scope defined in the model. The $scope service in Angular detects changes to the model section and modifies HTML expressions in the view via a controller. Likewise, any alterations to the view are reflected in the model. This circumvents the need to actively manipulate the DOM and encourages bootstrapping and rapid prototyping of web applications.[7] AngularJS detects changes in models by comparing the current values with values stored earlier in a process of dirty-checking, unlike Ember.js and Backbone.js which trigger listeners when the model values are changed.[8]

Chrome plugin
-------------

In July 2012, the Angular team built a plugin for the Google Chrome browser called Batarang,[9] that improves the debugging experience for web applications built with Angular. The extension aims to allow for easy detection of performance bottlenecks and offers a GUI for debugging applications.[10] The extension is not compatible with recent releases (after v1.2.x) of Angular.[11]

Development history
-------------------

AngularJS was originally developed in 2009 by Miško Hevery and Adam Abrons[12] at Brat Tech LLC[13] as the software behind an online JSON storage service, that would have been priced by the megabyte, for easy-to-make applications for the enterprise. This venture was located at the web domain "GetAngular.com",[13] and had a few subscribers, before the two decided to abandon the business idea and release Angular as an open-source library.[citation needed]
Abrons left the project, but Hevery, who works at Google, continues to develop and maintain the library with fellow Google employees Igor Minár and Vojta Jína.[14]

Releases
--------

As of March 17, 2015, release 1.3.15 (code name locality-filtration) is the current stable version and 1.4.0-rc.0 (code name smooth-unwinding) is the current unstable beta release available since April 10, 2015.
The code names are super-power related, composed of two hyphen-joined words, should sound “fun / crazy / cool”, and are publicly submitted and voted by users.[15]

### Legacy browser support

Versions 1.2 and later of AngularJS do not support Internet Explorer versions 6 or 7.[16] Versions 1.3 and later of AngularJS dropped support for Internet Explorer 8.[17]

Comparisons to Backbone.js
--------------------------

### Data-binding

The most prominent feature that separates the two libraries is in the way models and views are synchronized. Whereas AngularJS supports two way data-binding, Backbone.js relies heavily on boilerplate code to harmonize its models and views.[18]

### REST

Backbone.js communicates well with RESTful backends. A very simple use of REST APIs is also available with AngularJS using the $resource service. AngularJS also provides a $http service which is more flexible, connecting to remote servers either through a browser's XMLHttpRequest object or via JSONP.

### Templating

AngularJS templating uses a combination of customizable HTML tags and expressions. Backbone.js ships with underscore.js's utility function template() and also integrates with different templating engines such as Mustache.[18]

See also
--------

- MEAN (software bundle)
- Ember.js
- Backbone.js
- Knockout.js

References
----------

1. "What Is Angular?". Retrieved 12 February 2013.
2. "Annotated ECMAScript 5.1, Section 10.2 Lexical Environments". Retrieved 2015-01-03.
3. Barendregt, Henk; Barendsen, Erik (March 2000), Introduction to Lambda Calculus


Further reading
---------------

- Green, Brad; Seshadri, Shyam (March 22, 2013). AngularJS (1st ed.). O'Reilly Media. p. 150. ISBN 978-1449344856.
- Kozlowski, Pawel; Darwin, Peter Bacon (August 23, 2013). Mastering Web Application Development with AngularJS (1st ed.). Packt Publishing. p. 372. ISBN 978-1782161820.
- Ruebbelke, Lukas (January 1, 2015). AngularJS in Action (1st ed.). Manning Publications. p. 325. ISBN 978-1617291333.

External links
--------------

- Wikimedia Commons has media related to AngularJS.
- Official website
- AngularJS 2.0 Preview
- AngularJS Modules Repository
- Built with AngularJS
- AngularJS at Google Groups
- AngularJS at Google+
- Batarang Chrome plugin
- NG-CONF 2014 Videos and Slides
- NG-EUROPE 2014 Videos and Slides
- NG-CONF 2015 Videos and Slides
- AngularJS Developer Community
- Comparison of AngularJS application starters