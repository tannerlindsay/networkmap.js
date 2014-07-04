/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2014-01-31
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

if ("document" in self && !("classList" in document.createElement("_"))) {

(function (view) {

"use strict";

if (!('Element' in view)) return;

var
	  classListProp = "classList"
	, protoProp = "prototype"
	, elemCtrProto = view.Element[protoProp]
	, objCtr = Object
	, strTrim = String[protoProp].trim || function () {
		return this.replace(/^\s+|\s+$/g, "");
	}
	, arrIndexOf = Array[protoProp].indexOf || function (item) {
		var
			  i = 0
			, len = this.length
		;
		for (; i < len; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	}
	// Vendors: please allow content code to instantiate DOMExceptions
	, DOMEx = function (type, message) {
		this.name = type;
		this.code = DOMException[type];
		this.message = message;
	}
	, checkTokenAndGetIndex = function (classList, token) {
		if (token === "") {
			throw new DOMEx(
				  "SYNTAX_ERR"
				, "An invalid or illegal string was specified"
			);
		}
		if (/\s/.test(token)) {
			throw new DOMEx(
				  "INVALID_CHARACTER_ERR"
				, "String contains an invalid character"
			);
		}
		return arrIndexOf.call(classList, token);
	}
	, ClassList = function (elem) {
		var
			  trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
			, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
			, i = 0
			, len = classes.length
		;
		for (; i < len; i++) {
			this.push(classes[i]);
		}
		this._updateClassName = function () {
			elem.setAttribute("class", this.toString());
		};
	}
	, classListProto = ClassList[protoProp] = []
	, classListGetter = function () {
		return new ClassList(this);
	}
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
	return this[i] || null;
};
classListProto.contains = function (token) {
	token += "";
	return checkTokenAndGetIndex(this, token) !== -1;
};
classListProto.add = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		if (checkTokenAndGetIndex(this, token) === -1) {
			this.push(token);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.remove = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		var index = checkTokenAndGetIndex(this, token);
		if (index !== -1) {
			this.splice(index, 1);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.toggle = function (token, force) {
	token += "";

	var
		  result = this.contains(token)
		, method = result ?
			force !== true && "remove"
		:
			force !== false && "add"
	;

	if (method) {
		this[method](token);
	}

	return !result;
};
classListProto.toString = function () {
	return this.join(" ");
};

if (objCtr.defineProperty) {
	var classListPropDesc = {
		  get: classListGetter
		, enumerable: true
		, configurable: true
	};
	try {
		objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
	} catch (ex) { // IE 8 doesn't support enumerable:true
		if (ex.number === -0x7FF5EC54) {
			classListPropDesc.enumerable = false;
			objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
		}
	}
} else if (objCtr[protoProp].__defineGetter__) {
	elemCtrProto.__defineGetter__(classListProp, classListGetter);
}

}(self));

}
;var networkMap = networkMap || {};

networkMap.path = function(svg){
	return svg.path().attr({ 
		fill: 'none',
		stroke: '#000'
	});
};

networkMap.find = function(arr, fn){	
	for (var i = 0, len = arr.length; i < len; i++){
		if (fn.call(arr, arr[i], i, arr)){
			return arr[i];
		}
	}
};

networkMap.isFunction = function(f){
	var getType = {};
	return f && getType.toString.call(f) === '[object Function]';
};

networkMap.extend = function () {
	var modules, methods, key, i;
	
	/* get list of modules */
	modules = [].slice.call(arguments);
	
	/* get object with extensions */
	methods = modules.pop();
	
	for (i = modules.length - 1; i >= 0; i--)
		if (modules[i])
			for (key in methods)
				modules[i].prototype[key] = methods[key];
};

networkMap.Observable = (function(){
	function removeOn(string){
		return string.replace(/^on([A-Z])/, function(full, first){
			return first.toLowerCase();
		});
	}

	return {
		addEvent: function(type, fn) {
			this.$events = this.$events || {};

			if (!networkMap.isFunction(fn)){
				return this;
			}

			type = removeOn(type);

			(this.$events[type] = this.$events[type] || []).push(fn);

			return this;
		},

		addEvents: function(events){
			for (var type in events) this.addEvent(type, events[type]);
			return this;
		},

		fireEvent: function(type, args, delay) {
			this.$events = this.$events || {};
			type = removeOn(type);
			var events = this.$events[type];

			if (!events) return this;
			
			args = (args instanceof Array) ? args : [args];

			events.forEach(function(fn){
				if (delay) setTimeout(function() { fn.apply(this, args); }, delay);
				else fn.apply(this, args);
			}, this); 

			return this;
		},	
		
		removeEvent: function(type, fn) {
			type = removeOn(type);

			var events = this.$events[type] || [];
			var index = events.indexOf(fn);
			if (index !== -1) events.splice(index, 1);

			return this;
		},

		removeEvents: function(events){
			var type;
			if (typeof(events) == 'object'){
				for (type in events) this.removeEvent(type, events[type]);
				return this;
			}

			if (events) events = removeOn(events);
			for (type in this.$events){
				if (events && events != type) continue;
				var fns = this.$events[type];
				for (var i = fns.length; i--;) if (i in fns){
					this.removeEvent(type, fns[i]);
				}
			}
			return this;
		}

	};

})();

networkMap.keys = function(obj) {
	var keys = [], key;

	if (obj !== Object(obj)) return keys;
	if (Object.keys) return Object.keys(obj);	
	for (key in obj) if (hasOwnProperty.call(obj, key)) keys.push(key);
	return keys;
};


networkMap.each = function(obj, iterator, context) {
	var i, length;
	if (obj === null) return obj;
	if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
		obj.forEach(iterator, context);
	} else if (obj.length === +obj.length) {
		for (i = 0, length = obj.length; i < length; i++) {
			iterator.call(context, obj[i], i, obj);
		}
	} else {
		var keys = networkMap.keys(obj);
		for (i = 0, length = keys.length; i < length; i++) {
			iterator.call(context, obj[keys[i]], keys[i], obj);
		}
	}
	return obj;
};


/**
 * Extend an object with defaults
 * @param  {Object} obj The object to extend with defaults
 * @param {...Object} var_args Objects with default configuration
 * @return {Object}     The extended object
 */
networkMap.defaults = function(obj) {
	obj = obj || {};
	networkMap.each(Array.prototype.slice.call(arguments, 1), function(source) {
		if (source) {
			for (var prop in source) {
				if (obj[prop] === void 0) obj[prop] = source[prop];
			}
		}
	});
	return obj;
};

networkMap.Options = {
	setOptions: function(options){
		this.options = networkMap.defaults(options, this.options);
		return this;
	}
};

networkMap.Mediator = {
	
	subscribe: function(topic, fn){
		if (!networkMap.isFunction(fn)){
			return this;
		}

		this.$topics = this.$topics || {};
		(this.$topics[topic] = this.$topics[topic] || []).push(fn);

		return this;  
	},

	publish: function(topic, args, delay){
		this.$topics = this.$topics || {};
		var events = this.$topics[topic];

		if (!events) return this;
		
		args = (args instanceof Array) ? args : [args];

		events.forEach(function(fn){
			if (delay) setTimeout(function() { fn.apply(this, args); }, delay);
			else fn.apply(this, args);
		}, this); 

		return this;
	},

	unsubscribe: function(topic, fn){
		var events = this.$topics[topic];
		var index = events.indexOf(fn);
		if (index !== -1) events.splice(index, 1);

		return this;
	}
};


networkMap.toQueryString = function(object, base){
	var queryString = [];

	networkMap.each(object, function(value, key){
		if (base) key = base + '[' + key + ']';
		var result;
		switch (typeof value){
			case 'object': 
					result = networkMap.toQueryString(value, key); 
			break;
			case 'array':
				var qs = {};
				value.forEach(function(val, i){
					qs[i] = val;
				});
				result = networkMap.toQueryString(qs, key);
			break;
			default: result = key + '=' + encodeURIComponent(value);
		}
		/* jshint ignore:start */
		if (value != null) queryString.push(result);
		/* jshint ignore:end */
	});

	return queryString.join('&');
};
;networkMap.vec2 = SVG.math.Point;

SVG.math.Point.create = function(x, y){
	return new SVG.math.Point(x, y);
};

SVG.extend(SVG.math.Point, {
	clone: function(){
		return SVG.math.Point.create(this.x, this.y);
	},
	
	add: function(v){
		this.x += v.x;
		this.y += v.y;

		return this;
	},

	sub: function(v){
		this.x -= v.x;
		this.y -= v.y;

		return this;
	},

	distance: function(v){
		var x = v.x - this.x,
		y = v.y - this.y;
		return Math.sqrt(x*x + y*y);
	},

	len: function(){
		var x = this.x,
			y = this.y;
		return Math.sqrt(x*x + y*y);
	},

	normalize: function() {
		
		var x = this.x,
			y = this.y,
			len = x*x + y*y;
			
		if (len > 0) {
			len = 1 / Math.sqrt(len);
			this.x = x * len;
			this.y = y * len;
		}
		return this;
	},
	
	angle: function(){
		var angle = Math.atan2(this.y, this.x);

		while (angle < 0){
			angle += 2 * Math.PI;
		}

		return angle;
	},

	maxDir: function(){
		var x = this.x, 
			y = this.y,
			al0 = Math.abs(x),
			al1 = Math.abs(y);

		if (al0 > al1){
			this.x = x / al0;
			this.y = 0;
		}
		else{
			this.x = 0;
			this.y = y / al1;
		}
		return this;
	},
	
	roundDir: function(snapAngle){
		var angle = this.angle();
		var length = this.len();
		angle = angle - angle % snapAngle;
		
		this.x = length * Math.cos(angle);
		this.y = length * Math.sin(angle);
		
		return this;
	},

	scale: function(s){
		this.x *= s;
		this.y *= s;		

		return this;
	},

	mul: function(v){
		this.x *= v.x;
		this.y *= v.y; 
		
		return this;
	},

	confine: function(v){
		var x = this.x, y = this.y, x2 = v.x, y2 = v.y;

		this.x = (Math.abs(x) < Math.abs(x2)) ? x : x / Math.abs(x)*x2;
		this.y = (Math.abs(y) < Math.abs(y2)) ? y : y / Math.abs(y)*y2;

		return this;
	}
});

/*

networkMap.vec2 = function(x, y){
	this.x = x;
	this.y = y;
};

networkMap.vec2.create = function(x,y){
	return new networkMap.vec2(x,y);	
};

networkMap.extend(networkMap.vec2, {
	clone: function(){
		return networkMap.vec2.create(this.x, this.y);
	},
	
	add: function(v){
		this.x += v.x;
		this.y += v.y;

		return this;
	},

	sub: function(v){
		this.x -= v.x;
		this.y -= v.y;

		return this;
	},

	distance: function(v){
		var x = v.x - this.x,
		y = v.y - this.y;
		return Math.sqrt(x*x + y*y);
	},

	len: function(){
		var x = v.x,
			y = v.y;
		return Math.sqrt(x*x + y*y);
	},

	normalize: function() {
		
		var x = this.x,
			y = this.y,
			len = x*x + y*y;
			
		if (len > 0) {
			len = 1 / Math.sqrt(len);
			this.x = x * len;
			this.y = y * len;
		}
		return this;
	},

	maxDir: function(){
		var x = this.x, 
			y = this.y,
			al0 = Math.abs(x),
			al1 = Math.abs(y);

		if (al0 > al1){
			this.x = x / al0;
			this.y = 0;
		}
		else{
			this.x = 0;
			this.y = y / al1;
		}
		return this;
	},

	scale: function(s){
		this.x *= s;
		this.y *= s;		

		return this;
	},

	mul: function(v){
		this.x *= v.x;
		this.y *= v.y; 
		
		return this;
	},

	confine: function(v){
		var x = this.x, y = this.y, x2 = v.x, y2 = v.y;

		this.x = (Math.abs(x) < Math.abs(x2)) ? x : x / Math.abs(x)*x2;
		this.y = (Math.abs(y) < Math.abs(y2)) ? y : y / Math.abs(y)*y2;

		return this;
	}
});
*/
;networkMap.event = networkMap.event || {};

networkMap.event.Configuration = function(options){
	this.deletable = (options.deletable) ? true : false;
	this._destroy = (options.destroy) ? options.destroy : function(){ return false; };
	this._cancel = (options.cancel) ? options.cancel : function(){ return false; };
	this.editable = (options.editable) ? true : false;
	this.editWidget = (options.editWidget) ? options.editWidget : null;
	this.target = (options.target) ? options.target : null;
	this.type = (options.type) ? options.type : 'unknown';

	// TODO: Depricated, remove	
	this.configWidget = this.editWidget;
};

networkMap.extend(networkMap.event.Configuration, {
	
	destroy: function(){
		return this._destroy();
	},
	
	cancel: function(){
		return this._cancel();
	}
	
	
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.IntegerInput = function(label, value, options){
	this.options = {
		class: 'nm-input-integer'
	};
	this.setOptions(options);
	this.createElements(label, value);	
};


networkMap.extend(networkMap.widget.IntegerInput, networkMap.Observable);
networkMap.extend(networkMap.widget.IntegerInput, networkMap.Options);
networkMap.extend(networkMap.widget.IntegerInput, {
	createElements: function(label, value){
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add(this.options.class);

		this.label = document.createElement('span');
		this.label.textContent = label;

		this.input = document.createElement('input');
		this.input.setAttribute('type', 'number');

		/*
		// TODO: Clean up code		
		var tmpValue = (value.inherited) ? value.value : 
			(value) ? value : null;
			
		if (!tmpValue && value.inherited)
			this.increment = parseInt(value.inherited, 10);
		else
			this.increment = 0;
		*/
		this.input.value = (value.inherited && value.value) ? value.value : 
			(value.inherited) ? '' :
			(value) ? value : '';
			
			
		if (value.inherited) this.input.setAttribute('placeholder', value.inherited);
		this.input.addEventListener('change', function(e){
			/*
			if (this.input.value === '' && value.inherited){
				this.increment = parseInt(value.inherited, 10);
			}
			if (this.increment && (this.options.min !== undefined && parseInt(this.input.value, 10) === this.options.min ) || parseInt(this.input.value, 10) === 1) ){
				this.input.value = parseInt(this.input.value) + parseInt(this.increment);
				this.increment = 0;
			}
			if (this.increment && (parseInt(this.input.value, 10) === this.options.min || parseInt(this.input.value, 10) === 0)){
				this.input.value = parseInt(this.increment) - 1;
				this.increment = 0;
			}
			*/
			e.value = this.value();
			
			// this is a hack to prevent the change event to 
			// fire twice in chrome
			var self = this;
			setTimeout(function(){
				self.fireEvent('change', [e, self]);
			}, 1);
		}.bind(this));

		if (this.options.min !== undefined){
			this.input.setAttribute('min', this.options.min);	
		}

		if (this.options.disabled === true){
			this.input.disabled = true;
		}

		this.wrapper.appendChild(this.label);
		this.wrapper.appendChild(this.input);

		return this;
	},

	toElement: function(){
		return this.wrapper;
	},

	value: function(){
		return (this.input.value !== '') ? parseInt(this.input.value) : undefined;
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.TextInput = function(label, value, options){
	this.options = {
		class: 'nm-input-text',
		type: 'text'
	};
	this.setOptions(options);

	this.$destroy = [];

	this.createElements(label, value);
};

networkMap.extend(networkMap.widget.TextInput, networkMap.Observable);
networkMap.extend(networkMap.widget.TextInput, networkMap.Options);
networkMap.extend(networkMap.widget.TextInput, {	
	createElements: function(label, value){
		var wrapper = this.wrapper = document.createElement('div');
		wrapper.classList.add(this.options.class);

		var lbl = this.label = document.createElement('span');
		lbl.textContent = label;

		var input = this.input = document.createElement('input');
		var inputHandler = function(e){
			this.fireEvent('change', [e, this]);
		}.bind(this);
		input.setAttribute('type', this.options.type);
		input.setAttribute('value', (value) ? value : '');
		this.$destroy.push({
			el: input,
			type: 'change',
			fn: inputHandler
		});
		input.addEventListener('change', inputHandler, false);

		if (this.options.disabled === true){
			this.input.disabled = true;
		}
		
		wrapper.appendChild(lbl);
		wrapper.appendChild(input);

		return this;
	},
	
	value: function(){
		return (this.input.value !== '') ? this.input.value : undefined;
	},

	toElement: function(){
		return this.wrapper;
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.ColorInput = function(label, value, options){
	this.options = {
		class: 'nm-input-color'
	};

	this.setOptions(options);

	this.createElements(label, value);
};

networkMap.extend(networkMap.widget.ColorInput, networkMap.Observable);
networkMap.extend(networkMap.widget.ColorInput, networkMap.Options);
networkMap.extend(networkMap.widget.ColorInput, {

	createElements: function(label, value){
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add(this.options.class);

		this.label = document.createElement('span');
		this.label.textContent = label;

		this.div = document.createElement('div');

		this.input = document.createElement('input');
		this.input.setAttribute('type', 'color');
		this.input.setAttribute('value', value);
		this.input.addEventListener('change', function(e){
			this.fireEvent('change', [e, this]);
		}.bind(this));
		
		if (this.options.disabled === true){
			this.input.disabled = true;
		}

		this.div.appendChild(this.input);
		this.wrapper.appendChild(this.label);
		this.wrapper.appendChild(this.div);
	},

	/**
	 * Get the current value of the widget
	 * @return {string} The color encoded as a string
	 */
	value: function(){
		return this.input.value;
	},

	toElement: function(){
		return this.wrapper;
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.Accordion = function(options){
	this.options = {
		class: 'nm-accordion'
	};

	this.setOptions(options);

	this.items = [];
	this.wrapper = document.createElement('div');
	this.wrapper.classList.add(this.options.class);
};

networkMap.extend(networkMap.widget.Accordion, networkMap.Observable);
networkMap.extend(networkMap.widget.Accordion, networkMap.Options);
networkMap.extend(networkMap.widget.Accordion, {	
	toElement: function(){
		return this.wrapper;
	},
	add: function(label, options){
		var item = document.createElement('div');
		item.classList.add('nm-accordion-group', 'nm-accordion-open');

		
		var trigger = document.createElement('div');
		trigger.classList.add('nm-accordion-trigger', 'unselectable');
		trigger.textContent = label;

		var list = new networkMap.widget.Accordion.Group(options);
		
		item.appendChild(trigger);
		item.appendChild(list.toElement());

		this.items.push(item);
		this.wrapper.appendChild(item);
		trigger.addEventListener('click', this.clickHandler.bind(this));

		return list;
	},

	clickHandler: function(e){
		e.target.parentNode.classList.toggle('nm-accordion-open');
	}
});

networkMap.widget.Accordion.Group = function(options){
	var list = this.list = document.createElement('ul');
	list.classList.add('nm-accordion-inner');

	if (options && options.id){
		list.setAttribute('id', options.id);		
	}
};

networkMap.extend(networkMap.widget.Accordion.Group, {

	appendChild: function(node){
		if (node.toElement)
			this.list.appendChild(node.toElement());
		else
			this.list.appendChild(node);

		return this;
	},

	toElement: function(){
		return this.list;
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.List = function(options){
	this.options = {
		class: 'nm-list'
	};
	this.listItems = [];
	this.setOptions(options);

	this.list = document.createElement('ul');
	this.list.classList.add(this.options.class);
};

networkMap.extend(networkMap.widget.List, networkMap.Observable);
networkMap.extend(networkMap.widget.List, networkMap.Options);
networkMap.extend(networkMap.widget.List, {
	toElement: function(){
		return this.list;
	},
	add: function(element, options){
		var listItem = new networkMap.widget.ListItem(element, options);
		listItem.addEvent('remove', this.remove.bind(this));
		this.listItems.push(listItem);
		this.list.appendChild(listItem.toElement());
		
		return listItem;
	},
	remove: function(listItem){
		var index = this.listItems.indexOf(listItem);
		this.listItems.splice(index, 1);
				
		return this;
	}
});

networkMap.widget.ListItem = function(element, options){
	this.options = {
		class: 'nm-list-item',
		enableDelete: false
	};
	this.setOptions(options);

	this.listItem = document.createElement('li');
	this.listItem.classList.add(this.options.class);

	if (typeof element === 'string'){
		this.listItem.textContent = element;
	}
	else{
		this.listItem.appechChild(element);
	}

	if (this.options.enableDelete){
		var del = document.createElement('span');
		del.textContent = 'x';
		del.classList.add('nm-list-item-delete', 'pull-right');
		this.$remove = this.remove.bind(this);
		del.addEventListener('click', this.$remove);
		this.listItem.appendChild(del);
	}
};

networkMap.extend(networkMap.widget.ListItem, networkMap.Observable);
networkMap.extend(networkMap.widget.ListItem, networkMap.Options);
networkMap.extend(networkMap.widget.ListItem, {
	remove: function(){
		this.listItem.parentNode.removeChild(this.listItem);
		this.listItem.removeEventListener('click', this.$remove);
		delete this.listItem;
		this.fireEvent('remove', [this]);
		
		return this;
	},
	toElement: function(){
		return this.listItem;
	}
});

;networkMap.widget = networkMap.widget || {};

networkMap.widget.Select = function(label, values, options){
	this.options = {
		class: 'nm-input-select'
	};
	this.setOptions(options);

	this.$destroy = [];

	this.createElements(label);
	this.addOptions(values);
};

networkMap.extend(networkMap.widget.Select, networkMap.Observable);
networkMap.extend(networkMap.widget.Select, networkMap.Options);
networkMap.extend(networkMap.widget.Select, {
	
	createElements: function(label){
		var wrapper = this.wrapper = document.createElement('div');
		wrapper.classList.add(this.options.class);

		var lbl = this.label = document.createElement('span');
		lbl.textContent = label;

		var input = this.input = document.createElement('select');
		var inputHandler = function(e){
			this.fireEvent('select', [e, this]);
		}.bind(this);
		this.$destroy.push({
			el: input,
			type: 'change',
			fn: inputHandler
		});
		input.addEventListener('change', inputHandler, false);

		wrapper.appendChild(lbl);
		wrapper.appendChild(input);
	},

	addOptions: function(values){
		values.forEach(function(value){
			this.addOption(value);
		}.bind(this));
	},

	addOption: function(text, options){
		options = options || {};
		
		var el = document.createElement('option');
		el.setAttribute('value', (options.value) ? options.value : text);
		el.textContent = text;
		el.selected = options.selected;

		this.input.appendChild(el);

		return el;
	},

	value: function(){
		return this.getSelected();
	},

	getSelected: function(){
		return (this.input.selectedIndex !== -1) ? this.input.options[this.input.selectedIndex].value : null; 
	},

	clearOptions: function(){
		while (this.input.firstChild) {
			this.input.removeChild(this.input.firstChild);
		}
		return this;
	},

	toElement: function(){
		return this.wrapper;
	},

	toString: function(){
		return (this.input.selectedIndex !== -1) ? this.input.options[this.input.selectedIndex] : null;
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.Modal = function(options){
	this.options = {
		class: 'modal',
		title: '',
		content: '',
		footer: '',
		type: 'alert'
	};
	this.setOptions(options);
	
	// containing elements to destroy
	this.$destroy = [];

	this.buildUI();	
};

networkMap.extend(networkMap.widget.Modal, networkMap.Observable);
networkMap.extend(networkMap.widget.Modal, networkMap.Options);
networkMap.extend(networkMap.widget.Modal, {
	buildUI: function(){
		

		var modal = this.modal = document.createElement('div');
		modal.classList.add('modal', 'hide', 'fade', 'in');
		modal.style.zIndex = 1000000;

		var header = this.header = document.createElement('div');
		header.classList.add('modal-header');

		var closeButton = this.closeButton = document.createElement('button');
		var closeHandler = this._close.bind(this);
		closeButton.classList.add('close');
		closeButton.innerHTML = '&times;';
		this.$destroy.push({
			el: closeButton,
			type: 'click',
			fn: closeHandler
		});
		closeButton.addEventListener('click', closeHandler, false);
		header.appendChild(closeButton);

		var title = this.title = document.createElement('h3');
		title.innerHTML = this.options.title;
		header.appendChild(title);

		var body = this.body = document.createElement('div');
		body.classList.add('modal-body');
		body.innerHTML = this.options.content;

		var footer = this.footer = document.createElement('div');
		footer.classList.add('modal-footer');
		footer.innerHTML = this.options.footer;

		modal.appendChild(header);
		modal.appendChild(body);
		modal.appendChild(footer);
		
		return this;
	},
	alert: function(html, options){
		options = options || {};
		
		this.body.innerHTML =  html;
		this.title.innerHTML = (options.title) ? options.title : 'Alert';		
		
		
		var btn = this.btn = document.createElement('a');
		var btnHandler = this.destroy.bind(this);
		btn.setAttribute('href', '#');
		btn.classList.add('btn');
		btn.textContent = (options.button) ? options.button : 'Ok';
		this.$destroy.push({
			el: btn,
			type: 'click',
			fn: btnHandler
		});
		btn.addEventListener('click', btnHandler, false);
		this.footer.appendChild(btn);

		document.body.appendChild(this.modal);
	
		return this.show();				
	},
	confirm: function(html, options){
		options = options || {};
		
		this.body.innerHTML = html;
		this.title.innerHTML = (options.title) ? options.title : 'Alert';		
		
		var cancelBtn = document.createElement('a');
		var cancelHandler = this._cancel.bind(this);
		cancelBtn.setAttribute('href', '#');
		cancelBtn.classList.add('btn');
		cancelBtn.textContent = (options.button) ? options.button : 'Ok';
		this.$destroy.push({
			el: cancelBtn,
			type: 'click',
			fn: cancelHandler
		});
		cancelBtn.addEventListener('click', cancelHandler, false);
		this.footer.appendChild(cancelBtn);

		var okBtn = document.createElement('a');
		var okHandler = this._cancel.bind(this);
		okBtn.setAttribute('href', '#');
		okBtn.classList.add('btn');
		okBtn.textContent = (options.button) ? options.button : 'Ok';
		this.$destroy.push({
			el: okBtn,
			type: 'click',
			fn: okHandler
		});
		okBtn.addEventListener('click', okHandler, false);
		this.footer.appendChild(okBtn);

		document.body.appendChild(this.modal);
	
		return this.show();				
	},
	show: function(){
		this.modal.style.display = 'block';
		return this;
	},
	destroy: function(){
		this.modal.parentNode.removeChild(this.modal);

		this.$destroy.forEach(function(ref){
			ref.el.removeEventListener(ref.type, ref.fn, false);
		});
		this.$destroy.length = 0;
		return this;
	},
	
	_close: function(e){
		this.fireEvent('close', [e]);
		this.destroy();
	},
	_ok: function(e){
		this.fireEvent('ok', [e]);
		this.destroy();
	},
	_cancel: function(e){
		this.fireEvent('cancel', [e]);
		this.destroy();
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.Checkbox = function(label, value, options){
	this.options = {
		class: 'nm-checkbox',
		type: 'checkbox'
	};

	this.setOptions(options);
	this.createElements(label, value);
};

networkMap.extend(networkMap.widget.Checkbox, networkMap.Observable);
networkMap.extend(networkMap.widget.Checkbox, networkMap.Options);
networkMap.extend(networkMap.widget.Checkbox, {

	createElements: function(label, value){
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add(this.options.class);

		this.label = document.createElement('span');
		this.label.textContent = label;

		this.input = document.createElement('input');
		this.input.setAttribute('type', this.options.type);
		this.input.checked = value;
		this.input.addEventListener('change', function(e){
			e.value = this.value();
			this.fireEvent('change', [e, this]);
		}.bind(this));


		if (this.options.disabled === true){
			this.input.disabled = true;
		}
		
		this.wrapper.appendChild(this.label);
		this.wrapper.appendChild(this.input);

		return this;
	},
	
	toElement: function(){
		return this.wrapper;
	},

	value: function(){
		return this.input.checked;
	},
	
	isChecked: function(){
		return this.input.checked;
	}
});;networkMap.widget = networkMap.widget || {};

networkMap.widget.GridInput = function(label, value, options){
	this.options = {
		class: 'nm-input-snap',
		type: 'snap'
	};
	
	this.setOptions(options);
	this.createElements(label, value);
};

networkMap.extend(networkMap.widget.GridInput, networkMap.Observable);
networkMap.extend(networkMap.widget.GridInput, networkMap.Options);
networkMap.extend(networkMap.widget.GridInput, {
	createElements: function(label, value){
		this.wrapper = document.createElement('div');
		this.wrapper.classList.add(this.options.class);

		this.label = document.createElement('span');
		this.label.textContent = label;

		this.check = document.createElement('input');
		this.check.setAttribute('type', 'checkbox');
		this.check.checked = value.enabled;
		this.check.addEventListener('change', function(e){
			this.x.input.disabled = !this.check.checked;
			this.y.input.disabled = !this.check.checked;
			e.value = this.value();
			this.fireEvent('change', [e]);
		}.bind(this));

		this.x = this.$createInputs('x', value.grid.x, value.enabled);
		this.y = this.$createInputs('y', value.grid.y, value.enabled);

		this.wrapper.appendChild(this.label);
		this.wrapper.appendChild(this.check);
		this.wrapper.appendChild(this.x.label);
		this.wrapper.appendChild(this.x.input);
		this.wrapper.appendChild(this.y.label);
		this.wrapper.appendChild(this.y.input);
	},

	$createInputs: function(label, value, enabled){
		var els = {};
		els.label = document.createElement('span');
		els.label.textContent = label;

		els.input = document.createElement('input');
		els.input.setAttribute('type', 'number');
		els.input.setAttribute('value', (value) ? value : 1);
		els.input.setAttribute('min', 1);
		els.input.setAttribute('max', 50);
		els.input.disabled = !enabled;
		els.input.addEventListener('change', function(e){
			e.value = this.value();
			this.fireEvent('change', [e, this]);
		}.bind(this));
		return els;
	},

	value: function(){
		return {
			enabled: this.check.checked,
			grid: {
				x: parseInt(this.x.input.value, 10),
				y: parseInt(this.y.input.value, 10)
			}
		};
	},

	toElement: function(){
		return this.wrapper;
	}
});;networkMap.Properties = function(properties, defaults){
	this.properties = properties || {};
	this.$change = [];
	this.setDefaults(defaults);
};

networkMap.extend(networkMap.Properties, networkMap.Observable);

networkMap.extend(networkMap.Properties, {
	get: function(k, inherited){
		var v = this.properties;
		
		for(var i = 0,path = k.split('.'),len = path.length; i < len; i++){
			if(!v || typeof v !== 'object') break;
			v = v[path[i]];
		}

		if (inherited === true){
			return {
				value: v,
				inherited: (this.defaults) ? this.defaults.get(k) : void 0
			};
		}

		if (v === void 0 && this.defaults !== void 0)
			v = this.defaults.get(k);

		return v;
	},

	set: function(k, v){
		
		this.$change.length = 0;
		if (arguments.length === 1 && arguments[0].constructor ===  Object){
			networkMap.each(arguments[0], this.$set, this);
		}
		else{
			this.$set(v, k);
		}
		this.fireEvent('change', [this.$change]);
		return this;
	},

	$set: function(v, k){
		var change = {
			key: k,
			value: v,
			oldValue: this.properties[k]
		};
		this.properties[k] = v;
		this.$change.push(change);
		return change;
	},

	unset: function(k){
		var oldValue = this.properties[k];
		delete this.properties[k];
		this.fireEvent('change', [k, v, oldValue]);
		return this;
	},

	load: function(properties){
		var change = [];
		var oldProperties = this.properties;
		networkMap.each(properties, function(k, v){
			change.push({
				key: k, 
				value: v,
				oldValue: oldProperties[k]
			});
		});

		this.properties = properties;
		this.$change = change;

		this.fireEvent('change', [change]);
		return this;
	},

	extract: function(){
		return this.properties;
	},

	setDefaults: function(defaults){
		this.defaults = defaults || void 0;

		// propagate change events
		if (this.defaults){
			this.defaults.addEvent('change', function(change){
				this.fireEvent('change', [change]);
			}.bind(this));
		}
	},

	configuration: function(properties){
		properties = properties || {};
		if (this.defaults === void 0)
			return networkMap.defaults(properties, this.properties);

		return networkMap.defaults(properties, this.properties, this.defaults.configuration());
	}
});
;networkMap.datasource = networkMap.datasource || {};

/**
 * Register a datasource
 *
 * @param {string} name The name of the datasource.
 * @param {function} f The datasource
 */
networkMap.registerDatasource = function(name, f){
	networkMap.datasource[name] = function(url, requests){
		if (Object.prototype.toString.call(requests) !== '[object Array]'){
			requests = [requests];
		}
		f(url, requests);
	};
};

/**
 * Dummy datasource used for simulation and testing.
 * The requests array contains object of the form:
 * {
 *		link: {Sublink} 
 *		callback: {function}
 * }
 * Use the link to gather data to send with the request,
 * when the request is made send the data to the callback.  
 *
 * @param {string} url The URL to send the request to.
 * @param {Array} requests An array of requests. 
 * @return null.
 */
networkMap.registerDatasource('simulate', function(url, requests){
	requests.forEach(function(request){
		var dataPoint = Math.random();

		// Example on how to get the node to get node specific data
		//request.link.getNode().options.id;

		request.callback({
			url: url,
			request: request.link,
			value: dataPoint,
			realValue: Math.round(dataPoint * 100) + 'Mbps'
		});
	});
});;networkMap.events = networkMap.events || {
	click: function(e, link){
		var linkEvents = link.properties.get('events');
		
		if (linkEvents && linkEvents.click && linkEvents.click.href){
			window.location.href = link.options.events.click.href;
		}
	},
	
	hover: function(e, link, el){
		el.set('text', link.options.name);
	},
	mouseover: function(e, options, hover){},
	
	mouseout: function(e, options, hover){}
};

networkMap.registerEvent = function(name, f){
	if (!networkMap.events[name])
		throw "Invalid event: " + name + " is not an registered event";
	
	if (name === 'click'){
		networkMap.events[name] = function(e, link){
			//var options = (e.target.instance.link) ? e.target.instance.link.click : e.target.instance.parent.link.click;
			f(e, link);
		};
	}
	else if (name === 'hover'){	
		networkMap.events.mouseover = function(e, link){
			var el = document.getElementById('nm-active-hover');
			var id = e.target.instance.attr('id');
			
			if (el){
				if (el && el.retrieve('id') !== e.target.instance.attr('id')){
					el.destroy();	
				}
				else{
					el.store('keep', true);
					return;
				}	
			}
			
			/*
			var position = e.target.getPosition(),
			svg = e.target.instance;
				
			var midX, midY;
			var viewbox = svg.doc().viewbox();
			if (svg.getSegment(6).type !== 'Z'){
				var segment11 = svg.getSegment(2),
				segment12 = svg.getSegment(3),
				segment21 = svg.getSegment(5),
				segment22 = svg.getSegment(6);
				
				midX = ((segment11.coords[0] + segment22.coords[0])/2 +
					(segment12.coords[0] + segment21.coords[0])/2)/2;
	
				midY = ((segment11.coords[1] + segment22.coords[1])/2 +
					(segment12.coords[1] + segment21.coords[1])/2)/2;
			}
			else{
				var s1 = svg.getSegment(1),
				s2 = svg.getSegment(2),
				s4 = svg.getSegment(4),
				s5 = svg.getSegment(5);
				
				midX = ((s1.coords[0] + s2.coords[0] + s4.coords[0] + s5.coords[0]) / 4 + viewbox.x ) * viewbox.zoomX;
	
				midY = ((s1.coords[1] + s2.coords[1] + s4.coords[1] + s5.coords[1]) / 4  + viewbox.y ) * viewbox.zoomY;
				
				console.log(s1.coords[0] , s2.coords[0] , s4.coords[0] , s5.coords[0]);
			}

			*/
			
			
			el = new Element('div', {
				'id': 'nm-active-hover',
				'class': 'nm-hover',
				events: {
					mouseover: function(){
						el.store('mouseover', true);
					},
					mouseout: function(){
						el.eliminate('mouseover');
						(function(){
							if (!el.retrieve('keep'))
								el.destroy();
							else
								el.eliminate('keep');
						}).delay(10);
					},
					click: function(ev){
						link._clickHandler(e);
					}
						
					
				}
			})
			.store('id', e.target.instance.attr('id'));
			
			el.setStyles({
				top: -1000,
				left: -1000	
			});
					
			
			document.id(document.body).grab(el);
						
			f(e, link, el);
			
			var size = el.getSize();
			var bboxClient = e.target.getBoundingClientRect();
			
			el.setStyles({
				top: (bboxClient.top + bboxClient.bottom)/2 - size.y/2,
				left: (bboxClient.left + bboxClient.right)/2 - size.x/2
			});
		
		};
		
		networkMap.events.mouseout = function(e, link){
			var options = e.target.instance.link;
			(function(){
				var el = document.id('nm-active-hover');
				if (el && el.retrieve('id') !== e.target.instance.attr('id')){
					return;	
				}

				if (el && !el.retrieve('mouseover')){
					el.destroy();
				}
			}).delay(10);
		};
	}
	else{
		networkMap.events[name] = f;	
	}
};

networkMap.registerEvent('click', networkMap.events.click);
networkMap.registerEvent('mouseover', networkMap.events.mouseover);
networkMap.registerEvent('mouseout', networkMap.events.mouseout);
networkMap.registerEvent('hover', networkMap.events.hover);;
networkMap.colormap = networkMap.colormap || {};


/**
 * Register a color map. After a color map is registed
 * it can be used in the graph. 
 *
 * @param {String} The name of the colormap
 * @param {Object} colormap
 * @param {array} colormap.map The color values
 * @param {array} colormap.limits The limits associated with colormap.map
 * @param {string} colormap.nodata The color if no data is available
 * @param {function} colormap.translate(value) A function that takes a value [0:1|undefined] and returns a color
 */
networkMap.registerColormap = function(name, colormap){
	networkMap.colormap[name] = colormap;
};

/**
 * Rasta5 colormap
 */
networkMap.colormap.rasta5 = {
	translate: function(value){
		if (!value)
			return networkMap.colormap.rasta5.nodata;

		if (value < 0.2)
			return networkMap.colormap.rasta5.map[0];

		if (value < 0.4)
			return networkMap.colormap.rasta5.map[1];

		if (value < 0.6)
			return networkMap.colormap.rasta5.map[2];
		
		if (value < 0.8)
			return networkMap.colormap.rasta5.map[3];
		
		return networkMap.colormap.rasta5.map[4];
	},
	map: [
		'#3DDE1E',
		'#9BEC1A',
		'#F9EB18',
		'#F98020',
		'#F51329'
	],
	limits: [
		0.2,
		0.4,
		0.6,
		0.8,
		1
	],
	nodata: '#C0C0C0'
};

/**
 * Flat5 colormap
 */
networkMap.colormap.flat5 = {
	translate: function(value){
		var map = networkMap.colormap.flat5;
		if (!value && value !== 0)
			return map.nodata;
	
		if (value === 0)
			return map.map[0];

		if (value < 0.2)
			return map.map[1];

		if (value < 0.4)
			return map.map[2];

		if (value < 0.6)
			return map.map[3];
		
		if (value < 0.8)
			return map.map[4];
		
		return map.map[5];
	},
	map: [
		'#000000',
		'#27ae60',
		'#2ecc71',
		'#f1c40f',
		'#e67e22',
		'#c0392b'
	],
	limits: [
		0,
		0.2,
		0.4,
		0.6,
		0.8,
		1
	],
	nodata: '#ecf0f1'
};

/**
 * HSL colormap
 */
networkMap.colormap.hsl20 = {
	translate: function(value){
		var map = networkMap.colormap.hsl20;
		
		if (!value && value !== 0)
			return map.nodata;
	
			
	
		if (value === 0)
			return '#000';

		
		var hue = 220 - (Math.floor(value * 24) * 10);
		if (hue < 0) {
			hue = 360 - hue;
		}
		return "hsl(" + hue + ", 100%, 50%)";
	},
	map: [
		'#000',
		'#007fff',
		'#0af',
		'#00d4ff',
		'#0ff',
		'#0fa',
		'#00ff80',
		'#0f5',
		'#00ff2b',
		'#0f0',
		'#5f0',
		'#80ff00',
		'#af0',
		'#d4ff00',
		'#ff0',
		'#fa0',
		'#ff8000',
		'#f50',
		'#ff2b00',
		'#f00',
		'#f05'
	],
	limits: [
		0, //#000
		0.05, //#007fff
		0.1, //#0af
		0.15, //#00d4ff
		0.2, //#0ff
		0.25, //#0fa
		0.3, //#00ff80
		0.35, //#0f5
		0.4, //#00ff2b
		0.45, //#0f0
		0.5, //#5f0
		0.55, //#80ff00
		0.6, //#af0
		0.65, //#d4ff00
		0.7, //#ff0
		0.75, //#fa0
		0.8, //#ff8000
		0.85, //#f50
		0.9, //#ff2b00
		0.95, //#f00
		1		//#f05
	],
	nodata: '#ecf0f1'
};;/**
 * Creates an instance of networkMap.ColorLegend.
 *
 * @constructor
 * @this {networkMap.ColorLegend}
 * @param {string} The name of the colormap
 * @param {Object} A options object.
 */
networkMap.ColorLegend = function(colormap, options){
	this.options = {
		/** The size of the the color square */
		boxSize: 25,
		/** margin */
		margin: 10,
		/** target */
		target: null
	};
	this.graph = options.graph;
	delete options.graph;

	this.setOptions(options);
	this.colormap = networkMap.colormap[colormap];

	if (!this.colormap){
		throw 'Colormap "' + colormap + '" is not registerd';
	}

	this.draw();
	
	// Fix for FF 
	// A timing issue seems to cause the bbox to
	// return an incorrect value
	setTimeout(function(){
		var bbox = this.svg.bbox();
		if (bbox.x === 0 && bbox.y === 0){
			return this;
		}
		this._move();
	}.bind(this), 0);
};

networkMap.extend(networkMap.ColorLegend, networkMap.Options);

networkMap.extend(networkMap.ColorLegend, {

	

	/** The graph object to attach to */
	graph: null,

	/**
	 * Draw/redraw the legend in the graph
	 *
	 * @this {networkMap.ColorLegend}
	 * @return {networkMap.ColorLegend} self
	 */
	draw: function(){
		var colormap = this.colormap.map;

		var container = this.container = this.wrapper = document.createElement('div');
		this.wrapper.classList.add('nm-colormap');
		this.options.target.appendChild(container);

		var svg = this.svg = this.svg || SVG(container).group();
		this.svg.clear();	

		

		colormap.forEach(function(color, index){
			svg.rect(this.options.boxSize, this.options.boxSize).attr({
				fill: color,
				'stroke-width': 1
			}).move(
				0, 
				(colormap.length - 1 - index) * this.options.boxSize
			);

			svg.line(
				-5, (colormap.length - 1 - index) * this.options.boxSize,
				0, (colormap.length - 1 - index) * this.options.boxSize
			).attr({
				stroke:'#000'

			});

			svg.text(Math.round(this.colormap.limits[index].toString() * 100) + '%')
				.attr({
					'text-anchor': 'end',
					'font-size': this.options.boxSize/2
				})
				.move(
				-this.options.boxSize/2,
				(colormap.length - 1.3 - index) * this.options.boxSize ,
				'end'
			);
		}.bind(this));

		svg.line(
			-5, (colormap.length) * this.options.boxSize,
			0, (colormap.length) * this.options.boxSize
		).attr({
			stroke:'#000'

		});

		svg.text('0%')
			.attr({
				'text-anchor': 'end',
				'font-size': this.options.boxSize/2
			})
			.move(
			-this.options.boxSize/2, 
			(colormap.length - 0.3) * this.options.boxSize ,
			'end'
		);
		
		this._move();

		return this;
	},

	/**
	 * Move the legend and resize the containing div
	 *
	 * @this {networkMap.ColorLegend}
	 * @return {networkMap.ColorLegend} self
	 */
	_move: function(){
		var bbox = this.svg.bbox();
		
		this.container.style.width = Math.ceil(bbox.width) + 'px';
		this.container.style.height = Math.ceil(bbox.height) + 'px';
		
		this.svg.move(Math.abs(bbox.x), Math.abs(bbox.y));

		return this;
	}

});
;/**
 * Creates an instance of networkMap.SettingsManager.
 *
 * @constructor
 * @this {networkMap.SettingsManager}
 * @param {Element} The html element to inject into
 * @param {networkMap.Mediator} An instance of networkMap.Mediator
 */
networkMap.SettingsManager = function(container, mediator, defaultView){
	this.container = container;
	this.mediator = mediator;
	this.defaultView = defaultView;

	// An array which contains the views
	this.editing = [];

	this.nav = this.createMenu();
	container.appendChild(this.nav);
	
	
	this._actions = {};

	if (this.mediator){
		this.mediator.subscribe('edit', this.edit.bind(this));
	}
};

networkMap.extend(networkMap.SettingsManager, networkMap.Observable);

networkMap.extend(networkMap.SettingsManager, {
	
	/**
	 * Create the HTML for the settings manager
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {Element} The HTML for the settingsmanager.
	 */
	createMenu: function(){
		var nav = document.createElement('nav');
		nav.classList.add('nm-menu');

		var trigger = document.createElement('div');
		trigger.classList.add('nm-trigger');
		trigger.innerHTML = '<span class="nm-icon nm-icon-menu"></span><a class="nm-label">Settings</a>';
		trigger.addEventListener('click', this.toggle.bind(this));

		var menu = this.menu = document.createElement('ul');

		var editContent = this.contentContainer = document.createElement('li');
		editContent.classList.add('nm-object-properties');
		editContent.setAttribute('id', 'nm-edit-content');

		menu.appendChild(editContent);

		var menuButtons = this.menuButtons = document.createElement('li');
		menuButtons.classList.add('clearfix', 'nm-menu-buttons');

		var saveButton = this.btnSave = document.createElement('button');
		saveButton.textContent = 'Save';
		saveButton.classList.add('btn', 'btn-primary', 'pull-right');
		saveButton.addEventListener('click', this.save.bind(this));

		var addButton = this.btnAdd = document.createElement('button');
		addButton.textContent = 'Add';
		addButton.classList.add('btn', 'btn-success');
		addButton.addEventListener('click', this.add.bind(this));
		
		var deleteButton = this.btnDelete = document.createElement('button');
		deleteButton.textContent = 'Delete';
		deleteButton.classList.add('btn', 'btn-danger');
		deleteButton.addEventListener('click', this.delete.bind(this));

		menu.appendChild(menuButtons);
		menuButtons.appendChild(saveButton);
		menuButtons.appendChild(addButton);
		menuButtons.appendChild(deleteButton);
		nav.appendChild(trigger);
		nav.appendChild(menu);

		return nav;
	},

	/**
	 * Returns the content container. This container is
	 * used when custom html should be injected.
	 *
	 * @this {networkMap.SettingsManager}s
	 * @return {Element} The content conainer
	 */
	getContentContainer: function(){
		return this.contentContainer;
		
		// TODO: Remove
		//return this.nav.querySelector('#nm-edit-content');
	},

	/**
	 * By calling this function and sending in the 
	 * object that shold be edited the settingsManager
	 * will setup the UI. This is the default action when 
	 * clicking a node.
	 *
	 * @param {networkMap.event.Configuration} The edit event
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	edit: function(e){
		if (!e.editable)
			return;
		
		this.purgeEditing();
		return this.configure(e);
	},

	/**
	 * Clears the content container.
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	clear: function(){
		var container = this.getContentContainer();
		while (container.firstChild){
			container.removeChild(container.firstChild);
		}

		return this;
	},
	
	/**
	 * Hides the normal menu buttons. The callback
	 * will be called before they are set into visable
	 * state. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	hideButtons: function(callback){
		
		this.menuButtons.setStyle('display', 'none');
		this.showButtonsCallback = (callback) ? callback : function(){};
		
		return this;	
	},

	/**
	 * Hides the normal menu buttons. The callback
	 * will be called before they are set into visable
	 * state. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	displayButtons: function(){
		if (!this.showButtonsCallback){
			return this;
		}
			
		this.showButtonsCallback();
		delete this.showButtonsCallback;
		
		this.menuButtons.style.display = 'block';
		
		return this;
	},
	
	purgeEditing: function(){
		var editing = this.editing;
		
		// make sure they get GCed
		editing.forEach(function(view){
			view.configurationEvent().cancel();
			view.purge();
		});
		
		// drop/truncate references
		editing.length = 0;
	},
	
	previousEdit: function(){
		// prepare the previous view for GC
		var oldView = this.editing.pop();
		if (oldView){
			oldView.purge();
		}

		// fetch the new view
		var newView = this.editing.pop();
		
		// If there are no views display default view
		if (!newView){
			return this.displayDefaultView();
		}

		// Clear the content pane and draw the new view
		// and add it back to the view queue 
		this.clear();
		this.displayButtons();
		this.getContentContainer().appendChild(newView.render());
		this.editing.push(newView);
		
		return this;

	},
	
	setConfigWidget: function(configWidget){
		this.defaultView.configWidget = configWidget;
		this.displayDefaultView();
		return this;	
	},

	displayDefaultView: function(){
		this.purgeEditing();
		
		var content = this.getContentContainer();
		this.clear();
		this.displayButtons();
		
		if (this.defaultView.deletable){
			this.btnDelete.classList.remove('nm-hidden');
		}
		else {
			this.btnDelete.classList.add('nm-hidden');	
		}
		
		content.appendChild(this.defaultView.configWidget.toElement());
		
		return this;
	},

	/**
	 * Toggle the settings manager. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	toggle: function(){
		if (this.nav.classList.contains('nm-menu-open')){
			return this.disable();
		}
		else {
			return this.enable();
		}
	},
	

	/**
	 * Enable the settings manager. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	enable: function(){
		this.nav.classList.add('nm-menu-open');	
		this.fireEvent('active');
		
		return this.displayDefaultView();
		
		// TODO: REMOVE
		//this.mediator.publish('settingsManager.defaultView', [this]);
	},
	

	/**
	 * Disable the settings manager. 
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	disable: function(){
		this.nav.classList.remove('nm-menu-open');
		var content = this.nav.querySelector('#nm-edit-content');
		while (content.firstChild) {
			content.removeChild(content.firstChild);
		}
		
		this.clear();
		this.fireEvent('deactive');

		return this;
	},
	

	/**
	 * This triggers a save event.
	 *
	 * @this {networkMap.SettingsManager}
	 * @return {networkMap.SettingsManager} self
	 */
	save: function(){
		this.fireEvent('save');

		return this;
	},
	
	
	setAction: function(action, actionInterface){
		networkMap.SettingsManager.isActionInterface(action, actionInterface);
		this._actions[action] = actionInterface;
		
		return this;
	},	
	
	_runAction: function(action, e){
		if (this._actions[action] === undefined){
			this._action = networkMap.SettingsManager._actions[action];
		}		
		
		if (this._actions[action] !== null && this._actions[action] !== undefined){
			this._action = this._actions[action];	
		}				
		
		if (this._action){
			// let the interface be able to remove the default buttons
			this.displayButtons();
			this._action.addEvent('hideButtons', function(){
				this.hideButtons();
			}.bind(this));
			
			this._action.addEvent('deletable', function(deletable){
				if (deletable){	
					return this.btnDelete.classList.remove('nm-hidden');
				}
				
				return this.btnDelete.classList.add('nm-hidden'); 
			}.bind(this));
			
			this._action.addEvent('cancel', this.previousEdit.bind(this));
			
			this._action.addEvent('addLink', function(e){
				this.mediator.publish('addLink', [e]);
				this.previousEdit();
			}.bind(this));			
			
			var el = this._action.render(e);
			
			if (el){
				this.clear();
				
				this.getContentContainer().appendChild(el);
				this.editing.push(this._action);
			}
			return el;
		}
	},	
	
	add: function(){
		return this._runAction('add');
	},
	
	addNode: function(){
		return this._runAction('addNode');
	},
	
	addLink: function(){
		return this._runAction('addLink');
	},
	
	configure: function(e){
		return this._runAction('configure', e);
	},
	
	delete: function(e){
		return this._runAction('delete', this.editing[this.editing.length - 1].configurationEvent());
	},
	
	modify: function(e){
		return this._runAction('modify', e);
	}
	
	

});


networkMap.SettingsManager._actions = {};

networkMap.SettingsManager.registerAction = function(action, actionInterface){
	networkMap.SettingsManager.isActionInterface(action, actionInterface);
		
	networkMap.SettingsManager._actions[action] = actionInterface;
	
	return true;
};

networkMap.SettingsManager.isActionInterface = function(action, actionInterface){
	if (!networkMap.find(['add', 'delete', 'addNode', 'addLink', 'configure'], function(item){ return item === action; }))
		throw 'Action not implemented: ' + action;
	
	if (!actionInterface.render || !networkMap.isFunction(actionInterface.render)){
		throw 'Class does not implement actionInterface.render for ' + action;
	}
	
	if (!actionInterface.purge || !networkMap.isFunction(actionInterface.purge)){
		throw 'Class does not implement actionInterface.purge for ' + action;
	}
	
	return true;
};
;networkMap.renderer = networkMap.renderer || {};
networkMap.renderer.settingsManager = networkMap.renderer.settingsManager || {};

networkMap.renderer.settingsManager.Add = function(){
	
};

networkMap.extend(networkMap.renderer.settingsManager.Add, networkMap.Observable);
networkMap.extend(networkMap.renderer.settingsManager.Add, {
	render: function(){
		
	},
	
	purge: function(){
		
	},
	
	toElement: function(){
		
	}
});
 
networkMap.SettingsManager.registerAction('add', new networkMap.renderer.settingsManager.Add());
;networkMap.renderer = networkMap.renderer || {};
networkMap.renderer.settingsManager = networkMap.renderer.settingsManager || {};

networkMap.renderer.settingsManager.AddLink = function(){
	this.el = null;
	this.state = this.states.notRendered;
};

networkMap.extend(networkMap.renderer.settingsManager.AddLink, networkMap.Observable);
networkMap.extend(networkMap.renderer.settingsManager.AddLink, {
	render: function(){
		this.state.render.call(this);
	},
	
	purge: function(){
		this.state.purge.call(this);		
	},
	
	states: {
		rendered: {
			render: function(){
				return this.el;	
			},
			purge: function(){
				// Clean up HTML
				this.state = this.states.notRendered;
			}
		},
		
		notRendered: {
			render: function(){
				// Render HTML
				this.state = this.states.rendered;
			},
			purge: function(){
				return true;
			}
		}
	}
});

networkMap.SettingsManager.registerAction('addLink', new networkMap.renderer.settingsManager.AddLink());
 ;networkMap.renderer = networkMap.renderer || {};
networkMap.renderer.settingsManager = networkMap.renderer.settingsManager || {};

networkMap.renderer.settingsManager.Delete = function(){
	this.el = null;
	this.state = this.states.notRendered;
};

networkMap.extend(networkMap.renderer.settingsManager.Delete, networkMap.Observable);
networkMap.extend(networkMap.renderer.settingsManager.Delete, {
	render: function(e){
		this.state.render.call(this, e);
	},
	
	purge: function(){
		this.state.purge.call(this);		
	},
	
	states: {
		rendered: {
			render: function(){
				return this.el;	
			},
			purge: function(){
				// Clean up HTML
				this.state = this.states.notRendered;
			}
		},
		
		notRendered: {
			render: function(e){
				if (e.deletable && window.confirm('Are you sure you want to delete the ' + e.type + ' ' + e.targetName)){
						e.destroy();
				}
				
				return null;
			},
			purge: function(){
				return true;
			}
		}
	}
});

networkMap.SettingsManager.registerAction('delete', new networkMap.renderer.settingsManager.Delete());
 ;networkMap.renderer = networkMap.renderer || {};

networkMap.renderer.settingsManager.Configure = function(){
	/** The element that should be rendered */
	this.el = null;
	
	/** The configuration event */
	this.e = null;
	
	/** The current state in the state machine */
	this.state = this.states.notRendered;
};

networkMap.extend(networkMap.renderer.settingsManager.Configure, networkMap.Observable);
networkMap.extend(networkMap.renderer.settingsManager.Configure, {
	render: function(e){
		return this.state.render.call(this, e);
	},
	
	purge: function(){
		return this.state.purge.call(this);		
	},
	
	configurationEvent: function(){
		return this.e;
	},
	
	states: {
		rendered: {
			render: function(e){	
				return this.el;	
			},
			purge: function(){
				// TODO: We should call a clean up method here
				this.el = null;
				this.state = this.states.notRendered;
			}
		},
		
		notRendered: {
			render: function(e){
				this.e = e;
				if (e.deletable){
					this.fireEvent('deletable', [true]);
				}
				else {
					this.fireEvent('deletable', [false]);
				}
				
				// Use the provided conf element
				if (e.configWidget.toElement){
					this.el = document.createElement('div');
					this.el.appendChild(e.configWidget.toElement());
				}
				else{ 
					// If we can not configure it we will not do it...
					return null;	
				}
				this.state = this.states.rendered;
				return this.el;
				
			},
			purge: function(){
				return true;
			}
		}
	}
});

networkMap.SettingsManager.registerAction('configure', new networkMap.renderer.settingsManager.Configure());;networkMap.renderer.link = networkMap.renderer.Link || {};
networkMap.renderer.link.UtilizationLabel = function(svg, options){
	this.label = null;
	this.rect = null;
	this.svg = svg;
	
	this.value = null;

	options = options || {};
	this.cx = options.cx || null;
	this.cy = options.cy || null;
	delete options.cx;
	delete options.cy;
		
	this.options = {
		enabled: false,
		padding: 2,
		fontSize: 8,
		digits: 0
	};
	this.setOptions(options);
	
	this.state = this.states.notRendered;
};

networkMap.extend(networkMap.renderer.link.UtilizationLabel, networkMap.Options);
networkMap.extend(networkMap.renderer.link.UtilizationLabel, networkMap.Observable);

networkMap.extend(networkMap.renderer.link.UtilizationLabel, {
	NULL_STRING: '  -  ',
	
	setPosition: function(cx, cy){
		this.cx = cx;
		this.cy = cy;
		return this;
	},
	
	render: function(value){ return this.state.render.call(this, value); },
	hide: function(){ return this.state.hide.call(this); },
	show: function(){ return this.state.show.call(this); },
	purge: function(){ return this.state.purge.call(this); },
	
	states: {
		notRendered: {
			render: function(value){
				if (!this.svg)
					return this;
				
				if (!this.options.enabled){
					return this;
				}

				value = value || this.value;
				
				var bgColor = '#ffffff', 
					strokeColor = '#000000',
					strokeWidth = 1;				
				
				var svg = this.svg;
	
				var label = this.label = svg.text(this.NULL_STRING)
				.font({
					family:   this.options.fontFamily,
					size:     this.options.fontSize,
					anchor:   'start',
					leading:  this.options.fontSize
				})
				.move(parseFloat(this.options.padding), parseFloat(this.options.padding));
				
				var bboxLabel = label.bbox();		
				var rect = this.rect = svg.rect(1,1)
					.fill({ color: bgColor})
					.stroke({ color: strokeColor, width: strokeWidth })
					.attr({ 
						rx: 2,
						ry: 2
					})
					.size(
						bboxLabel.width + this.options.padding * 2, 
						bboxLabel.height + this.options.padding * 2
					);
				label.front();
				
				this.state = this.states.rendered;
				this.render(value);
				return this;
			},
			hide: function(){
				return this;
			},
			show: function(){
				return this;
			},
			purge: function(){
				return this;	
			}
		},
		rendered: {
			render: function(value){
				value = this.value = value || this.value;
				
				value = (value === null) ? null : value * 100;
				if (!this.options.enabled || this.cx === null || this.cy === null){
					this.hide();
					return this;
				}
				
				this.show();
				
				if (value === null)
					this.label.text(this.NULL_STRING);	
				else		
					this.label.text(((value < 10) ? ' ' : '') + value.toFixed(this.options.digits) + '%');
					
				this.label.font({
					family:   this.options.fontFamily,
					size:     this.options.fontSize,
					leading:  this.options.fontSize
				})
				.move(parseFloat(this.options.padding), parseFloat(this.options.padding));
				
				var bboxLabel = this.label.bbox();	
				this.rect.size(
					bboxLabel.width + this.options.padding * 2, 
					bboxLabel.height + this.options.padding * 2
				);
				
				this.svg.center(parseFloat(this.cx), parseFloat(this.cy));	
				this.svg.front();
				return this;
				
			},
			hide: function(){
				this.svg.hide();
				this.state = this.states.hidden;
				
				return this;
			},
			show: function(){
				return this;
			},
			purge: function(node){}
		},
		hidden: {
			render: function(value){
				if (this.options.enabled){
					return this.show();
				}
				
				this.value = value;
				return this;
			},
			hide: function(){
				return this;
			},
			show: function(){
				this.svg.show();
				this.state = this.states.rendered;
				return this.render();			
			},
			purge: function(node){}
		}
		
	}

});;/**
 * Creates an instance of networkMap.Graph.
 *
 * @constructor
 * @this {networkMap.Graph}
 * @param {string|element} A string or Element to attach to network graph to
 * @param {Object} A options object.
 */
networkMap.Graph = function(target, options){
	/** The default options*/
	var defaults = {
		/** The with of the graph */
		width: 10,
		
		/** The height of the graph */
		height: 10,
		
		/** The name of the datasoruce to use */
		datasource: undefined,		
		
		/** The name of the colormap to use */
		colormap: undefined,
		
		/** Controls of the settings manager is created */
		enableEditor: true,
		
		/** Controls if the nodes are draggable */
		allowDraggableNodes: undefined,
		
		/** Controlls how often the links refresh the data */
		refreshInterval: 300,
		
		/** Controls if the link update should be controlled 
		 * by the graph or the link */ 
		batchUpdate: true,

		/** Controls if the grid is enabled */
		gridEnabled: true,		
		
		/** A grid size for objects to snap to */
		grid: {x:10, y:10},
		
		/** utilization labels */
		utilizationLabels: {
			enabled: false,
			fontSize: 8,
			padding: 2
		}
	};
	
	/** The default configuration */
	this.defaults = {};
	

	/** This array controls what is exported in getConfiguration*/
	this.exportedOptions = [
		//'width',
		//'height'
	];

	/** An internal array of nodes, do not use directly */
	this.nodes = [];

	/** An internal array of links, do not use directly */
	this.links = [];

	/** An internal reference to onSave configuration */
	this.saveData = {};

	/** An internal reference to check keep track of the mode */
	this._mode = 'normal';


	// Setup link generator for node
	this.node = this.node || {};
	
	options = options || {};
	if (options.node && options.node.linkGenerator){
		this.node.linkGenerator = networkMap.Node.createLinkGenerator(this.options.node.linkGenerator);
		delete options.node;
	} else{
		this.node.linkGenerator = networkMap.Node._linkGenerator;		
	}
	
	// setup link generator for link
	this.link = this.link || {};
	if (options.link && options.link.linkGenerator){
		this.link.linkGenerator = networkMap.Link.createLinkGenerator(this.options.link.linkGenerator);
		delete options.link;
	} else{
		this.link.linkGenerator = networkMap.Link._linkGenerator;		
	}

	this.properties = new networkMap.Properties(options, new networkMap.Properties(defaults));
	this.properties.addEvent('change', function(change){
		var gridChange = false;		
		var self = this;
		change.forEach(function(prop){
			if (prop.key === 'gridEnabled') gridChange = true;
			if (prop.key === 'grid') gridChange = true;
			if (prop.key === 'utilizationLabels') self.onUtilizationLabelsChange();
		});
		if (gridChange) this.onGridChange();
		self = null;				
	}.bind(this));
		
	// Setup node and link defaults
	this.defaults.node = new networkMap.Properties({}, networkMap.Node.defaults);
	this.defaults.link = new networkMap.Properties({}, networkMap.Link.defaults);
	this.defaults.link.set('colormap', this.properties.get('colormap'));
	this.defaults.link.set('datasource', this.properties.get('datasource'));

	// Create HTML
	this.element = (typeof target == 'string' || target instanceof String) ? document.getElementById(target) : target;
	this.container = document.createElement('div');
	this.container.classList.add('nm-container');
	this.element.appendChild(this.container);

	// create SVG
	this.svg = SVG(this.container);
	this.graph = this.svg.group();
	
	// Create legend
	this.legend = new networkMap.ColorLegend(this.defaults.link.get('colormap'), {graph: this, target: this.container});

	// Enable editor, this should be move to a separate function.
	if (this.properties.get('enableEditor')){
		this.settings = new networkMap.SettingsManager(this.container, this, new networkMap.event.Configuration({
			deletable: false,
			editable: true,
			editWidget: new networkMap.Graph.Module.Settings(this.defaults.node, this.defaults.link, this.properties).toElement(),
			target: this,
			type: 'graph',
			targetName: 'graph'
		}));
		
		this.settings.addEvent('active', this.enableEditor.bind(this));
		this.settings.addEvent('deactive', this.disableEditor.bind(this));
		this.settings.addEvent('save', this.save.bind(this));
	}

	// This is the way to externaly add a link from a GUI		
	this.subscribe('addLink', this.addLinkBySubsriber.bind(this));

	this.addEvent('resize', this.rescale.bind(this));
	
	this.setRefreshInterval(this.properties.get('refreshInterval'));
	
	this.svg.on('click', this._clickHandler.bind(this));

	this.addEvent('load', this.update.bind(this));
	
};

networkMap.extend(networkMap.Graph, networkMap.Observable);
networkMap.extend(networkMap.Graph, networkMap.Mediator);
networkMap.extend(networkMap.Graph, networkMap.Options);

networkMap.extend(networkMap.Graph, {
	
	/**
	 * Set the default options for the graph. The defaults will be 
	 * merged with the current defaults.
	 * 
	 * @param element {string} The element to set default options for.
	 * Can be one of (node|link)
	 * @param defaults {object} An object with key value pairs of options
	 * @return {networkMap.Graph} self
	 */
	setDefaults: function(element, properties){
		if (!this.defaults[element]){
			throw "Illigal element";
		}
		
		// set the properties will merge with configuration from user
		this.defaults[element].set(properties);
		
		// TODO: rework
		this.fireEvent('redraw', [{defaultsUpdated: true}]);
		
		return this;
	},

	/**
	 * Retrive the default configuration for a graph element
	 *
	 * @param element {string} The graph element to return defaults for.
	 * @return {object} the default configuration 
	 */
	getDefaults: function(element){
		if (!this.defaults[element]){
			throw "Illigal element";
		}
		
		return this.defaults[element];
	},

	/** 
	 * Set the intervall which the graph should refresh
	 *
	 * @param interval {int} interval in seconds. If null it 
	 * will disable the updates.  
	 * @return {networkMap.Graph} self
	 */
	setRefreshInterval: function(interval){
		this.properties.set('refreshInterval', interval);
		
		if (interval){
			this.intervalId = setInterval(function(){
				this.update();
			}.bind(this), interval*1000);
		}
		else if (this.intervalId){
			clearInterval(this.intervalId);
			delete this.intervalId;
		}
		
		return this;
	},

	/**
	 * Trigger an event in an object
	 * @param event {string} The event name to trigger 
	 * @param object {object} The object to trigger the event on
	 * 
	 * @return {networkMap.Graph} self
	 */
	triggerEvent: function(event, object){
		object.fireEvent(event, object);

		return this;
	},

	/**
	 * This will rescale the SVG element, and if it 
	 * does not fit it will will zoom out.
	 *
	 * @ retrun {networkMap.Graph} self
	 */
	rescale: function(){
		var docSize = {
			x: this.element.offsetWidth,
			y: this.element.offsetHeight
		};	
		
		this.svg.size(
			docSize.x, 
			docSize.y
		);
					
		var bbox = this.graph.bbox();	
		
		if (docSize.x > (Math.abs(bbox.x) + bbox.width) && docSize.y > (Math.abs(bbox.y) + bbox.height)){
			// the svg is within the docSize (with the exception if we have negative bbox.x and bbox.y
			this.svg.viewbox(
				(bbox.x < 0) ? bbox.x : 0,
				(bbox.y < 0) ? bbox.y : 0,
				docSize.x,
				docSize.y		
			);
		}
		else if (docSize.x > bbox.width && docSize.y > bbox.height){
			// the svg fits without scaling
			this.svg.viewbox(
				bbox.x - (docSize.x - bbox.width) / 2, 
				bbox.y - (docSize.y - bbox.height) / 2, 
				docSize.x, 
				docSize.y);
		}	
		else {
			// scale the svg to fit
			var scaleFactor = ((bbox.width - docSize.x) > (bbox.height - docSize.y)) ? bbox.width / docSize.x : bbox.height / docSize.y;
			this.svg.viewbox(
				bbox.x - 5, 
				bbox.y - 5, 
				docSize.x * scaleFactor + 10, 
				docSize.y * scaleFactor + 10
			);
			//this.svg.viewbox(bbox.x, bbox.y, bbox.width + Math.abs(bbox.x), bbox.height + Math.abs(bbox.y));
		}
		
		return this;		
	},

	/**
	 * Returns the root SVG object
	 *
	 * @ retrun {SVG}
	 */
	getSVG: function(){
		return this.svg;
	},

	/**
	 * Returns the main SVG group used for painting the graph
	 *
	 * @ retrun {SVG.Group}
	 */
	getPaintArea: function(){
		return this.graph;
	},

	/**
	 * Returns the settingsManager that is bound to the graph
	 *
	 * @ retrun {networkMap.SettingsManager}
	 */
	settingsManager: function(){
		return this.settings();
	},

	/**
	 * Generates HTML that is used for configuration
	 *
	 * @this {networkMap.Graph}
	 * @return {Element} A HTML Element that contains the UI
	 */
	getSettingsWidget: function(){
		var container = new networkMap.widget.Accordion();
		var accordionGroup;

		var changeHandler = function(defaults, key){
			return function(e, widget){
				defaults.set(key, widget.value());
			}.bind(this);
		}.bind(this);
	
		accordionGroup = container.add('Globals');
		accordionGroup.appendChild(new networkMap.widget.GridInput('Grid', {
			enabled: this.options.gridEnabled,
			grid: this.options.grid
		}).addEvent('change', function(e){
			if (e.value.enabled)
				this.grid(e.value.grid);
			else
				this.grid(false);
		}.bind(this)));
				
	
		accordionGroup = container.add('Node Defaults');		
		networkMap.each(networkMap.Node.defaultTemplate, function(option, key){
			if (option.type === 'number'){
				accordionGroup.appendChild(
					new networkMap.widget.IntegerInput(option.label, this.defaults.node.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.node, key)
					)
				);
			}
			else if(option.type === 'text'){
				accordionGroup.appendChild(
					new networkMap.widget.TextInput(option.label, this.defaults.node.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.node, key)
					)
				);
			}
			else if (option.type === 'color'){
				accordionGroup.appendChild(
					new networkMap.widget.ColorInput(option.label, this.defaults.node.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.node, key)
					)
				);
			}
		}.bind(this));
		
		accordionGroup = container.add('Link Defaults');		
		networkMap.each(networkMap.Link.defaultTemplate, function(option, key){
			if (option.type === 'number'){
				accordionGroup.appendChild(
					new networkMap.widget.IntegerInput(option.label, this.defaults.link.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.link, key)
					)
				);
			}
			else if(option.type === 'text'){
				accordionGroup.appendChild(
					new networkMap.widget.TextInput(option.label, this.defaults.link.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.link, key)
					)
				);
			}
			else if (option.type === 'color'){
				accordionGroup.appendChild(
					new networkMap.widget.ColorInput(option.label, this.defaults.link.get(key, true), option)
						.addEvent('change', changeHandler(this.defaults.link, key)
					)
				);
			}
		}.bind(this));
				
		
		return container;
	},

	grid: function(grid){
		if (grid === true){
			this.properties.set('gridEnabled', true);
			
			return this;
		}
		
		if (grid === false){
			this.properties.set('gridEnabled', false);	
		}		
		
		if (grid === undefined){
			if (!this.properties.get('gridEnabled'))
				return false;
				
			return this.properties.get('grid');
		}
		
		if (typeof grid === 'object'){
			this.properties.set('gridEnabled', true);			
			this.properties.set('grid', grid);
		}

		
		return this.onGridChange();
	},
	
	onGridChange: function(){
		this.disableDraggableNodes();
		this.enableDraggableNodes();
		
		return this;
	},
	
	onUtilizationLabelsChange: function(){
		var options = this.properties.get('utilizationLabels');
		this.links.forEach(function(link){
			link.setUtilizationLabelOptions(options);
		});
		options = null;
	},

	/**
	 * Load a network map, it can either be a URI string
	 * or an configuration object.
	 *
	 * @param {string|object} The thing to load
	 * @retrun {networkMap.Graph} self
	 * @throws "TypeError"
	 */
	load: function(obj){
		if (typeof obj == 'string' || obj instanceof String){
			return this.loadUrl(obj);
		}
		else if (obj !== null && typeof obj === 'object'){
			return this.loadObject(obj);
		}
		else{
			throw new TypeError('Unknown type ' + Object.prototype.toString.call(obj));
		}
		return this;
	},

	/**
	 * Loads a JSON file from the URL and builds a 
	 * network map.
	 *
	 * @param {string} The URL to the JSON file
	 * @ retrun {networkMap.Graph} self
	 */
	loadUrl: function(url){
		var request = new XMLHttpRequest();
		request.open('GET', url, true);

		request.onload = function() {
			if (request.status >= 200 && request.status < 400){
				// Success!
				this.loadObject(JSON.parse(request.responseText));
			} else {
				new networkMap.widget.Modal().alert('There was an error when loading the weathermap (' + request.status + ')', {title: 'Error'});
			}
		}.bind(this);

		request.onerror = function() {
			new networkMap.widget.Modal().alert('An error occurred when trying to load the resource', {title: 'Error'});
		};

		request.send();

		return this;
	},

	/**
	 * Load an object representation of a network map.
	 *
	 * @param {Object} The Object representation of the mao
	 * @ retrun {networkMap.Graph} self
	 */
	loadObject: function(mapStruct){
		this.setOnSave(mapStruct.onSave);
		mapStruct.nodes = mapStruct.nodes || [];
		mapStruct.links = mapStruct.links || [];
		
		if (mapStruct.defaults){
			
			// TODO: This can be removed as soon as all weathermaps are converted 
			if (mapStruct.defaults.graph && mapStruct.defaults.graph.utilizationLabels){
				if (mapStruct.defaults.graph.utilizationLabels.enabled === 'false')
					mapStruct.defaults.graph.utilizationLabels.enabled = false;
					
				if (mapStruct.defaults.graph.utilizationLabels.enabled === 'true')
					mapStruct.defaults.graph.utilizationLabels.enabled = true;
			}
				
			this.properties.set(mapStruct.defaults.graph || {});
		
			this.setDefaults('node', mapStruct.defaults.node || {});
			this.setDefaults('link', mapStruct.defaults.link || {});
		}
		
		mapStruct.nodes.forEach(function(node){
			node.graph = this;
			node.draggable = this.properties.get('allowDraggableNodes');
			
			this.addNode(new networkMap.Node(node), false);
		}.bind(this));

		mapStruct.links.forEach(function(link){
			link.graph = this;
			this.addLink(new networkMap.Link(link), false);
		}.bind(this));

		// TODO: Clean up!!!		
		this.settings.setConfigWidget(new networkMap.Graph.Module.Settings(this.defaults.node, this.defaults.link, this.properties).toElement());
		
		this.fireEvent('load', [this]);
		this.triggerEvent('resize', this);
		
		this.onUtilizationLabelsChange();
		
		return this;
	},

	/**
	 * This will set the configuration that controlls
	 * the save call. See documentation for onSave in
	 * the configuration file documentation for more 
	 * information.
	 *
	 * @param {Object} The onŚave configuration
	 * @ retrun {networkMap.Graph} self
	 */
	setOnSave: function(saveData){
		if (saveData){
			if (this.validateSave(saveData))
				this.saveData = saveData;
		}
		return this;
	},

	/**
	 * Retreive the configuration object for the save
	 * call. See documentation for onSave in the 
	 * configuration file documentation for more 
	 * information.
	 *
	 *
	 * @ retrun {Object} The onSave configuration.
	 */
	getOnSave: function(){
		return (this.saveData) ? this.saveData : {};
	},

	
	/**
	 * Validate a onSave configuration object. Returns
	 * true if it validates, false otherwise.
	 * structure:
	 * "onSave": {
	 *  "method": "post|get",
	 *  "url": "update.php",
	 *  "data": {
	 *   "id": "weathermap.json"		
	 *  }
	 * }
	 *
	 * @ retrun {boolean} The onSave configuration.
	 */
	validateSave: function(save){
		if (save.method && !(save.method == 'post' || save.method == 'get')){
			this.saveEnabled = false;
			alert("Illigal argument: " + save.method + ". Valid onSave.method arguments are: post, get"); 
			return false;
		}
		else{
			save.method = "post";	
		}
				
		save.data = save.data || {};
		
		if (!save.url){
			this.saveEnabled = false;
			alert("Missing argument onSave.url");	
			return false;
		}
		
		return true;		
	},

	/**
	 * Send a save request to the server.
	 *
	 * @ retrun {boolean} If request could be sent
	 * @todo Emit event when save is compleated
	 */
	save: function(){
		if (!this.saveData)
			return false;
			
		var data = this.getConfiguration();

		var html = this.settings.btnSave.innerHTML;
		this.settings.btnSave.textContent = '.....';

		//var params = networkMap.toQueryString(data);
		var request = new XMLHttpRequest();

		request.open(this.saveData.method, this.saveData.url, true);
		request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		
		//request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		request.onload = function() {
			this.settings.btnSave.innerHTML = html;
			if (request.status >= 200 && request.status < 400){
				data = JSON.parse(request.responseText);
				if (data.status === 'ok'){
					new networkMap.widget.Modal().alert('Weathermap saved');
				}
				if (data.status === 'nok'){
					new networkMap.widget.Modal().alert(data.error, {title: 'Error'});
				}
				if (data.status == 'deleted'){
					new networkMap.widget.Modal().alert('The networkmap is deleted', {title: 'Error'});
				}
			} else {
				new networkMap.widget.Modal()
					.alert('There was an error while saving the weathermap (' + request.status + ')', {title: 'Error'});
			}
		}.bind(this);

		request.onerror = function() {
			this.settings.btnSave.innerHTML = html;
			new networkMap.widget.Modal()
				.alert('There was an error while saving the weathermap', {title: 'Error'});
		};

		request.send(JSON.stringify(data));
	
		return true;
	},

	mode: function(){
		return this._mode;
	},

	/**
	 * Set nodes and links in edit mode
	 *
	 * @ retrun {networkManager.Graph} self
	 */
	enableEditor: function(){
		this.enableDraggableNodes();
		this.nodes.forEach(function(node){
			node.mode('edit');
		});

		this.links.forEach(function(link){
			link.mode('edit');
		});
		
		this._mode = 'edit';

		return this;
	},

	/**
	 * Disable edit mode on nodes and links.
	 *
	 */
	disableEditor: function(){
		this.disableDraggableNodes();
		
		this.nodes.forEach(function(node){
			node.mode('normal');
		});
		this.links.forEach(function(link){
			link.mode('normal');
		});

		this._mode = 'normal';

		return this;
	},
	
	_clickHandler: function(e){
		if (this._mode !== 'edit'){
			return;
		}
		
		if (e.target.instance === this.svg || e.target.instance === this.graph){
			this.settings.displayDefaultView();
		}
		//TODO: REMOVE
		/* 
		if (e.target.instance === this.svg || e.target.instance === this.graph){
			this.publish('edit', new networkMap.event.Configuration({
				deletable: false,
				editable: true,
				editWidget: new networkMap.Graph.Module.Settings(this.defaults.node, this.defaults.link, this.properties).toElement(),
				target: this,
				type: 'graph',
				targetName: 'graph'
			}));
		}
		*/
	},

	/**
	 * Enable draggable nodes
	 *
	 * @ retrun {networkMap.Graph} self
	 */
	enableDraggableNodes: function(){
		this.nodes.forEach(function(node){
			node.draggable();
		});

		return this;		
	},

	/**
	 * disable draggable nodes
	 *
	 * @ retrun {networkMap.Graph} self
	 */
	disableDraggableNodes: function(){
		this.nodes.forEach(function(node){
			node.fixed();	
		});

		return this;
	},

	/**
	 * Fetch configuration from links and nodes
	 *
	 * @ retrun {Object} A networkmap configuration object
	 */
	getConfiguration: function(){
		var configuration = {
			defaults: {
				graph: this.properties.extract(),
				node: this.defaults.node.extract(),
				link: this.defaults.link.extract()
			},
			nodes: [],
			links: [],
			onSave: this.saveData
		};

		// self
		this.exportedOptions.forEach(function(option){
			configuration[option] = this.options[option];
		}.bind(this));
		configuration.onSave = this.saveData;

		// nodes
		this.nodes.forEach(function(node){
			configuration.nodes.push(node.getConfiguration());
		});

		// links
		this.links.forEach(function(link){
			configuration.links.push(link.getConfiguration());
		});

		return configuration;
	},

	registerLinkGenerator: function(component, f){
		this._linkGenerator[component] = f;
	},

	/**
	 * Add a node to the graph
	 *
	 * @param {networkMap.Node} The node to add
	 * @param {Boolean ? true } If set to false the resize event will not be triggered
	 * @ retrun {networkMap.Graph} self
	 * @todo refactor to a factory method
	 */
	addNode: function(node, refresh){
		this.nodes.push(node);

		// listen to the requestHref to provide node href
		node.addEvent('requestHref', this.node.linkGenerator);
		
		// as the node is already created we need to trigger an update of the link
		node.updateLink();

		if (refresh !== false){
			this.triggerEvent('resize', this);	
		}

		return this;
	},

	/**
	 * Get the node with ID = id, returns undefined 
	 * if the node does not exist.
	 *
	 * @param {string} A node id
	 * @ retrun {networkMap.Node} The node or undefined
	 */
	getNode: function(id){
		return networkMap.find(this.nodes, function(node){	
			if (node.options.id === id){
				return true;
			}
		});
	},
	
	/**
	 * Remove a node from the graph
	 *
	 * @param {networkMap.Node} The node to remove
	 * @ retrun {networkMap.Graph} self
	 * @todo refactor so the node is removed by unseting 
	 * the graph reference in the node.
	 */
	removeNode: function(node){
		this.nodes.erase(node);
		node.setGraph(null);

		this.getLinks(node).forEach(function(link){
			this.removeLink(link);
		}.bind(this));		
		
		return this;
	},

	/**
	 * Add a link to the graph
	 *
	 * @param {networkMap.Link} The link to add
	 * @param {Boolean ? true} If set to false the resize event will not be triggered
	 * @ retrun {networkMap.Graph} self
	 * @todo this should happen when the setting 
	 *	the graph in the link.
	 */
	addLink: function(link, refresh){
		
		this.links.push(link);

		// listen to the requestHref to provide link href
		link.addEvent('requestHref', this.link.linkGenerator);
		
		// as the link is already created we need to trigger an update of the link
		link.updateHyperlinks();

		
		if (refresh !== false){
			this.triggerEvent('resize', this);	
		}
		

		return this;
	},	
	
	addLinkBySubsriber: function(e){
		var self = this;
		if (e.nodes){
			e.nodes.each(function(options){
				if (self.getNode(options.id))
					return;
				
				options.graph = options.graph || self;
				var node = new networkMap.Node(options);
				self.addNode(node);
				
				// TODO: The node should now this
				if (self.mode() === 'edit'){
					node.draggable().mode('edit');	
				}
			});	
		}
		
		
		if (!this.getLink(e.link.nodeA.id, e.link.nodeB.id)){
			e.link.graph = e.link.graph || this;
			var link = new networkMap.Link(e.link);
			this.addLink(link);
			link.update(true);
			
			if (this.mode() === 'edit'){
				link.mode('edit')	;
			}
		}
		return this;
	},

	getLink: function(nodeIdA, nodeIdB){
		return networkMap.find(this.links, function(link){
			if (link.nodeA.options.id === nodeIdA && link.nodeB.options.id === nodeIdB){
				return true;
			}
			if (link.nodeA.options.id === nodeIdB && link.nodeB.options.id === nodeIdA){
				return true;
			}

		});
	},

	getLinks: function(node, secondaryNode){
		var links = [];		
		
		this.links.forEach(function(link){
			if (link.connectedTo(node, secondaryNode)){
				links.push(link);
			}
		});
		
		return links;
	},

	/**
	 * Remove a link from the graph
	 *
	 * @param {networkMap.Link} The link to remove
	 * @ retrun {networkMap.Graph} self
	 */
	removeLink: function(link){
		this.links.erase(link);
		link.setGraph(null);
		return this;
	},

	/**
	 * Signal links to call the datasource to refresh.
	 *
	 * @ retrun {networkMap.Graph} self
	 */
	refresh: function(){
		console.log("refresh is depricated, use update instead");

		return this.update();
	},

	registerUpdateEvent: function(datasource, url, link, callback){
		this.$updateQ = this.$updateQ || {}; 
		this.$updateQ[datasource] = this.$updateQ[datasource] || {};
		this.$updateQ[datasource][url] = this.$updateQ[datasource][url] || [];

		// register datasources for internal use in the link
		this.$updateQ[datasource][url].push({
			link: link,
			callback: callback
		});
	},

	/**
	 * Refresh links in batch mode. This method does not work
	 * at the moment.
	 */
	update: function(){
		if (this.properties.get('batchUpdate'))
			return this.batchUpdate();		
		
		this.links.forEach(function(link){
			link.localUpdate();
		});

		return this;
	},
	
	batchUpdate: function(){
		this.$updateQ = this.$updateQ || {};
		networkMap.each(this.$updateQ, function(urls, datasource){
			if (!networkMap.datasource[datasource]){
				throw 'Unknown datasource (' + datasource + ')';
			}
			
			networkMap.each(urls, function(requests, url){
				networkMap.datasource[datasource](url, requests);
			}.bind(this));
		}.bind(this));
		
		return this;
	},
	
	


});;networkMap.Graph.Module = networkMap.Graph.Module || {};

networkMap.Graph.Module.Settings = function(nodeProperties, linkProperties, graphProperties){
	this.nodeProperties = nodeProperties;
	this.linkProperties = linkProperties;
	this.graphProperties = graphProperties;
};

// types: angle, bool, float, int, number, length, list, string, color
// https://api.tinkercad.com/libraries/1vxKXGNaLtr/0/docs/topic/Shape+Generator+Overview.html
networkMap.extend(networkMap.Graph.Module.Settings, {
	toElement: function(nodeProperties, linkProperties, graphProperties){
		nodeProperties = nodeProperties || this.nodeProperties;
		linkProperties = linkProperties || this.linkProperties;
		graphProperties = graphProperties || this.graphProperties;		
		
		var container = new networkMap.widget.Accordion();
		
		var nodeConfiguration = new networkMap.Node.Module.Settings(nodeProperties, {
			onlyGlobals: true,
			header: 'Node Defaults',
			container: container
		});
		
		var linkConfiguration = new networkMap.Link.Module.Settings(linkProperties, {
			onlyGlobals: true,
			header: 'Link Defaults',
			container: container
		});		
		
		var accordionGroup;

		var changeHandler = function(defaults, key){
			return function(e, widget){
				defaults.set(key, widget.value());
			}.bind(this);
		}.bind(this);
	
		accordionGroup = container.add('Globals');
		accordionGroup.appendChild(new networkMap.widget.GridInput('Grid', {
			enabled: graphProperties.get('gridEnabled'),
			grid: graphProperties.get('grid')
		}).addEvent('change', function(e){
				graphProperties.set({'grid': e.value.grid, 'gridEnabled': e.value.enabled});	
		}.bind(this)));
		
		accordionGroup = container.add('Utilization Labels');
		var utilizationLabels = graphProperties.get('utilizationLabels');
		accordionGroup.appendChild(new networkMap.widget.Checkbox('Enabled', utilizationLabels.enabled)
			.addEvent('change', function(e){
				utilizationLabels.enabled = e.value;
				graphProperties.set('utilizationLabels', utilizationLabels);	
			}.bind(this)));
			
		accordionGroup.appendChild(new networkMap.widget.IntegerInput('Padding', utilizationLabels.padding)
			.addEvent('change', function(e){
				utilizationLabels.padding = e.value;
				graphProperties.set('utilizationLabels', utilizationLabels);	
			}.bind(this)));
			
		accordionGroup.appendChild(new networkMap.widget.IntegerInput('Font size', utilizationLabels.fontSize)
			.addEvent('change', function(e){
				utilizationLabels.fontSize = e.value;
				graphProperties.set('utilizationLabels', utilizationLabels);	
			}.bind(this)));
				
		
		nodeConfiguration.toElement();
		linkConfiguration.toElement();
				
		this.el = container;
		
		return container;
	}
});;networkMap.Node = function(options){

	this.graph = options.graph;
	delete options.graph;

	this.properties = new networkMap.Properties(options, networkMap.Node.defaults);

	this.configurationWidget = new networkMap.Node.Module.Settings();

	/** TODO: Replace inline function with this.refresh */
	this.properties.addEvent('change', function(change){
		this.options = this.properties.configuration();

		// TODO: Remove hack for stoping redraw of node when dragged
		// TODO: Prevent click event after drag.
		if (change.length >= 1 && (change[0].key === 'x' || change[0].key === 'y'))
			return;

		this.draw();
	}.bind(this));

	this.options = this.properties.configuration();

	if (!this.options.id){
		throw "Node(create, no id given)";
	}
	
	this.options.x = parseFloat(this.options.x);
	this.options.y = parseFloat(this.options.y);
	this.options.padding = parseFloat(this.options.padding); 

	this.setGraph(this.graph);

};

networkMap.extend(networkMap.Node, networkMap.Options);
networkMap.extend(networkMap.Node, networkMap.Observable);
networkMap.extend(networkMap.Node, {
	
	
	_mode: 'normal',
	exportedOptions: [
		'id',
		'name',
		'comment',
		'x',
		'y',
		'lat',
		'lng',
		'weight',
		'renderer',
		'information',
		'label',
		'padding',
		'href',
		'style',
		'events',
		'fontFamily',
		'fontSize',
		'bgColor',
		'strokeColor',
		'strokeWidth' 
	],
	

	

	/**
	 * Update an option
	 *
	 * @param {string} The property to change
	 * @param {mixed} The value to set
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	setProperty: function(key, value){
		if (!this.editTemplate[key]){
			throw 'Unknow id: ' + key;
		}
		
		this.properties.set(key, value);
		this.options = this.properties.configuration();
				
		return this;
	},

	/**
	 * Ǵet a property value
	 *
	 * @param {string} The property to get
	 * @this {networkMap.Node}
	 * @return {mixed} The property value
	 */
	getProperty: function(key){
		
		return this.properties.get(key, true).value;
		//return this._localConfig[key];
	},

	/**
	 * Genereats a configuration object
	 *
	 * @this {networkMap.Node}
	 * @return {Object} The node configuration
	 */
	getConfiguration: function(){
		return this.properties.extract();
	},

	
	/**
	 * Enable an event on the node
	 *
	 * @param {string} The type of event [hover|click]
	 * @this {options} The options for event
	 * @return {networkMap.Node} self
	 */
	enableEvent: function(name, options){
		if (name !== 'hover' && name !== 'click'){
			throw "Unknown event";
		}
		
		this.options.events = this.options.events || {};		
		this._localConfig.events = this._localConfig.events || {};
		
		var defaultOptions = {enabled: true};
		this.options.events[name] = options || defaultOptions;
		this._localConfig.events[name] = options || defaultOptions;

		return this;
	},
	
	/**
	 * Disable an event on the node
	 *
	 * @param {string} The type of event [hover|click]
	 * @return {networkMap.Node} self
	 */
	disableEvent: function(name, options){
		if (this.options.events && this.options.events[name]){
			delete this.options.events[name];
			delete this._localConfig.events[name];
		}
		
		return this;
	},
	
	/**
	 * Set the graph that the Node is associated to. 
	 * If set to null the Node will unregister from the 
	 * graph.
	 *
	 * @param {networkMap.Graph} The graph
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	setGraph: function(graph){

		// remove the current graph if it excists		
		if (this.graph){
			this.graph.removeEvent('redraw', this._redraw.bind(this));
			this.graph = null;
			this.draw();
		}

		// add graph object if it exists
		if (graph){
			this.graph = graph;
			this.properties.setDefaults(graph.getDefaults('node'));
			// TODO: Rework
			this.options = this.properties.configuration();
			this.graph.addEvent('redraw', this._redraw.bind(this));
			this.draw();
		}

		return this;
	},
	
	/* TODO: Depricate function */
	_redraw: function(){
		this.draw();
	},

	/**
	 * Get/set the mode of the node. The mode can either
	 * be "normal" or "edit". In "edit" mode the nodes 
	 * clickHandler will not forward click events to
	 * click events registed with networkMap.registerEvent
	 *
	 * @param {string} The mode or undefined to get the mode
	 * @this {networkMap.Node}
	 * @return {networkMap.Node|String} Returns either the mode or 
	 * self
	 */
	mode: function(mode){
		if (!mode){
			return this._mode;
		}
		
		if (mode === 'edit' || mode === 'normal'){
			this._mode = mode;
		}
		else{
			throw 'Unknown mode: ' + mode;	
		}
		
		return this;
	},

	/**
	 * The clickHandler is an internal function which forwards
	 * click events to either the registed click event or to the 
	 * settingsManager.
	 *
	 * @param {Event} The click event
	 * @this {networkMap.Node}
	 * @return {undefined}
	 */
	_clickhandler: function(e){
		if (e.target.instance.data('dragged')){
			e.preventDefault();
			return;
		}
		
		if (this._mode === 'normal' && this.options.events && this.options.events.click){
			networkMap.events.click(e, this);
		}
		else if (this._mode === 'edit'){
			e.preventDefault();
			
			
			if (this.svg.dragged)
				return;
			
			this.graph.publish('edit', [new networkMap.event.Configuration({
				deletable: true,
				destroy: function(){ 
					this.graph.removeNode(this); 
				}.bind(this),
				editable: true,
				editWidget: this.configurationWidget.toElement(this.properties),
				target: this,
				type: 'node',
				targetName: this.properties.get('name')
			})]);
		}
	},	

	/**
	 * Get the x coordinate of the node
	 *
	 * @this {networkMap.Node}
	 * @return {number} The x coordinate of the node
	 */
	x: function(){
		return this.svg.bbox().x;
	},
	
	/**
	 * Get the y coordinate of the node
	 *
	 * @this {networkMap.Node}
	 * @return {number} The y coordinate of the node
	 */
	y: function(){
		return this.svg.bbox().y;
	},

	/**
	 * Make the node draggable
	 *
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	draggable: function(){
		this._draggable = true;
		//this.svg.draggable({grid: this.graph.grid()});
		
		var grid = this.graph.grid();
		var dragLimit = 5;
		this.svg.draggable(function(x, y, element, delta){
			if (!element.dragged && (Math.abs(delta.x) <  dragLimit && Math.abs(delta.y) < dragLimit)){
				return false;
			}
			
			if (grid)
				return {
					x: x - x % grid.x,
					y: y - y % grid.y
				};
			else
				return true;
		});
		this.svg.remember('cursor', this.svg.style('cursor'));
		this.svg.style('cursor', 'move');
		
		return this;
	},	

	/**
	 * Make the node fixed, i.e. ńot draggable.
	 *
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	fixed: function(){
		this._draggable = false;
		this.svg.fixed();
		var cursor = this.svg.remember('cursor');
		this.svg.forget('cursor');
		this.svg.style('cursor', cursor || 'default');
		
		return this;
	},

	/**
	 * Returns true if the node is draggable
	 * false otherwise.
	 *
	 * @this {networkMap.Node}
	 * @return {boolean} The draggable status
	 */
	isDraggable: function(){
		return this._draggable;
	},

	/**
	 * This will create/update a link tag for the
	 * node. Order of presence is:
	 * - options.href
	 * - emit url event
	 *
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	updateLink: function(){
		var href = this.options.href;
		if (href){
			if (networkMap.isFunction(href))
				this.setLink(href(this));
			else
				this.setLink(href);
			return this;
		}
		
		this.fireEvent('requestHref', [this]);
		return this;
	},
	
	/**
	 * This will create/update the link to
	 * the specified URL.
	 *
	 * @param {string} The URL
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 * @TODO: Add functionality to remove the link
	 */
	setLink: function(url){
		if (url){
			if (this.link){
				this.link.to(url);
				return this;
			}
			
			// We take the parent object to get the link
			this.link = this.svg.linkTo(url).parent;
			return this;
		}
		
		return this;						
	},

	/**
	 * Get the bonding box of the node.
	 *
	 * @this {networkMap.Node}
	 * @return {SVG.BBox} The nodes bounding box
	 */
	bbox: function(){
		return this.svg.bbox();
	},

	/**
	 * Draw/redraw the node
	 *
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	draw: function(){
		var redraw = false;
		
		if (this.svg){
			this.svg.remove();
			if (this.link) this.link.remove();
		
			if (!this.graph)
				return false;			
			
			redraw = true;
		}
		
		if (!this.graph){
			return false;
		}
		
		if (this.debug){
			this.debug.remove();
		}
		
		if (this.options.debug){
			this.debug = this.graph.getPaintArea().group();
		}

		// create a group object 
		var svg = this.svg = this.graph.getPaintArea().group();
		
				
		this.updateLink();

		// create the label first to get size
		var label = svg.text(this.options.name)
			.font({
				family:   this.options.fontFamily,
				size:     this.options.fontSize,
				anchor:   'start',
				leading:  this.options.fontSize - 1
			})
			.move(parseFloat(this.options.padding), parseFloat(this.options.padding));

		
		// This is needed to center an scale the comment text
		// as it is not possible to get a bbox on a tspan
		var bboxLabel = label.bbox();
		var comment;
		if (this.options.comment && this.options.comment !== ''){
			label.text(function(add){
				add.tspan(this.options.name).newLine();
				comment = add.tspan(this.options.comment).newLine().attr('font-size', this.options.fontSize - 2);
			}.bind(this));
			comment.attr('text-anchor', 'middle');
			comment.dx(bboxLabel.width / 2);
		}	
		while (bboxLabel.width < label.bbox().width){
			comment.attr('font-size', comment.attr('font-size') - 1);
		}

		// create the rect
		bboxLabel = label.bbox();		
		var rect = svg.rect(1,1)
			.fill({ color: this.options.bgColor})
			.stroke({ color: this.options.strokeColor, width: this.options.strokeWidth })
			.attr({ 
				rx: 4,
				ry: 4
			})
			.size(
				bboxLabel.width + this.options.padding * 2, 
				bboxLabel.height + this.options.padding * 2
			);
							
		label.front();
		

		
		svg.on('click', this._clickhandler.bind(this));
		
		if (this.options.events){
			svg.link = this.options.events;
			
			if (this.options.events.click){
				svg.attr('cursor', 'pointer');
			}	
			
		}

		// this cover is here there to prevent user from selecting 
		// text in the label
		var cover = rect.clone().fill({opacity: 0}).front();

		// move it in place
		svg.move(parseFloat(this.options.x), parseFloat(this.options.y));
		
	
		
		if (this.options.draggable){
			this.draggable();
		}
		
		svg.dragstart = function(){
			this.fireEvent('dragstart');
		}.bind(this);
		svg.dragmove = function(delta, event){
			this.fireEvent('drag', [delta, event]);
		}.bind(this);
		svg.dragend = function(){
			this.properties.set({
				x: this.x(),
				y: this.y()
			});
			this.fireEvent('dragend');
		}.bind(this);
		
		// need to make sure the draggable state persists
		if (this.isDraggable()){
			this.draggable();
		}

		this.fireEvent('dragend');

		return true;
	}
});

networkMap.Node.defaultTemplate = {
	padding: {
		label: 'Padding',
		type: 'number',
		min: 0
	},
	fontSize: {
		label: 'Font size',
		type: 'number',
		min: 1
	},
	bgColor: {
		label: 'Color',
		type: 'color'
	},
	strokeColor: {
		label: 'Stroke color',
		type: 'color'
	},
	strokeWidth: {
		label: 'Stroke width',
		type: 'number',
		min: 0
	}
};

/**
 * Register a global handler to provide a href to Nodes
 * This can be overridden on the networkMap instance or
 * or setting it directly on the node.
 * 
 * The registered function should return a url string 
 * or null if no link should be created. See implementation
 * of networkMap.Node._linkGenerator for a reference 
 * implementation
 *
 * @param {function} A function that returns an URL or null
 */
networkMap.Node.registerLinkGenerator = function(f){
	networkMap.Node._linkGenerator = networkMap.Node.createLinkGenerator(f);
};

networkMap.Node.createLinkGenerator = function(f){
	return function(node){
		var href = node.properties.get('href');
		if (href){
			if (networkMap.isFunction(href))
				node.setLink(href());
			else
				node.setLink(href);
			return;
		}
		
		node.setLink(f(node));
	};
};


/** Register a default link generator which will not create a link */
networkMap.Node.registerLinkGenerator(function(node){return null;});


/** Register defaults properties for networkMap.Node */
networkMap.Node.defaults = new networkMap.Properties({
	name: null,
	comment: null,
	x: 10,
	y: 10,
	lat: null,
	lng: null,
	weight: null,
	fontFamily: 'Helvetica',
	fontSize: 16,
	bgColor: '#dddddd',
	strokeColor: '#000000',
	strokeWidth: 2,
	information: {

	},
	data:{
		value: null,
		realValue: null
	},
	label: {
		position: 'internal',
		visable: true
	},
	renderer: 'rect', //rect, circle, image(url), svg(ulr)
	padding: 10,
	href: null,
	style: null,
	debug: false,
	draggable: false
});


;networkMap.Node.Module = networkMap.Node.Module || {};

networkMap.Node.Module.Settings = function(properties, options){
	this.options = {
		onlyGlobals: false,
		header: 'Globals',
		container: null
	};	
	this.setOptions(options);
	
	this.properties = properties;
};

networkMap.extend(networkMap.Node.Module.Settings, networkMap.Options);

// types: angle, bool, float, int, number, length, list, string, color
// https://api.tinkercad.com/libraries/1vxKXGNaLtr/0/docs/topic/Shape+Generator+Overview.html
networkMap.extend(networkMap.Node.Module.Settings, {

	/** Definitions of the parameters */
	parameters: {
		id: {
			label: 'ID',
			type: 'text',
			disabled: true,
			global: false
		},
		name: {
			label: 'Name',
			type: 'text',
			global: false
		},
		comment: {
			label: 'Comment',
			type: 'text',
			global: false
		},
		padding: {
			label: 'Padding',
			type: 'number',
			min: 0,
			global: true
		},
		fontSize: {
			label: 'Font size',
			type: 'number',
			min: 1,
			global: true
		},
		bgColor: {
			label: 'Color',
			type: 'color',
			global: true
		},
		strokeColor: {
			label: 'Stroke color',
			type: 'color',
			global: true
		},
		strokeWidth: {
			label: 'Stroke width',
			type: 'number',
			min: 0,
			global: true
		}
		
	},

	/**
	 * Generates HTML that is used for configuration
	 *
	 * @this {networkMap.Node}
	 * @return {Element} A HTML Element that contains the UI
	 */
	toElement: function(properties){
		properties = properties || this.properties;
		
		var container = this.options.container || new networkMap.widget.Accordion();
		var accordionGroup;

		var changeHandler = function(key, properties){
			return function(e, widget){
				properties.set(key, widget.value());	
			};
		};
	
		accordionGroup = container.add(this.options.header);		
		networkMap.each(this.parameters, function(option, key){
			if (this.options.onlyGlobals && !option.global)
				return;
				
			if (option.type === 'number'){
				accordionGroup.appendChild(new networkMap.widget.IntegerInput(option.label, properties.get(key), option).addEvent('change', changeHandler(key, properties)));
			}
			else if(option.type === 'text'){
				accordionGroup.appendChild(new networkMap.widget.TextInput(option.label, properties.get(key), option).addEvent('change', changeHandler(key, properties)));
			}
			else if (option.type === 'color'){
				accordionGroup.appendChild(new networkMap.widget.ColorInput(option.label, properties.get(key), option).addEvent('change', changeHandler(key, properties)));	
			}
		}.bind(this));
		
		return container;
	}
});;/**
 * Register global event handlers. These can be over ridden on the 
 * networkMap instance and on the node instance.
 *
 * @param {string} The event name (click, mouseover, mouseout, hover)
 * @param {function} The value to set
 * @this {???}
 * @return {???}
 */
networkMap.Node.registerEvent = function(name, f){
	if (name === 'hover'){
		return this.registerHover(f);
	}

	if (!networkMap._events[name])
		throw "Invalid event: " + name;
		
	networkMap._events[name] = f;
};

networkMap.Node.registerEvent.registerHover = function(f){
	
	/** default mouseover event
	 * By overriding this function the hover 
	 * will stop working event 
	 */
	var mouseover = function(e, options, hover){
		var el = document.id('nm-active-hover');
		var id = e.target.instance.attr('id');
		
		if (el){
			if (el.retrieve('id') === e.target.instance.attr('id')){
				el.store('keep', true);
				return;
			}
			
			el.destroy();	
		}
		
		el = new Element('div', {
			'id': 'nm-active-hover',
			'class': 'nm-hover',
			events: {
				mouseover: function(){
					el.store('mouseover', true);
				},
				mouseout: function(){
					el.eliminate('mouseover');
					(function(){
						if (!el.retrieve('keep'))
							el.destroy();
						else
							el.eliminate('keep');
					}).delay(10);
				},
				click: function(ev){
					node._clickHandler(e);
				}
			}
		})
		.store('id', e.target.instance.attr('id'));
		
		el.setStyles({
			top: -1000,
			left: -1000	
		});
				
		document.id(document.body).grab(el);
					
		f(e, node, el);
		
		var size = el.getSize();
		var bboxClient = e.target.getBoundingClientRect();
		
		el.setStyles({
			top: (bboxClient.top + bboxClient.bottom)/2 - size.y/2,
			left: (bboxClient.left + bboxClient.right)/2 - size.x/2
		});
	};
	
	/** default mouseout event
	 * By overriding this function the hover 
	 * will stop working event 
	 */
	var mouseout = function(e, node){
		var options = e.target.instance.node;
		(function(){
			var el = document.id('nm-active-hover');
			if (el && el.retrieve('id') !== e.target.instance.attr('id')){
				return;	
			}

			if (el && !el.retrieve('mouseover')){
				el.destroy();
			}
		}).delay(10);
	};
	
	networkMap.Node.registerEvent('mouseover', mouseover);
	networkMap.Node.registerEvent('mouseout', mouseout);
};


/** Default implementaion of events */
networkMap.Node._events = {
	/** default click event */
	click: function(e, node){},
	
	mouseover: function(e, options, hover){},	

	mouseout: function(e, node){},	
	
	/** default hover event */
	hover: function(e, node, el){
		el.set('text', node.options.name);
	}
};

;
networkMap.LinkPath = function(subLink, svg, options){
	this.properties = new networkMap.Properties(options, subLink.properties);
	this.properties.addEvent('change', function(change){
		this.fireEvent('change', change);
	}.bind(this));

	this.subLink = subLink;
	this.mediator = this.getLink().graph;
	this.svg = svg;
	this.value = null;
	
	// Hide the SVG node in case we will not use it
	// otherwise it will affect the BBOX calculation
	svg.hide();
	this.setupEvents();
};

networkMap.extend(networkMap.LinkPath, networkMap.Options);
networkMap.extend(networkMap.LinkPath, networkMap.Observable);
networkMap.extend(networkMap.LinkPath, {	
	purge: function(){
		return this;
	},

	hide: function(){
		this.svg.hide();
		
		return this;
	},
	
	show: function(){
		this.svg.show();
		
		return this;
	},

	remove: function(){
		this.svg.remove();
	},
	
	getEditables: function(){
		var editables = {
			width: {
				label: 'Local width',
				type: 'int'	
			}	
		};
		
		return editables;		
	},


	/**
	 * This will create/update a link tag for the
	 * link. Order of presence is:
	 * - options.href
	 * - emit url event
	 *
	 * @this {networkMap.Link}
	 * @return {networkMap.Link} self
	 */
	updateHyperlink: function(){
		var href = this.properties.get('href');
		if (href){
			if (networkMap.isFunction(href))
				this.setLink(href(this));
			else
				this.setLink(href);
			return this;
		}
		
		this.fireEvent('requestHref', [this]);
		return this;
	},

	updateBgColor: function(color){
		if (!color){
			this.svg.fill(this.options.background);
			return this;
		}
		
		this.svg.fill(color);
		return this;
	},

	/**
	 * This will create/update the link to
	 * the specified URL.
	 *
	 * @param {string} The URL
	 * @this {networkMap.Link}
	 * @return {networkMap.Link} self
	 * @TODO: Add functionality to remove the link
	 */
	setLink: function(url){
		if (url){
			if (this.a){
				this.a.to(url);
				return this;
			}

			if (this.svg.parent){
				this.a = this.svg.linkTo(url);
			}
			
			return this;
		}
		
		return this;						
	},	
	
	isDrawable: function(){
		return this.properties.get('requestData') !== undefined && this.properties.get('requestUrl') !== undefined;
	},
	
	getCenter: function(){
		var bbox = this.svg.bbox();
			
		return {
			cx: bbox.x + bbox.height / 2,
			cy: bbox.y + bbox.width / 2
		};	
	},
	
	
	getSubLink: function(){
		return this.subLink;
	},
	
	getLink: function(){
		return this.getSubLink().getLink();
	},
	/**
	 * Get the node which is assosiated to the linkPath
	 *
	 * @retrun {networkMap.Node} The node which this is assosiated with.
	 */
	getNode: function(){
		return this.getSubLink().getNode();
	},
	
	getSibling: function(){
		return undefined;
	},	
	
	getSettingsWidget: function(){
		return this.getLink().getSettingsWidget();
	},
	
	getUtilization: function(){
		return this.value;
	},
	
	getProperty: function(key){
		return this.properties.get(key);
		/* TODO: Remove
		if (key == 'width'){
			var link = this.getMainPath();
			if (link != this){
				return link.getProperty(key);
			}
			else if (!this.options[key]){
				return this.link.options[key];
			}
		}
		
		if (!this.options[key]){
			return null;
		}
		
		return this.options[key];
		*/
	},
	
	setProperty: function(key, value){
		if (key == 'width'){
			var link = this.getMainPath();
			if (link != this){
				return link.setProperty(key, value);
			}
		}
				
		this.properties.set(key, value);
		//TODO: Remove
		//this.options[key] = value;
		this.fireEvent('change', [key]);
		return this;
	},
	
	getConfiguration: function(){
		return this.properties.extract();
	},
		
	
	getMainPath: function(){
		var link;
		
		if (this.link.subpath.nodeA){
			this.link.subpath.nodeA.forEach(function(sublink){
				if (this == sublink){
					link = this.link.path.nodeA;
				}
			}.bind(this));
			
			if (link){
				return link;
			}		
		}
		
		if (this.link.subpath.nodeB){
			this.link.subpath.nodeB.forEach(function(sublink){
				if (this == sublink){
					link = this.link.path.nodeB;
				}
			}.bind(this));
			
			if (link){
				return link;
			}		
		}
		
		return this;
		
	},
	
	setupEvents: function(){
		this.svg.on('click', this._clickHandler.bind(this));
		
		if (this.properties.get('events')){
			if (this.properties.get('events.click')){
				this.svg.attr('cursor', 'pointer');
			}

			if (this.properties.get('events.hover')){
				this.svg.on('mouseover', this._hoverHandler.bind(this));
				this.svg.on('mouseout', this._hoverHandler.bind(this));
			}
		}
		
		// Check if we should setup an update event
		if (this.properties.get('requestUrl')) {
			this.getLink().registerUpdateEvent(
				this.getLink().properties.get('datasource'),
				this.properties.get('requestUrl'),
				this,
				function(response){
					// Refactor
					this.value = response.value;
					this.updateBgColor(this.getLink().colormap.translate(response.value));
					
					// update utilization label
					this.getSubLink().setUtilizationLabel();
				}.bind(this)
			);
		}
	},
	
	
	
	_clickHandler: function(e){
		// TODO: Move this logic to the link by sending an event 
		if (this.getLink().mode() === 'normal' && this.properties.get('events.click')){
			networkMap.events.click(e, this);
		}
		else if (this.getLink().mode() === 'edit'){
			e.preventDefault();
			
			// TODO: This is temporary code to test a feature
			this.getLink().drawEdgeHandles();
			
			this.mediator.publish('edit', [new networkMap.event.Configuration({
				deletable: true,
				destroy: function(){
					// TODO: Refacor with an event
					this.getLink().graph.removeLink(this.getLink()); 
				}.bind(this),
				cancel: function(){
					this.getLink().hideEdgeHandles();
				}.bind(this),
				editable: true,
				editWidget: this.getLink().configurationWidget.toElement(this.getLink(), this.getLink().properties),
				target: this,
				type: 'link',
				targetName: this.properties.get('name')
			})]);
		}
	},
	
	_hoverHandler: function(e){
		if (this.getLink().mode() === 'edit'){
			return;
		}
		
		if (e.type === 'mouseover'){
			networkMap.events.mouseover(e, this);
		}
		if (e.type === 'mouseout'){
			networkMap.events.mouseout(e, this);
		}
	}
	
});

networkMap.PrimaryLink = function(link, svg, options){
	networkMap.LinkPath.call(this, link, svg, options);	
};

networkMap.PrimaryLink.prototype = Object.create(networkMap.LinkPath.prototype);
networkMap.PrimaryLink.constructor = networkMap.PrimaryLink;

networkMap.extend(networkMap.PrimaryLink, {
	getSibling: function(){
		return this.getSubLink().getSibling(this);
	},
	
	draw: function(pathPoints, width, arrowHeadLength, memberLinkCount){
		if (!this.isDrawable())
			return this;		
		
		if (memberLinkCount === 0){
			return this.drawFullPath(pathPoints, width, arrowHeadLength, memberLinkCount);	
		}
		
		if (memberLinkCount > 0){
			return this.drawShortPath(pathPoints, width, arrowHeadLength, memberLinkCount);		
		}
		
		throw "Invalid member link count";
	},	
	
	drawFullPath: function(pathPoints, width, arrowHeadLength, memberLinkCount){
		this.svg.show();
		memberLinkCount = memberLinkCount || 1;

		var firstSegment = new SVG.math.Line(pathPoints[0], pathPoints[2]);
		var midSegment = new SVG.math.Line(pathPoints[2], pathPoints[3]);

		// perpendicular line with last point in firstList
		var helpLine1 = firstSegment.perpendicularLine(pathPoints[1], memberLinkCount * width);
		var helpLine2 = firstSegment.perpendicularLine(pathPoints[2], memberLinkCount * width);
		var helpLine3 = midSegment.perpendicularLine(pathPoints[2], memberLinkCount * width);
		
		var midPoint = midSegment.midPoint();
		var helpPoint1 = midSegment.move(midPoint, midSegment.p1, arrowHeadLength);
		var helpPoint2 = midSegment.move(midPoint, midSegment.p2, arrowHeadLength);
		
		var helpLine4 = midSegment.perpendicularLine(helpPoint1, memberLinkCount * width);

		// find intersection point 1
		var helpLine5 = new SVG.math.Line(helpLine1.p1, helpLine2.p1);
		var helpLine6 = new SVG.math.Line(helpLine3.p1, helpLine4.p1);
		var intersectPoint1 = helpLine6.intersection(helpLine5);

		if (intersectPoint1.parallel === true){
			intersectPoint1 = helpLine1.p1;
		}

		// find intersection point 2
		helpLine5 = new SVG.math.Line(helpLine1.p2, helpLine2.p2);
		helpLine6 = new SVG.math.Line(helpLine3.p2, helpLine4.p2);
		var intersectPoint2 = helpLine6.intersection(helpLine5);

		if (intersectPoint2.parallel === true){
			intersectPoint2 = helpLine1.p2;
		}
		
		this.svg.clear();
		
		this.svg
			.M(pathPoints[0])
			.L(helpLine1.p1).L(intersectPoint1).L(helpLine4.p1)
			.L(midPoint)
			.L(helpLine4.p2).L(intersectPoint2).L(helpLine1.p2)
			.Z().front();
		
		return this;
	},

	drawShortPath: function(pathPoints, width, arrowHeadLength, memberLinkCount){		
		this.svg.show();
		var midSegment = new SVG.math.Line(pathPoints[2], pathPoints[3]);
		
		var midPoint = midSegment.midPoint();
		var helpPoint1 = midSegment.move(midPoint, midSegment.p1, arrowHeadLength);
		
		var helpLine4 = midSegment.perpendicularLine(helpPoint1, memberLinkCount * width / 2);
		
		var startPoint = new SVG.math.Line(pathPoints[2], midPoint).midPoint();
		var helpLine7 = midSegment.perpendicularLine(
			startPoint, 
			memberLinkCount * width / 2
		);

		this.svg.clear();
		
		this.svg
			.M(startPoint)
			.L(helpLine7.p1).L(helpLine4.p1)
			.L(midPoint)
			.L(helpLine4.p2).L(helpLine7.p2)
			.Z().front();
			
		return this;
	}

});









networkMap.MemberLink = function(link, svg, options){
	networkMap.LinkPath.call(this, link, svg, options);
};

networkMap.MemberLink.prototype = Object.create(networkMap.LinkPath.prototype);
networkMap.MemberLink.constructor = networkMap.MemberLink;

networkMap.extend(networkMap.MemberLink, {
	getSibling: function(){	
		return this.getSubLink().getSibling(this);		
	},
	
	draw: function(pathPoints, width, arrowHeadLength, memberLinkCount, position){
		return this.drawSublink(pathPoints, width, arrowHeadLength, memberLinkCount, position);
	},
	
	drawSublink: function(pathPoints, width, arrowHeadLength, memberLinkCount, position){
		this.svg.show();
		
		// This is needed to draw one side of the links in reverse order
		var sign = (SVG.math.angle(pathPoints[0], pathPoints[1]) < Math.PI) ? 1 : -1;
		
		var offset = -memberLinkCount / 2 + position;
		
		var path = [
			pathPoints[0],
			pathPoints[1],
			pathPoints[2],
			new SVG.math.Line(pathPoints[2], pathPoints[3]).midPoint()
		];


		var lastSegment = this.calculateSublinkPath(path, width, arrowHeadLength, memberLinkCount, sign * offset);		
		var currentSegment = this.calculateSublinkPath(path, width, arrowHeadLength, memberLinkCount, sign * (offset + 1));

		var startPoint = pathPoints[0];
			
		this.svg.clear();

		// Special case when we are ploting a odd number
		// of sublinks. We must add the middlepoint manually
		if (offset === -0.5){
			this.svg
				.M(startPoint)
				.L(lastSegment[0]).L(lastSegment[1]).L(lastSegment[2])
				.L(path[path.length - 1])
				.L(currentSegment[2]).L(currentSegment[1]).L(currentSegment[0])
				.Z().back();
		}
		else{
			this.svg
				.M(startPoint)
				.L(lastSegment[0]).L(lastSegment[1]).L(lastSegment[2])
				.L(currentSegment[2]).L(currentSegment[1]).L(currentSegment[0])
				.Z().back();
		}

		return this;
	},
	
	calculateSublinkPath: function(path, width, arrowHeadLength, memberLinkCount, offset){
		
		var angle = Math.atan2(arrowHeadLength, Math.abs(width * memberLinkCount / 2));
		var localArrowHeadLength = Math.abs(width * offset * Math.tan(angle)); 

		var firstSegment = new SVG.math.Line(path[0], path[2]);
		var midSegment = new SVG.math.Line(path[2], path[3]);

		// perpendicular line with last point in firstList
		var helpLine1 = firstSegment.perpendicularLine(path[1], width * offset);
		var helpLine2 = firstSegment.perpendicularLine(path[2], width * offset);
		var helpLine3 = midSegment.perpendicularLine(path[2], width * offset);

		// find the arrowhead distance
		var arrowHeadInset = midSegment.move(midSegment.p2, midSegment.p1, localArrowHeadLength);
		var arrowHeadStart = midSegment.perpendicularLine(arrowHeadInset, width * offset);

		// find intersection point 1
		var helpLine5 = new SVG.math.Line(helpLine1.p1, helpLine2.p1);
		var helpLine6 = new SVG.math.Line(helpLine3.p1, arrowHeadStart.p1);
		var intersectPoint1 = helpLine6.intersection(helpLine5);

		if (intersectPoint1.parallel === true){
			intersectPoint1 = helpLine1.p1;
		}

		return [
			helpLine1.round(2).p1,
			intersectPoint1.round(2),
			arrowHeadStart.round(2).p1
		];
	}
});
;networkMap.SubLink = function(link, node, edge, svg, options){
	this.link = link;
	this.node = node;
	this.edge = edge;
	this.svg = svg;

	this.primaryLink = null;
	this.memberLinks = [];
	this.utilizationLabelsConfiguration = null;
	this.utilizationLabel = null;
	this.pathPoints = null;
	
	this.initializeUtilizationLabel();
};


networkMap.extend(networkMap.SubLink, networkMap.Options);
networkMap.extend(networkMap.SubLink, networkMap.Observable);

networkMap.extend(networkMap.SubLink, {
	purge: function(){
		this.link = null;
		this.node = null;
		this.svg = null;
		
		this.primaryLink.purge();
		
		for (var i = 0, len = this.memberLinks.length; i < len; i++){
			this.memberLinks[i].purge();
		}
		this.memberLinks.lenght = 0;
		
		this.utilizationLabelsConfiguration = null;
		this.utilizationLabel = null;
		this.pathPoints = null;
	},	
	
	load: function(options){
		if (options.sublinks){
			this.loadMemberLinks(options.sublinks);	
		}
		
		this.loadPrimaryLink(options);
		
		return this;
	},
	
	loadPrimaryLink: function(options){
		this.primaryLink = new networkMap.PrimaryLink(
			this,
			networkMap.path(this.svg),
			options
		)
		.addEvent('change', function(){
			this.fireEvent('redraw');
		}.bind(this))
		.addEvent('requestHref', function(sublink){
			this.fireEvent('requestHref', [sublink]);
		}.bind(this));
		
		return this;
	},
	
	loadMemberLinks: function(memberLinks){
		for (var i = 0, len = memberLinks.length; i < len; i++){
			this.loadMemberLink(memberLinks[i]);
		}
		
		return this;		
	},
		
	loadMemberLink: function(memberLink){
		this.memberLinks.push(
			new networkMap.MemberLink(
				this, 
				networkMap.path(this.svg), 
				memberLink
			)
			.addEvent('change', this.redraw.bind(this))
			.addEvent('requestHref', function(sublink){
				this.fireEvent('requestHref', [sublink]);
			}.bind(this))
		);
		
		return this;
	},

	getConfiguration: function(){
		var configuration = this.primaryLink.getConfiguration();
		configuration.sublinks = [];		
		
		for (var i = 0, len = this.memberLinks.length; i < len; i++){
			configuration.sublinks.push(this.memberLinks[i].getConfiguration());
		}

		if (configuration.sublinks.length === 0)
			delete configuration.sublinks;		
		
		configuration.edge = this.edge.getConfiguration();
		
		return configuration;
	},	
	
	draw: function(pathPoints, properties){
		// TODO: Remove hack
		this.pathPoints = pathPoints;
		
		this.primaryLink.draw(pathPoints, properties.get('width'), properties.get('arrowHeadLength'), this.memberLinks.length);
		
		for (var i = 0, len = this.memberLinks.length; i < len; i++){
			this.memberLinks[i].draw(pathPoints, properties.get('width'), properties.get('arrowHeadLength'), this.memberLinks.length, i);
		}
		
		this.setUtilizationLabelPosition();		
		
		return this;
	},	
	
	redraw: function(){
		return this;
	},
	
	setPath: function(pathPoints){
		this.pathPoints = pathPoints;
		
		return this;
	},
	
	hide: function(){
		this.primaryLink.hide();
		
		for (var i = 0, len = this.memberLinks.length; i < len; i++){
			this.memberLinks[i].hide();
		}

		this.utilizationLabel.hide();		
		
		return this;
	},
	
	show: function(){
		this.primaryLink.show();
		
		for (var i = 0, len = this.memberLinks.length; i < len; i++){
			this.memberLinks[i].show();
		}
		
		this.utilizationLabel.show();		

		return this;
	},
	
	initializeUtilizationLabel: function(){
		this.utilizationLabelConfiguration = networkMap.defaults(this.utilizationLabelsConfiguration, this.link.graph.properties.get('utilizationLabels'));
		
		this.utilizationLabel = new networkMap.renderer.link.UtilizationLabel(this.svg.group(), this.utilizationLabelsConfiguration);
		
		return this;
	},
	
	setUtilizationLabelPosition: function(){
		var center;
		var midpoint = new SVG.math.Line(this.pathPoints[2], this.pathPoints[3]).midPoint();
		
		center = new SVG.math.Line(this.pathPoints[2], midpoint).midPoint();
		this.utilizationLabel.setPosition(center.x, center.y).render();

		center = null;
		midpoint = null;
	
		return this;
	},
	
	setUtilizationLabelOptions: function(options){
		options = options || {};
		this.utilizationLabelConfiguration.enabled = (options.enabled === undefined) ? this.utilizationLabelConfiguration.enabled : options.enabled;
		this.utilizationLabelConfiguration.fontSize = options.fontSize || this.utilizationLabelConfiguration.fontSize;
		this.utilizationLabelConfiguration.padding = options.padding || this.utilizationLabelConfiguration.padding;
				
		this.utilizationLabel.setOptions(this.utilizationLabelConfiguration);
		this.setUtilizationLabel();
		
		return this;
	},
	
	setUtilizationLabel: function(value){
		if (value === undefined)
			value = this.getUtilization();
			
		this.utilizationLabel.render(value);
		
		return this;
	},
	
	hideUtilizationLabel: function(){
		this.utilizationLabel.hide();
		
		return this;
	},
	
	showUtilizationLabel: function(){
		this.utilizationLabel.show();
		
		return this;
	},

	updateHyperlinks: function(){		
		for (var i = 0, len = this.memberLinks.length; i < len; i++){
			this.memberLinks[i].updateHyperlink();
		}
		
		this.primaryLink.updateHyperlink();
		
		return this;
	},

	getLink: function(){
		return this.link;		
	},
	
	getNode: function(){
		return this.node;
	},
	
	getSibling: function(linkPath){
		if (linkPath instanceof networkMap.MemberLink){
			var mySibling = this.getLink().getSibling(this);
			
			if (this.memberLinks.length !== mySibling.memberLinks.length){
				return undefined;
			}
		
			var index = this.memberLinks.indexOf(linkPath);
			return mySibling.memberLinks[index];
		}
		
		if (linkPath instanceof networkMap.PrimaryLink){
			return this.getLink().getSibling(this).primaryLink;
		}
		
		return undefind;
	},	
	
	/**
	 *	Returns the primaryLink utilization. In case the primaryLink
	 * utilization is undefined the maximum utilization if the memberLinks
	 * is returned.
	 */
	getUtilization: function(){
		var max = null;
		
		var checkPath = function(value){
			// We are using the fact that 0 >= null => true
			if (value === null)
				return;
				
			if (value >= max){
				max = value;
			}	
		};	
		
		max = this.primaryLink.getUtilization();
		if (max === undefined || max === null){
			for (var i = 0, len = this.memberLinks.length; i < len; i++){
				checkPath(this.memberLinks[i].getUtilization());
			}	
		}
			
		checkPath = null;
		
		return max;
	}
});;networkMap.Link = function(options){
	
	/** contains referenses to sublinks */
	this.subLinks = {
		nodeA: null,
		nodeB: null	
	};	
	
	// Old structure
	this.pathPoints = [];
	this.updateQ = {};
	this._mode = 'normal';	
	
	/** The current configuration of the utilization label */
	this.utilizationLabelConfiguration = {
		enabled: false,
		fontSize: 8,
		padding: 2
	};
	
	this.graph = options.graph;
	delete options.graph;		

	this.properties = new networkMap.Properties(options, networkMap.Link.defaults);
	this.properties.addEvent('change', function(change){
		this.options = this.properties.configuration();
		this.draw();
	}.bind(this));

	// TODO: Remove this hack
	this.options = this.properties.configuration();

	this.configurationWidget = new networkMap.Link.Module.Settings(this.properties);

	this.colormap = networkMap.colormap[this.properties.get('colormap')];

	// setup datasource
	this.datasource = networkMap.datasource[this.properties.get('datasource')];


	this.setGraph(this.graph);
};

networkMap.extend(networkMap.Link, networkMap.Options);
networkMap.extend(networkMap.Link, networkMap.Observable);

networkMap.extend(networkMap.Link, {

	setProperty: function(key, value){
		if (!this.editTemplate[key]){
			throw 'Unknow id: ' + key;
		}
		
		this.options[key] = value;
		this._localConfig[key] = value;
		
		this.redraw();
	},
	
	getProperty: function(key){
		if (!this.editTemplate[key]){
			throw 'Unknow id: ' + key;
		}
		
		return this.properties.get(key);
	},
	
	/**
	 * This will create/update a link tag for the
	 * node. Order of presence is:
	 * - options.href
	 * - emit url event
	 *
	 * @this {networkMap.Node}
	 * @return {networkMap.Node} self
	 */
	
	updateHyperlinks: function(){
		this.subLinks.nodeA.updateHyperlinks();
		this.subLinks.nodeB.updateHyperlinks();
		
		return this;
	},	
	
	connectedTo: function(node, secondaryNode){
		if (secondaryNode){
			return (this.subLinks.nodeA.node == node || this.subLinks.nodeB.node == node) && (this.subLinks.nodeA.node == secondaryNode || this.subLinks.nodeB.node == secondaryNode);
		}
		
		return (this.subLinks.nodeA.node == node || this.subLinks.nodeB.node == node); 
	},
	
	mode: function(mode){
		if (!mode){
			return this._mode;
		}
		
		if (mode === 'edit' || mode === 'normal'){
			this._mode = mode;
		}
		else{
			throw 'Unknown mode: ' + mode;	
		}
		
		return this;
	},
	
	getConfiguration: function(){
		var configuration = this.properties.extract();

		configuration.nodeA = this.subLinks.nodeA.getConfiguration();
		configuration.nodeB = this.subLinks.nodeB.getConfiguration();
		
		return configuration;
	},

	getSibling: function(subLink){
		return (this.subLinks.nodeA === subLink) ? this.subLinks.nodeB : this.subLinks.nodeA;
	},	
	
	setGraph: function(graph){	
		// remove the object from the graph
		if (graph === null){
			this.graph = null;
			this.draw();
		}

		// if a graph is defined draw 
		if (graph){
			this.graph = graph;
			this.properties.setDefaults(this.graph.getDefaults('link'));
			
			// TODO: Setting the colormap and datasource like this is error prone
			this.datasource = this.properties.get('datasource');
			this.colormap = networkMap.colormap[this.properties.get('colormap')];
		
			// TODO: Remove this hack
			this.options = this.properties.configuration();

			// TODO: Legacy code
			this.graph.addEvent('redraw', function(e){
				this.draw();
			}.bind(this));

			this._setupSVG(this.properties.configuration());
			
			this.draw();
		}
	},
	
	_setupSVG: function(options){
		var svg = this.svg = this.graph.getPaintArea().group().back();
		var edge;
		
		this.shadowPath = this.createShadowPath(svg);

		if (!options.nodeA || !options.nodeB){
			throw "Link(create, missing node in link definition)";
		}

		/* NODE A */
		this.nodeA = this.graph.getNode(options.nodeA.id);
		if (!this.nodeA){
			throw "Link(create, nodeA does not exist (" + options.nodeA.id + ")";
		}
		
		edge = new networkMap.Link.Module.Edge(
			this.graph.getPaintArea().group(),
			this.nodeA.bbox(),
			SVG.math.Point.create(0, 0),
			SVG.math.Point.create(0, 0),
			options.nodeA.edge
		)
		.addEvent('updated', this.redrawShadowPath.bind(this))
		.addEvent('dragstart', function(){
			this.hidePaths();
			this.showShadowPath();
		}.bind(this))
		.addEvent('dragend', this.redraw.bind(this));	
	
		
		this.subLinks.nodeA = new networkMap.SubLink(this, this.nodeA, edge, svg)
			.load(options.nodeA)
			.addEvent('redraw', this.redraw.bind(this))
			.addEvent('requestHref', function(sublink){
				this.fireEvent('requestHref', [sublink]);
			}.bind(this));



		/* NODE B */
		this.nodeB = this.graph.getNode(options.nodeB.id);
		if (!this.nodeB){
			throw "Link(create, nodeA does not exist (" + options.nodeB.id + ")";
		}
		
		edge = new networkMap.Link.Module.Edge(
			this.graph.getPaintArea().group(),
			this.nodeB.bbox(),
			SVG.math.Point.create(0, 0),
			SVG.math.Point.create(0, 0),
			options.nodeB.edge
		)
		.addEvent('updated', this.redrawShadowPath.bind(this))
		.addEvent('dragstart', function(){
			this.hidePaths();
			this.showShadowPath();
		}.bind(this))
		.addEvent('dragend', this.redraw.bind(this));	

		this.subLinks.nodeB = new networkMap.SubLink(this, this.nodeB, edge, svg)
			.load(options.nodeB)
			.addEvent('redraw', this.redraw.bind(this))
			.addEvent('requestHref', function(sublink){
				this.fireEvent('requestHref', [sublink]);
			}.bind(this));

		return this;
	},
	
	
	createShadowPath: function(svg){
		return svg.path().attr({ 
			fill: 'none',
			stroke: '#000', 
			'stroke-dasharray': '3,5',
			'stroke-width': 2 
		});
	},
	
	redraw: function(){
		this.redrawShadowPath();
		this.subLinks.nodeA.draw(this.pathPoints, this.properties);
		this.subLinks.nodeB.draw(Array.prototype.slice.call(this.pathPoints).reverse(), this.properties);	
		return this;
	},

	draw: function(){
		if (this.svg && !this.graph){
			this.svg.remove();
			return false;
		}

		if (!this.graph){
			return false;
		}
		
		this.redrawShadowPath().hideShadowPath();
		this.subLinks.nodeA.draw(this.pathPoints, this.properties);
		this.subLinks.nodeB.draw(Array.prototype.slice.call(this.pathPoints).reverse(), this.properties);	
		
		this.update();

		this.nodeA.addEvent('dragstart', this.onNodeDragStart.bind(this));
		this.nodeB.addEvent('dragstart', this.onNodeDragStart.bind(this));

		this.nodeA.addEvent('drag', this.onNodeDrag.bind(this));
		this.nodeB.addEvent('drag', this.onNodeDrag.bind(this));

		this.nodeA.addEvent('dragend', this.onNodeDragEnd.bind(this));
		this.nodeB.addEvent('dragend', this.onNodeDragEnd.bind(this));

	},

	onNodeDragStart: function(){
		this.shadowPath.show();
		this.hidePaths();
	},	
	
	onNodeDrag: function(){
		this.subLinks.nodeA.edge.setBbox(this.nodeA.bbox());
		this.subLinks.nodeB.edge.setBbox(this.nodeB.bbox());
			
		this.redrawShadowPath();
	},
	
	onNodeDragEnd: function(){
		this.redrawShadowPath().hideShadowPath();
		this.subLinks.nodeA.draw(this.pathPoints, this.properties);
		this.subLinks.nodeB.draw(Array.prototype.slice.call(this.pathPoints).reverse(), this.properties);	
		this.showPaths();
	},

	edgePoints: function(){
		var vec2 = networkMap.vec2;
		
		var bboxA = this.subLinks.nodeA.node.bbox();
		var bboxB = this.subLinks.nodeB.node.bbox();
		
		var confinmentA = vec2.create(bboxA.width/2, bboxA.height/2);
		var confinmentB = vec2.create(bboxB.width/2, bboxB.height/2);

		var path = [];
		
		var inset = parseInt(this.properties.get('inset')) || 1;
		var connectionDistance = parseInt(this.properties.get('connectionDistance')) || 1;
		var staticConnectionDistance = parseInt(this.properties.get('staticConnectionDistance')) || 1;
		
		var a = vec2.create(bboxA.cx, bboxA.cy);
		var b = vec2.create(bboxB.cx, bboxB.cy);
		
		var ab = b.clone().sub(a);
		var dirA = ab.clone().maxDir();	
		var edgePointA = dirA.clone().mul(confinmentA);
		edgePointA.sub(dirA.clone().scale(inset));
		var edgePointerA = edgePointA.clone();
		edgePointA.add(a);
		
		
	
		/* AND NOW FROM THE OTHER SIDE */
		var ba = ab.clone().scale(-1);
		var dirB = ba.clone().maxDir();
		var edgePointB = dirB.clone().mul(confinmentB);
		edgePointB.sub(dirB.clone().scale(inset));
		var edgePointerB = edgePointB.clone();
		edgePointB.add(b);

		this.$edgePoints = this.$edgePoints || {};
		this.$edgePoints = {
			nodeA: {
				point: new SVG.math.Point(edgePointA.x, edgePointA.y),
				pointer: edgePointerA,
				direction: dirA
			},
			nodeB: {
				point: new SVG.math.Point(edgePointB.x, edgePointB.y),
				pointer: edgePointerB,
				direction: dirB
			}
		};
		
		/*
		if (!this.edgeHandle){
			var edgeHandle = this.edgeHandle = new networkMap.Link.Module.Edge(
				this.graph.getPaintArea().group(),
				this.nodeA.bbox(),
				this.$edgePoints.calculated.nodeA.point,
				this.$edgePoints.calculated.nodeA.direction
			);
			
			edgeHandle.addEvent('updated', this.redrawShadowPath.bind(this));
			edgeHandle.addEvent('dragstart', function(){
				this.hidePaths();
				this.showShadowPath();
			}.bind(this));
			edgeHandle.addEvent('dragend', this.redraw.bind(this));
			
			
		} else {
			this.subLinks.nodeB
			this.edgeHandle.setDefaults(edgePointA, dirA);
		}
		
		var edge = this.edgeHandle.getEdge();		
		*/

		

		
		//this.$edgePoints.path = path;
		
		
		
		
		return this.$edgePoints;
	},

	

	redrawShadowPath: function(){
		var edge;
		var path = [];
		var connectionDistance = parseInt(this.properties.get('connectionDistance')) || 1;
		var staticConnectionDistance = parseInt(this.properties.get('staticConnectionDistance')) || 1;

		var edgePoints = this.edgePoints();

		this.pathPoints.length = 0;
		
		this.subLinks.nodeA.edge.setDefaults(edgePoints.nodeA.point, edgePoints.nodeA.direction);		
		this.subLinks.nodeB.edge.setDefaults(edgePoints.nodeB.point, edgePoints.nodeB.direction);		
		
		edge = this.subLinks.nodeA.edge.getEdge();
		path.push(edge.point.clone());
		path.push(edge.point.clone().add(edge.direction.clone().scale(connectionDistance)));
		path.push(edge.point.clone().add(edge.direction.clone().scale(connectionDistance + staticConnectionDistance)));

		edge = this.subLinks.nodeB.edge.getEdge();
		path.push(edge.point.clone().add(edge.direction.clone().scale(connectionDistance + staticConnectionDistance)));
		path.push(edge.point.clone().add(edge.direction.clone().scale(connectionDistance)));
		path.push(edge.point.clone());
		
		
		// TODO: Rewrite, add vec2 functionality to SVG.math.Point
		/*
		edgePoints.path.forEach(function(point){
			this.pathPoints.push(new SVG.math.Point(point.x, point.y));
		}.bind(this));
		*/
		this.pathPoints = path;		
		
		this.shadowPath
			.clear()
			.M(path[0])  //.apply(this.shadowPath, edgePoints.path[0])
			.L(path[2])  //.apply(this.shadowPath, edgePoints.path[2])
			.L(path[3])  //.apply(this.shadowPath, edgePoints.path[3])
			.L(path[5]); //.apply(this.shadowPath, edgePoints.path[5]);

		return this;
	},
	
	removeMainPath: function(){
		if (this.mainPathA)
			this.mainPathA.remove();

		if(this.mainPathB)
			this.mainPathB.remove();
	},
	
	hidePaths: function(){
		this.subLinks.nodeA.hide();
		this.subLinks.nodeB.hide();

		return this;
	},
	showPaths: function(){
		this.subLinks.nodeA.show();
		this.subLinks.nodeB.show();

		return this;
	},
	showShadowPath: function(){
		this.shadowPath.show();
		return this;
	},
	
	hideShadowPath: function(){
		this.shadowPath.hide();
		return this;
	},


	drawEdgeHandles: function(){
		
		this.subLinks.nodeA.edge.show(this.nodeA.bbox());
		this.subLinks.nodeB.edge.show(this.nodeB.bbox());
		
		return this;
	},
	
	hideEdgeHandles: function(){
		this.subLinks.nodeA.edge.hide();
		this.subLinks.nodeB.edge.hide();
		
		return this;
	},

	setUtilizationLabel: function(){
		this.subLinks.nodeA.setUtilizationLabel();
		this.subLinks.nodeB.setUtilizationLabel();
		
		return this;
	},
	
	setUtilizationLabelOptions: function(options){
		this.subLinks.nodeA.setUtilizationLabelOptions(options);
		this.subLinks.nodeB.setUtilizationLabelOptions(options);
		
		return this;
	},
	
	showUtilizationLabels: function(){
		this.subLinks.nodeA.showUtilizationLabel();
		this.subLinks.nodeB.showUtilizationLabel();
		
		return this;
	},
	
	hideUtilizationLabels: function(){
		this.subLinks.nodeA.hideUtilizationLabel();
		this.subLinks.nodeB.hideUtilizationLabel();
		
		return this;
	},
	
	updateUtilizationLabels: function(){
		this.setUtilizationLabelPositions();
		
		return this;
	},

	setUtilizationLabelPositions: function(){
		this.subLinks.nodeA.setUtilizationLabelPosition();
		this.subLinks.nodeB.setUtilizationLabelPosition();
	
		return this;
	},

	/* TODO: This should not be used, the graph should collect this data */
	registerUpdateEvent: function(datasource, url, link, callback){
		var graph;
		
		this.updateQ[datasource] = this.updateQ[datasource] || {};
		this.updateQ[datasource][url] = this.updateQ[datasource][url] || [];

		// register datasources for internal use in the link
		this.updateQ[datasource][url].push({
			link: link,
			callback: callback
		});
		
		// register the update event in the graf
		this.graph.registerUpdateEvent(datasource, url, link, callback);
	},
	

	update: function(force){
		if (this.properties.get('globalRefresh') && force !== true)
			return this;

		if (!this.graph.properties.get('batchUpdate') || force === true)
		networkMap.each(this.updateQ, function(urls, datasource){
			if (!networkMap.datasource[datasource]){
				throw 'Unknown datasource (' + datasource + ')';
			}
			networkMap.each(urls, function(requests, url){
				if (this.properties.get('batchUpdate')){
					networkMap.datasource[datasource](url, requests);
				}
				else{
					requests.forEach(function(request){
						networkMap.datasource[datasource](url, request);
					});
				}
			}.bind(this));
		}.bind(this));
		
		return this;
	}

});

networkMap.Link.defaultTemplate = {
	width: {
		label: 'Width',
		type: 'number',
		min: 0
	},
	inset: {
		label: 'Inset',
		type: 'number',
		min: 1
	},
	connectionDistance: {
		label: 'Chamfer',
		type: 'number',
		min: 0
	},
	staticConnectionDistance: {
		label: 'Offset',
		type: 'number',
		min: 1
	},
	arrowHeadLength: {
		label: 'Arrow Head',
		type: 'number',
		min: 0
	}
};

/**
 * Register a global handler to provide a href to Links
 * This can be overridden on the networkMap instance or
 * or setting it directly on the link.
 * 
 * The registered function should return a url string 
 * or null if no link should be created.
 *
 * @param {function} A function that returns a URL or null
 */
networkMap.Link.registerLinkGenerator = function(f){
	networkMap.Link._linkGenerator = networkMap.Link.createLinkGenerator(f);
};

networkMap.Link.createLinkGenerator = function(f){
	return function(sublink){
		var href = sublink.properties.get('href');
		if (href){
			if (networkMap.isFunction(href))
				sublink.setLink(href());
			else
				sublink.setLink(href);
			return;
		}
		
		sublink.setLink(f(sublink));
	};
};

/** Register a default link generator which will not create a link */
networkMap.Link.registerLinkGenerator(function(sublink){return null;});

/** Register defaults properties for networkMap.Node */
networkMap.Link.defaults = new networkMap.Properties({
	inset: 10,
	connectionDistance: 10,
	staticConnectionDistance: 30,
	arrowHeadLength: 10,
	width: 10,
	background: '#777',
	globalRefresh: true,
	refreshInterval: 300000,
	datasource: 'simulate',
	batchUpdate: true,
	colormap: 'flat5'
});
;networkMap.Link.Module = networkMap.Link.Module || {};

networkMap.Link.Module.Settings = function(properties, options){
	this.options = {
		onlyGlobals: false,
		header: 'Globals',
		container: null
	};
	this.setOptions(options);

	this.properties = properties;
};


networkMap.extend(networkMap.Link.Module.Settings, networkMap.Options);

// types: angle, bool, float, int, number, length, list, string, color
// https://api.tinkercad.com/libraries/1vxKXGNaLtr/0/docs/topic/Shape+Generator+Overview.html
networkMap.extend(networkMap.Link.Module.Settings, {

	/** Definitions of the parameters */
	parameters: {
		width: {
			label: 'Width',
			type: 'number',
			min: 0,
			global: true
		},
		inset: {
			label: 'Inset',
			type: 'number',
			min: 1,
			global: true
		},
		connectionDistance: {
			label: 'Chamfer',
			type: 'number',
			min: 0,
			global: true
		},
		staticConnectionDistance: {
			label: 'Offset',
			type: 'number',
			min: 1,
			global: true
		},
		arrowHeadLength: {
			label: 'Arrow Head',
			type: 'number',
			min: 0,
			global: true
		}
	},

	/**
	 * Generates HTML that is used for configuration
	 * @param  {networkMap.Link} link       The link object
	 * @param  {networkMap.Properties} properties The properties of the link object
	 * @return {HTMLElement}            A HTMLElement containing the widget
	 */	
	toElement: function(link, properties){
		properties = properties || this.properties;
		var container = this.options.container || new networkMap.widget.Accordion();
		var accordionGroup;

		var changeHandler = function(key, obj){
			return function(e, widget){
				obj.set(key, widget.value());	
			};
		};
	
		accordionGroup = container.add(this.options.header);		
		networkMap.each(this.parameters, function(option, key){
			accordionGroup.appendChild(new networkMap.widget.IntegerInput(option.label, properties.get(key, true), option)
				.addEvent('change', changeHandler(key, properties))
			);
		}.bind(this));		
		
		// This is added to prevent non global configuration to be added
		if (this.options.onlyGlobals){
			return container;
		}
		
		var linkTemplate = {
			id: {
				label: 'Node',
				type: 'text',
				disabled: true,
				global: false
			},
			name: {
				label: 'Interface',
				type: 'text',
				disabled: true,
				global: false
			}
			/* TODO: Descide if this is needed
			, 
			width: {
				label: 'Width',
				type: 'number',
				min: 0,
				global: false
			}
			*/
		};		
		
		var sublinkConf = function(label, node){
			accordionGroup = container.add(label);
			networkMap.each(linkTemplate, function(option, key){
				if (['id'].some(function(item){ return item == key;})){
					accordionGroup.appendChild(new networkMap.widget.TextInput(option.label, properties.get(node + '.' + key), option)
						.addEvent('change', changeHandler(key, link.properties))
					);
				}
				else{
					if (option.type === 'number'){
						accordionGroup.appendChild(
							new networkMap.widget.IntegerInput(
								option.label, 
								link.subLinks[node].primaryLink.properties.get(key, true), 
								option
							)
							.addEvent('change', changeHandler(key, link.subLinks[node].primaryLink.properties))
						);
					}
					else if(option.type === 'text'){
						accordionGroup.appendChild(
							new networkMap.widget.TextInput(
								option.label, 
								link.subLinks[node].primaryLink.properties.get(key), 
								option
							)
							.addEvent('change', changeHandler(key, link.subLinks[node].primaryLink.properties))
						);
					}
					else if(option.type === 'color'){
						accordionGroup.appendChild(
							new networkMap.widget.ColorInput(
								option.label, 
								link.subLinks[node].primaryLink.properties.get(key), 
								option
							)
							.addEvent('change', changeHandler(key, link.subLinks[node].primaryLink.properties))
						);
					}
				}
			}.bind(this));
		}.bind(this);
		
		sublinkConf('Node A', 'nodeA');
		sublinkConf('Node B', 'nodeB');
		

		
		// Add sublinks
		var sublinkList;
		if (link.subLinks.nodeA && link.subLinks.nodeB && link.subLinks.nodeA.memberLinks.length === link.subLinks.nodeB.memberLinks.length) {
			accordionGroup = container.add('Sublinks');
			sublinkList = new networkMap.widget.List();
			link.subLinks.nodeA.memberLinks.forEach(function(subpath, index){
				sublinkList.add(subpath.properties.get('name') + ' - ' + link.subLinks.nodeB.memberLinks[index].properties.get('name'), {enableDelete: false});
			});
			accordionGroup.appendChild(sublinkList);
		}
		else{ // Asymetric link
			if (link.subLinks.nodeA || link.subLinks.nodeB){
				accordionGroup = container.add('Sublinks');
				sublinkList = new networkMap.widget.List();
			}

			if (link.subLinks.nodeA){
				link.subLinks.nodeA.memberLinks.forEach(function(sublink, index){
					sublinkList.add(sublink.properties.get('name') + ' - ' + 'N/A', {enableDelete: false});
				});
			}

			if (link.subLinks.nodeB){
				link.subLinks.nodeB.memberLinks.forEach(function(sublink, index){
					sublinkList.add('N/A' + ' - ' + sublink.properties.get('name'), {enableDelete: false});
				});
			}

			if (link.subLinks.nodeA || link.subLinks.nodeB){
				accordionGroup.appendChild(sublinkList);
			}
		}
		
		return container;
	}
});;networkMap.Link.Module = networkMap.Link.Module || {};

/**
 * The Edge module is an UI widget for controling
 * the edge point of the link.
 *
 * @param {object} options Options to override defaults.
 * @constructor
 * @borrows networkMap.Options#setOptions as #setOptions
 */
networkMap.Link.Module.Edge = function(svg, bbox, edgePoint, edgeDirection, userDefined){

	
	this.svg = svg;
	this.bbox = bbox;	
	
	this.defaults = {};
	this.setDefaults(edgePoint, edgeDirection);
		
	function convert(obj){
		return SVG.math.Point.create(obj.x, obj.y);	
	}
	
	if (userDefined){
		this.setUserDefined(convert(userDefined.point), convert(userDefined.pointer), convert(userDefined.direction));		
	}
	

	this.size = 15;
	this.angleSnap = Math.PI / 14;
	this.pointSnap = 5;

	this.state = this.states.hidden;
};

networkMap.extend(networkMap.Link.Module.Edge, networkMap.Options);
networkMap.extend(networkMap.Link.Module.Edge, networkMap.Observable);

/**
 * @lends networkMap.Link.Module.Edge
 */
networkMap.extend(networkMap.Link.Module.Edge, {
	setDefaults: function(edgePoint, edgeDirection){
		this.defaults.point = edgePoint;
		this.defaults.direction = edgeDirection; 
		
		return this;	
	},	
	
	getDefaults: function(){
		return this.defaults;
	},
	
	setUserDefined: function(edgePoint, edgePointer, edgeDirection){
		this.userDefined = {
			point: edgePoint,
			pointer: edgePointer,
			direction: edgeDirection
		};
		
		return this;
	},
	
	getUserDefined: function(){
		return this.userDefined;
	},
	
	getEdge: function(){
		return (this.userDefined) ? this.userDefined : this.defaults;
	},
	
	setBbox: function(bbox){
		this.bbox = bbox;
		
		return this.redraw();
	},
	
	getBbox: function(){
		return this.bbox;
	},
	
	show: function(bbox){
		this.state.show.call(this, bbox);
		return this;	
	},
	
	hide: function(){
		this.state.hide.call(this);
		return this;
	},

	redraw: function(){
		this.state.redraw.call(this);
		return this;	
	},

	getConfiguration: function(){
		return this.getUserDefined();
	},
	
	states: {
		hidden: {
			show: function(bbox){
				this.setBbox(bbox);

				var svg = this.svg;
				
				var edge = this.getEdge();
				
				var vec = edge.direction.clone().scale(30);
				vec.add(edge.point);		
						
				var line = this.line = svg.line(edge.point.x, edge.point.y, vec.x, vec.y)
					.stroke({
						fill: 'none',
						color: '#000',
						width: 2,
		
					});
		
				var directionHandle = this.directionHandle = this.svg.circle(this.size)
					.center(vec.x, vec.y)
					.fill('#fff')
					.stroke({
						color: '#000'
					})
					.draggable(function(x, y){
						var edge = this.getEdge();
						var vec2 = networkMap.vec2.create(x, y);
						var edge2 = edge.point.clone();
						var res = vec2.sub(edge2).normalize().scale(30);
						res.roundDir(this.angleSnap).add(edge2);
						
						return {x: res.x, y: res.y};
					}.bind(this));
				
				var radius = this.size / 2;
				var edgeHandle = this.edgeHandle = this.svg.circle(this.size)
					.fill('#fff')
					.stroke({
						color: '#000'
					})
					.center(edge.point.x, edge.point.y)
					.draggable(function(x, y){
						x = x < this.bbox.x - radius  ? this.bbox.x - radius : x - x % this.pointSnap;
						x = x > (this.bbox.x + this.bbox.width - radius) ? this.bbox.x + this.bbox.width - radius : x - x % this.pointSnap;
						y = y < this.bbox.y - radius ? this.bbox.y - radius : y - y % this.pointSnap;
						y = y > (this.bbox.y + this.bbox.height - radius) ? this.bbox.y + this.bbox.height - radius : y - y % this.pointSnap;
						
						return {
							x: x,
							y: y
						};
					}.bind(this));
					
		
				svg.on('dblclick', this.onDoubleClick.bind(this));				
				
				directionHandle.dragstart = this.onDragStart.bind(this);
				directionHandle.dragmove = this.onDirectionHandleMove.bind(this);
				directionHandle.dragend = this.onDragEnd.bind(this);
				
				edgeHandle.dragstart = this.onDragStart.bind(this);
				edgeHandle.dragmove = this.onEdgeHandleMove.bind(this);
				edgeHandle.dragend = this.onDragEnd.bind(this);
				
				svg.front();
		
				this.state = this.states.rendered;
				return this;
			},

			redraw: function(){
				var edge = this.getEdge();
				
				if (edge.pointer){
					edge.point = SVG.math.Point.create(this.bbox.cx, this.bbox.cy).add(edge.pointer);	
				}
								
				return this;
			},

			hide: function(){
				return this;
			}
		},
		rendered: {
			show: function(bbox){
				this.bbox = bbox;
				return this.redraw();
			},
			
			redraw: function(){
				var edge = this.getEdge();
				
				if (edge.pointer){
					edge.point = SVG.math.Point.create(this.bbox.cx, this.bbox.cy).add(edge.pointer);	
				}
				var vec = edge.direction.clone().scale(30).add(edge.point);

				this.line.plot(edge.point.x, edge.point.y, vec.x, vec.y); 
				this.directionHandle.center(vec.x, vec.y);
				this.edgeHandle.center(edge.point.x, edge.point.y);
				return this;
			},
			
			hide: function(){
				this.directionHandle.dragmove = null;
				this.edgeHandle.dragmove = null;
				
				this.line.remove();
				this.directionHandle.remove();
				this.edgeHandle.remove();
				this.line = null;
				this.directionHandle = null;
				this.edgeHandle = null;
				
				this.state = this.states.hidden;
			}
			
		}	
	},

	onDoubleClick: function(){
		this.reset();
		this.fireEvent('dragend');
	},

	onDragStart: function(){
		this.fireEvent('dragstart');
	},
	
	onDragEnd: function(){
		this.fireEvent('dragend');
	},

	onDirectionHandleMove: function(event){
		var edge = this.getEdge();

		this.setUserDefined(
			edge.point,
			edge.point.clone().sub(SVG.math.Point.create(this.bbox.cx, this.bbox.cy)),
			SVG.math.Point.create(event.target.cx(), event.target.cy()).sub(edge.point).normalize()
		);
		
		this.redraw();
		this.fireEvent('updated');
	},
	
	onEdgeHandleMove: function(event){
		var edge = this.getEdge();
		var edgePoint = SVG.math.Point.create(event.target.cx(), event.target.cy());
		
		this.setUserDefined(
			edgePoint,
			edgePoint.clone().sub(SVG.math.Point.create(this.bbox.cx, this.bbox.cy)),
			edge.direction
		);
		
		this.fireEvent('updated');
		this.redraw();
	},

	
	reset: function(){
		this.userDefined = undefined;
		this.redraw();
		
		return this;
	}
});
