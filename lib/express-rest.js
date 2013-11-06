//    Express REST
//    ------------

//    This library is intended for use solely on NodeJS with Express.  Its purpose it to rapidly create REST APIs on
//    server-side resources, specifically Backbone Collection objects.  Further, it provides a structure
//    with which to create complex, reusable tiers within a three-tier node stack.


(function (undefined) {
	var root = this,
		hasModule = (typeof module !== 'undefined' && module.exports),

		// Dependencies

		_ = (typeof root._ !== 'undefined') ? root._ : require('lodash'),
		Backbone = (typeof root.Backbone !== 'undefined') ? root.Backbone : require('backbone'),
		path = (typeof root.path !== 'undefined') ? root.path : require('path'),
		Q = (typeof root.q !== 'undefined') ? root.q : require('q'),

		// Constants

		VERSION = '1.0.0',
		CONTROLLER_METHODS = ['list', 'get', 'insert', 'update', 'delete'],
		HTTP_RESPONSE = {
			OK: 200,
			OK_CREATED: 201,
			OK_NOCONTENT: 204,
			BAD_REQUEST: 400,
			NOTFOUND: 404,
			CONFLICT: 409,
			FATAL: 500
		};

	// Global namespace
	// All child objects will hang off of this

	var ExpressREST = {};

	// ExpressREST.Controller
	// ----------------------

	// The primary purpose of the controller layer is to bind to the Express app's endpoints on the appropriate
	// verbs and locations for a full REST API.  It's not the place for business logic or data manipulation, but
	// instead should be used to do custom bindings, transformations, provider aggregation, etc.  The default
	// case is calling into the provider on the appropriate provider API methods.

	var Controller = ExpressREST.Controller = function (options) {
		var defaultOptions = {};

		this.options = _.extend(defaultOptions, options);

		// Set provider on `this` if defined in the options.
		_.extend(this, _.pick(options || {}, 'provider'));
		this.initialize.apply(this, arguments);
	};

	// **Controller API**
	// This is the API exposed on the controller object.

	var ControllerAPI = {
		// **initialize** - no-op by default, override
		initialize: function () {},

		// **`bind`** - Attach the controller to the given app's endpoint.  An ID will be appended on to
		// the end when appropriate for you, so it should be excluded from the URL.  However, if the endpoint
		// being bound to is nested, all previous URL params can be specified.  For example, you could bind
		// via `controller.bind(app, 'api/parent/:parentId/child')`.

		bind: function (app, endpoint) {
			if (!endpoint || !_.isString(endpoint)) {
				throw 'Endpoint must be defined and a string.';
			}

			// First unbind everything at this endpoint to be sure of no duplicate bindings conflicting.
			this.unbind(app, endpoint);

			// Create contextualized functions
			var contextControllerWorkflow = controllerWorkflow.bind(this);

			// Bind to all the Express verbs with the appropriate controller calls
			app.get(endpoint, contextControllerWorkflow(this.list)); //contextControllerWrapper(contextRequired(this.list)));
			app.get(createRouteForVerb(endpoint, 'get'), contextControllerWorkflow(this.get)); //contextControllerWrapper(contextRequired(this.get)));
			// Here the default response of 200 is overridden to be a 201 Created
			app.post(createRouteForVerb(endpoint, 'post'), contextControllerWorkflow(this.insert, HTTP_RESPONSE.OK_CREATED)); //contextControllerWrapper(contextRequired(this.insert), HTTP_RESPONSE.OK_CREATED));
			app.put(createRouteForVerb(endpoint, 'put'), contextControllerWorkflow(this.update)); //contextControllerWrapper(contextRequired(this.update)));
			app.delete(createRouteForVerb(endpoint, 'delete'), contextControllerWorkflow(this.delete, null, true));//contextControllerWrapper(this.delete));

			return this;
		},

		// **`unbind`** - Unbind will cycle through all of the app's bindings at the given endpoint and
		// remove all of them.

		unbind: function (app, endpoint) {
			if (!endpoint || !app) {
				throw 'No endpoint found to unbind.';
			}

			var verbs = ['get', 'post', 'put', 'delete'];
			if (app.routes) {
				verbs.forEach(function (verb) {
					// Find the express bindings
					var routeList = app.routes[verb.toLowerCase()];
					if (routeList && routeList.length > 0) {
						for (var i = routeList.length - 1; i > -1; i--) {
							var path = routeList[i].path;
							// If the endpoint is exactly the path (regardless of trailing slash) or has the right format
							// for the given verb, it should be removed.
							if (path === endpoint || path === endpoint + '/' || path === createRouteForVerb(endpoint, verb)) {
								routeList.splice(i, 1);
							}
						}
					}
				});
			}
		}
	};

	// This function will bind the default handler on each http method.  Those methods:
	// **GET** - calls provider list
	// **GET/:id** - calls provider get
	// **POST** - calls provider insert
	// **PUT** - calls provider update
	// **DELETE** - calls provider delete, returns nothing

	CONTROLLER_METHODS.forEach(function (method) {
		ControllerAPI[method] = APIWrapper(method);
	});

	// ExpressREST.Provider
	// --------------------

	// The provider's main job is to map from the controller calls into the appropriate Backbone collection
	// operation that isn't necessarily one-to-one.  For example, a call to `PUT` will by default call the
	// provider's `update` method which will call `data.get(id).set(changes)`.

	var Provider = ExpressREST.Provider = function (options) {
		var defaultOptions = {};

		this.options = _.extend(defaultOptions, options);

		// Set collection on `this` if defined in the options.
		_.extend(this, _.pick(options || {}, 'collection'));
		this.initialize.apply(this, arguments);
	};

	// **Provider API**
	// *Note:* All provider endpoints return whatever the collection returns, which in the context of a Backbone
	// Collection is a collection itself.  This need not have `.toJSON()` called on it because Express calls
	// JSON.stringify() on it prior to returning to the client which will convert the object into JSON.

	var ProviderAPI = {
		// **initialize** - no-op by default, override
		initialize: function () {},

		// **list** - Get the entire collection
		list: function () {
			return this._getCollection.apply(this, arguments);
		},

		// **get** - Retrieve a specific model from the collection
		get: function (id) {
			// Remove the id from the arguments and pass the rest to _getCollection
			var args = Array.prototype.slice.call(arguments, 1);
			return this._getCollection.apply(this, args).get(id);
		},

		// **insert** - Add a new model to the collection with a new ID
		insert: function (body) {
			// Remove the body from the arguments and pass the rest to _getCollection
			var args = Array.prototype.slice.call(arguments, 1);
			var collection = this._getCollection.apply(this, args);

			// Get the next ID for this collection
			var nextId = this._nextId(collection);

			// Set the ID onto the model that's going to be created
			body[collection.model.prototype.idAttribute] = nextId;

			// Let the collection construct the model.  This is primarily so that validation
			// can be triggered on the collection when it fails to add with minimal effort.
			collection.add(body);

			// Want to return the same instance of the model that got added to the collection,
			// so fetch it out of the collection for return to the caller.
			return collection.get(nextId);
		},

		// **update** - Update the model with the id with the attributes in body via merge
		update: function (body, id) {
			// Remove the id and the body from the arguments and pass the rest to _getCollection
			var args = Array.prototype.slice.call(arguments, 2);
			var model = this._getCollection.apply(this, args).get(id);

			if (model) {
				// If the model is found, make a change via set, which will merge the attributes
				model.set(body);
			}

			return model;
		},

		// **delete** - Delete the model with the matching id
		delete: function (id) {
			// Remove the id from the arguments and pass the rest to _getCollection
			var args = Array.prototype.slice.call(arguments, 1);
			var collection = this._getCollection.apply(this, args);
			collection.remove(collection.get(id));
			// Delete should never return a result, regardless of what the collection does.
			return;
		},

		// Utility Methods
		// ---------------

		// Structured throw that will format an error message that the controller can understand.
		throw: function (type, field, message) {
			throw {
				message: "Provider Error",
				name: "Provider Error",
				value: {
					code: HTTP_RESPONSE[type.toUpperCase()] || HTTP_RESPONSE.FATAL,
					body: {
						field: field,
						message: message
					}
				}
			};
		},

		// Private Methods
		// ---------------

		// Retrieve the collection.  Checks if it's a function and uses its result if it is.
		// Analogous to `_.result()` except it applies on all arguments, which `_.result` does not
		_getCollection: function () {
			if (_.isFunction(this.collection)) {
				return this.collection.apply(this, arguments);
			}
			return this.collection;
		},

		// Generates the next ID for the given collection (or this.collection)
		_nextId: function (collection) {
			collection = collection || this.collection;
			// Set useGuidId to true to auto-generate GUIDs for newly created models.
			if (this.options && this.options.useGuidId) {
				return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
					var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
					return v.toString(16);
				});
			}
			// Default case is to generate numerical ids
			else {
				var max = collection.max(function (model) {
					return model.id || 0;
				});
				return (max && max.id) ? max.id + 1 : 1;
			}
		}
	};


	// Mixins

	_.extend(Controller.prototype, ControllerAPI);
	_.extend(Provider.prototype, ProviderAPI);

	Controller.extend = Provider.extend = extend; // Adding Backbone's extend function


	// ExpressREST.Model
	// -----------------

	// This is a Backbone Model with one single difference: any changes made to it will be reflected
	// on the object with which it was created, if given.  So `new ExpressREST.Model(sourceobj)` will
	// change `sourceobj` when the model is updated.  This type was run through Backbone 1.0's unit tests
	// and pass all save one (the one that checks the source was unmodified).

	var Model = ExpressREST.Model = Backbone.Model.extend({
		constructor: function(attributes, options) {
			var defaults;
			var attrs = attributes || {};
			options || (options = {});
			this.cid = _.uniqueId('c');

			// Modification to set this.attributes to the object passed
			this.source = this.attributes = attrs;
			_.extend(this, _.pick(options, ['url', 'urlRoot', 'collection']));

			if (options.parse) {
				var parsedAttrs = this.parse(attrs, options);
				if (parsedAttrs !== attrs) {
					_.each(attrs, function (v, k) {
						delete attrs[k];
					});
					_.extend(attrs, parsedAttrs);
				}
			}
			options._attrs = _.extend({}, (options._attrs || attrs));
			// End modification

			if (defaults = _.result(this, 'defaults')) {
				attrs = _.defaults({}, attrs, defaults);
			}
			this.set(attrs, options);
			this.changed = {};
			this.initialize.apply(this, arguments);
		}
	});

	// ExpressREST.Collection
	// ----------------------
	//
	// This is a Backbone Collection with the difference that any changes to the collection will
	// update the source array.  The changes only go in one direction.  Modifying the source array
	// will not add things to the collection, naturally.  All Backbone.Collection unit tests pass.

	var Collection = ExpressREST.Collection = Backbone.Collection.extend({
		constructor: function (source) {
			this.source = source || [];
			Backbone.Collection.apply(this, arguments);
		},

		set: function () {
			var result = Backbone.Collection.prototype.set.apply(this, arguments);
			this.updateSource();
			return result;
		},

		remove: function () {
			var result = Backbone.Collection.prototype.remove.apply(this, arguments);
			this.updateSource();
			return result;
		},

		updateSource: function () {
			// Empty out the array
			this.source.length = 0;

			// Repopulate the array with the objects in the collection.  Might be same as were in
			// there before, but this is a sure-fire way to make all removals and whatever else reflected.
			this.each(function (model) {
				this.source.push(model.source);
			}, this);
		},

		model: Model
	});

	// Controller Helpers
	// ------------------

	// Will create an ID from an endpoint path.  Looks at the last whack for the resource name.
	function createIdName(endpoint) {
		var split = endpoint.split('/');

		// If there's no whack, this will be [endpoint] so just take endpoint
		var resource = split.pop();

		// If the route has a trailing whack (`root/`) resource will be undefined, so step back one more.
		if (!resource) {
			resource = split.pop();
		}

		// Combine resource name with the route param key (:) and 'Id'
		return ':' + resource + 'Id';
	}

	// Converts from a verb like "list" to the appropriate endpoint path.  Appends on IDs when appropriate.
	function createRouteForVerb(endpoint, verb, base) {
		var route;
		base = base || '';

		if (base) {
			base = path.join(base, '/');
		}

		switch (verb.toLowerCase()) {
		case 'list':
			route = path.join(base, endpoint);
			break;
		case 'get':
			route = path.join(base, endpoint, '/', createIdName(endpoint));
			break;
		case 'post':
			route = path.join(base, endpoint);
			break;
		case 'put':
			route = path.join(base, endpoint, '/', createIdName(endpoint));
			break;
		case 'delete':
			route = path.join(base, endpoint, '/', createIdName(endpoint));
			break;
		}
		return route;
	}

	// Returns with the appropriate response code when successful based on content.
	function successfulResponseCode(resp) {
		return resp ? HTTP_RESPONSE.OK : HTTP_RESPONSE.OK_NOCONTENT;
	}

	// Default API wrapper.
	function APIWrapper(method) {
		return function wrapper (req) {
			// Sort the parameters in the order they occur in the route
			var params = orderedParams(req);

			// Conditionally prepend the body to the call to the provider
			if (method === 'insert' || method === 'update') {
				params.unshift(req.body);
			}

			// Call the provider with the parameters applied on in order provider.put(body, param1 [, param2, param3])
			var provider = _.result(this, 'provider');
			var result = provider[method].apply(provider, params);

			// Delete should never return anything, otherwise return the result
			return method !== 'delete' ? result : undefined;
		};
	}

	// Takes all the params on the request and puts them in order based on the keys.  First route param is put last.
	function orderedParams(req) {
		var orderedParams = [];
		if (req && req.route && req.route.keys) {
			// Apply params in reverse order
			for (var i = req.route.keys.length - 1; i >= 0; i--) {
				var key = req.route.keys[i];
				orderedParams.push(req.params[key.name]);
			}
		}
		return orderedParams;
	}

	function required (noResponseRequired) {
		return function (result) {
			if (noResponseRequired || (!_.isUndefined(result) && result !== null)) {
				return result;
			}
			return Q.reject({
				value: {
					code: HTTP_RESPONSE.NOTFOUND,
					body: undefined
				}
			});
		};
	}

	function controllerWorkflow(fn, successCode, noResponseRequired) {
		var self = this;
		return function (req, res) {
			var args = arguments;
			return Q.invoke(function () {
					var result = fn.apply(self, args);
					return result;
				})
				.then(required(noResponseRequired))
				.then(function (result) {
					res.set('Content-Type', (_.isString(result) ? 'text/plain' : 'application/json'));
					res.send(successCode || successfulResponseCode(result), result);
				}, function (ex) {
					if (ex) {
						throw ex;
					}
					throw {
						value: {
							code: HTTP_RESPONSE.NOTFOUND,
							body: undefined
						}
					};
				}).catch(function (ex) {
					if (ex.value && ex.value.code) {
						res.send(ex.value.code, ex.value.body);
					}
					else {
						res.send(500, ex);
					}
				});
		}
	}

	// Backbone Extend
	// ---------------

	// This is CTRL+C, CTRL+V of Backbone's extend.  Used on Controller and Provider so it's the exact
	// same as what's available on Collection and Model.  Used to extend/override the base prototype.
	function extend (protoProps, staticProps) {
		var parent = this;
		var child;

		// The constructor function for the new subclass is either defined by you
		// (the "constructor" property in your `extend` definition), or defaulted
		// by us to simply call the parent's constructor.
		if (protoProps && _.has(protoProps, 'constructor')) {
			child = protoProps.constructor;
		} else {
			child = function(){ return parent.apply(this, arguments); };
		}

		// Add static properties to the constructor function, if supplied.
		_.extend(child, parent, staticProps);

		// Set the prototype chain to inherit from `parent`, without calling
		// `parent`'s constructor function.
		var Surrogate = function(){ this.constructor = child; };
		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate;

		// Add prototype properties (instance properties) to the subclass,
		// if supplied.
		if (protoProps) _.extend(child.prototype, protoProps);

		// Set a convenience property in case the parent's prototype is needed
		// later.
		child.__super__ = parent.prototype;

		return child;
	}

	// Exposure
	// --------

	ExpressREST.version = VERSION;

	// CommonJS module is defined
	if (hasModule) {
		module.exports = ExpressREST;
	}
	// global ender:false
	if (typeof ender === 'undefined') {
		// here, `this` means `window` in the browser, or `global` on the server
		// add `ExpressREST` as a global object via a string identifier,
		// for Closure Compiler "advanced" mode
		this['ExpressREST'] = ExpressREST;
	}
	// global define:false
	if (typeof define === "function" && define.amd) {
		define("ExpressREST", [], function () {
			return ExpressREST;
		});
	}
}).call(this);