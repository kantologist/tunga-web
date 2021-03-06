# Contributing
These are the general guidelines to follow when contributing to Tunga web client development.

* Follow the [readme](https://github.com/tunga-io/tunga-web/blob/master/readme.md) for instructions on setting up your development environment.
* Follow industry best practices for [ES6](http://es6-features.org/), [React.js](https://reactjs.org/) and [Redux](https://redux.js.org/) for issues not addressed in this document.

## Sending a Pull Request

In general, the contribution workflow looks like this:

* Choose an open issue from the [Issue tracker](https://github.com/tunga-io/tunga-web/issues).
* Fork the repo.
* Create a new feature branch based off the `develop` branch.
* Make sure all tests pass and there are no linting errors.
* Submit a pull request, referencing any issues it addresses.

Please try to keep your pull request focused in scope and avoid including unrelated commits.

After you have submitted your pull request, we'll try to get back to you as soon as possible. We may suggest some changes or improvements.

## Coding Guide
Tunga web client is built on a core of [ES6](http://es6-features.org/), [React.js](https://reactjs.org/), [Redux](https://redux.js.org/) and [React Router](https://github.com/ReactTraining/react-router) and uses [Webpack](https://webpack.js.org/) as the module bundler.

Follow the following coding guidelines when contributing:

* For security, keep sensitive data (e.g passwords, API keys and OAuth secrets) out of the repo.
* All source code goes into `/src`
* Follow the style guide defined in [.editorconfig](https://github.com/tunga-io/tunga-web/blob/master/.editorconfig)
* Leverage [ES6/ES2015](https://babeljs.io/docs/learn-es2015/) features in your code
* index.ejs is a template, refrain from editing (except when adding global libraries served via a CDN)
* Actions, Reducers, Components, Containers and Routes (top level React Router components) go into respective - and appropriately named - directories.
* Use [Redux](https://redux.js.org/) to manage app state and data flow as much as possible.
* Keep most app logic out of app.js and in respective reducers and components.
* Use containers only to connect to Redux store and pass on the state as props to children.
* Use \_\_DEV\_\_ and \_\_PRODUCTION\_\__ predefined globals to filter code the should only be added in development and testing
* Use WebPack's [DefinePlugin](https://webpack.js.org/plugins/define-plugin/) to define global constants e.g public keys
* Import modules using either ES6 imports
```
import MyAction from 'actions/MyAction';
```

Or CommonJS imports
```
MyAction = require('actions/MyAction');
```

* Import style sheets by adding code similar to this to app.js
```
import 'css/style.css';
import 'css/style.less';
```

* Importing non NPM scripts by adding code similar to this to app.js
```
import "script!file.js";
```
* Leverage [Less](http://lesscss.org/) for leaner CSS styling and avoid inline styles in JSX
* Use [axios](https://github.com/mzabriskie/axios) for networking

Thank you for contributing!
