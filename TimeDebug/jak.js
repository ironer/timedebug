/*
 Licencováno pod MIT Licencí, její celý text je uveden v souboru jak.licence.txt
 Licenced under the MIT Licence, complete text is available in jak.licence.txt file
 */
if (typeof (window.JAK) != "object") {
	window.JAK = {
		"NAME": "JAK"
	};
};
JAK.idGenerator = function () {
	this.idCnt = this.idCnt < 10000000 ? this.idCnt : 0;
	var ids = "m" + new Date().getTime().toString(16) + "m" + this.idCnt.toString(16);
	this.idCnt++;
	return ids;
};
if (!Function.prototype.bind) {
	Function.prototype.bind = function (thisObj) {
		var fn = this;
		var args = Array.prototype.slice.call(arguments, 1);
		return function () {
			return fn.apply(thisObj, args.concat(Array.prototype.slice.call(arguments)));
		};
	};
}
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (item, from) {
		var len = this.length;
		var i = from || 0;
		if (i < 0) {
			i += len;
		}
		for (; i < len; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	};
}
if (!Array.indexOf) {
	Array.indexOf = function (obj, item, from) {
		return Array.prototype.indexOf.call(obj, item, from);
	};
}
if (!Array.prototype.lastIndexOf) {
	Array.prototype.lastIndexOf = function (item, from) {
		var len = this.length;
		var i = from || len - 1;
		if (i < 0) {
			i += len;
		}
		for (; i > -1; i--) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	};
}
if (!Array.lastIndexOf) {
	Array.lastIndexOf = function (obj, item, from) {
		return Array.prototype.lastIndexOf.call(obj, item, from);
	};
}
if (!Array.prototype.forEach) {
	Array.prototype.forEach = function (cb, _this) {
		var len = this.length;
		for (var i = 0; i < len; i++) {
			if (i in this) {
				cb.call(_this, this[i], i, this);
			}
		}
	};
}
if (!Array.forEach) {
	Array.forEach = function (obj, cb, _this) {
		Array.prototype.forEach.call(obj, cb, _this);
	};
}
if (!Array.prototype.every) {
	Array.prototype.every = function (cb, _this) {
		var len = this.length;
		for (var i = 0; i < len; i++) {
			if (i in this && !cb.call(_this, this[i], i, this)) {
				return false;
			}
		}
		return true;
	};
}
if (!Array.every) {
	Array.every = function (obj, cb, _this) {
		return Array.prototype.every.call(obj, cb, _this);
	};
}
if (!Array.prototype.some) {
	Array.prototype.some = function (cb, _this) {
		var len = this.length;
		for (var i = 0; i < len; i++) {
			if (i in this && cb.call(_this, this[i], i, this)) {
				return true;
			}
		}
		return false;
	};
}
if (!Array.some) {
	Array.some = function (obj, cb, _this) {
		return Array.prototype.some.call(obj, cb, _this);
	};
}
if (!Array.prototype.map) {
	Array.prototype.map = function (cb, _this) {
		var len = this.length;
		var res = new Array(len);
		for (var i = 0; i < len; i++) {
			if (i in this) {
				res[i] = cb.call(_this, this[i], i, this);
			}
		}
		return res;
	};
}
if (!Array.map) {
	Array.map = function (obj, cb, _this) {
		return Array.prototype.map.call(obj, cb, _this);
	};
}
if (!Array.prototype.filter) {
	Array.prototype.filter = function (cb, _this) {
		var len = this.length;
		var res = [];
		for (var i = 0; i < len; i++) {
			if (i in this) {
				var val = this[i];
				if (cb.call(_this, val, i, this)) {
					res.push(val);
				}
			}
		}
		return res;
	};
}
if (!Array.filter) {
	Array.filter = function (obj, cb, _this) {
		return Array.prototype.filter.call(obj, cb, _this);
	};
}
String.prototype.lpad = function (character, count) {
	var ch = character || "0";
	var cnt = count || 2;
	var s = "";
	while (s.length < (cnt - this.length)) {
		s += ch;
	}
	s = s.substring(0, cnt - this.length);
	return s + this;
};
String.prototype.rpad = function (character, count) {
	var ch = character || "0";
	var cnt = count || 2;
	var s = "";
	while (s.length < (cnt - this.length)) {
		s += ch;
	}
	s = s.substring(0, cnt - this.length);
	return this + s;
};
String.prototype.trim = function () {
	return this.match(/^\s*([\s\S]*?)\s*$/)[1];
};
if (!String.trim) {
	String.trim = function (obj) {
		return String.prototype.trim.call(obj);
	};
}
Date.prototype._dayNames = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"];
Date.prototype._dayNamesShort = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];
Date.prototype._monthNames = ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"];
Date.prototype._monthNamesShort = ["Led", "Úno", "Bře", "Dub", "Kvě", "Čer", "Črc", "Srp", "Zář", "Říj", "Lis", "Pro"];
Date.prototype.format = function (str) {
	var suffixes = {
		"1": "st",
		"2": "nd",
		"3": "rd",
		"21": "st",
		"22": "nd",
		"23": "rd",
		"31": "st"
	};
	var result = "";
	var escape = false;
	for (var i = 0; i < str.length; i++) {
		var ch = str.charAt(i);
		if (escape) {
			escape = false;
			result += ch;
			continue;
		}
		switch (ch) {
			case "\\":
				if (escape) {
					escape = false;
					result += ch;
				} else {
					escape = true;
				}
				break;
			case "d":
				result += this.getDate().toString().lpad();
				break;
			case "j":
				result += this.getDate();
				break;
			case "w":
				result += this.getDay();
				break;
			case "N":
				result += this.getDay() || 7;
				break;
			case "S":
				var d = this.getDate();
				result += suffixes[d] || "th";
				break;
			case "D":
				result += this._dayNamesShort[(this.getDay() || 7) - 1];
				break;
			case "l":
				result += this._dayNames[(this.getDay() || 7) - 1];
				break;
			case "z":
				var t = this.getTime();
				var d = new Date(t);
				d.setDate(1);
				d.setMonth(0);
				var diff = t - d.getTime();
				result += diff / (1000 * 60 * 60 * 24);
				break;
			case "W":
				var d = new Date(this.getFullYear(), this.getMonth(), this.getDate());
				var day = d.getDay() || 7;
				d.setDate(d.getDate() + (4 - day));
				var year = d.getFullYear();
				var day = Math.floor((d.getTime() - new Date(year, 0, 1, -6)) / (1000 * 60 * 60 * 24));
				result += (1 + Math.floor(day / 7)).toString().lpad();
				break;
			case "m":
				result += (this.getMonth() + 1).toString().lpad();
				break;
			case "n":
				result += (this.getMonth() + 1);
				break;
			case "M":
				result += this._monthNamesShort[this.getMonth()];
				break;
			case "F":
				result += this._monthNames[this.getMonth()];
				break;
			case "t":
				var t = this.getTime();
				var m = this.getMonth();
				var d = new Date(t);
				var day = 0;
				do {
					day = d.getDate();
					t += 1000 * 60 * 60 * 24;
					d = new Date(t);
				} while (m == d.getMonth());;
				result += day;
				break;
			case "L":
				var d = new Date(this.getTime());
				d.setDate(1);
				d.setMonth(1);
				d.setDate(29);
				result += (d.getMonth() == 1 ? "1" : "0");
				break;
			case "Y":
				result += this.getFullYear().toString().lpad();
				break;
			case "y":
				result += this.getFullYear().toString().lpad().substring(2);
				break;
			case "a":
				result += (this.getHours() < 12 ? "am" : "pm");
				break;
			case "A":
				result += (this.getHours() < 12 ? "AM" : "PM");
				break;
			case "G":
				result += this.getHours();
				break;
			case "H":
				result += this.getHours().toString().lpad();
				break;
			case "g":
				result += this.getHours() % 12;
				break;
			case "h":
				result += (this.getHours() % 12).toString().lpad();
				break;
			case "i":
				result += this.getMinutes().toString().lpad();
				break;
			case "s":
				result += this.getSeconds().toString().lpad();
				break;
			case "Z":
				result += -60 * this.getTimezoneOffset();
				break;
			case "O":
			case "P":
				var base = this.getTimezoneOffset() / -60;
				var o = Math.abs(base).toString().lpad();
				if (ch == "P") {
					o += ":";
				}
				o += "00";
				result += (base >= 0 ? "+" : "-") + o;
				break;
			case "U":
				result += this.getTime() / 1000;
				break;
			case "u":
				result += "0";
				break;
			case "c":
				result += arguments.callee.call(this, "Y-m-d") + "T" + arguments.callee.call(this, "H:i:sP");
				break;
			case "r":
				result += arguments.callee.call(this, "D, j M Y H:i:s O");
				break;
			default:
				result += ch;
				break;
		}
	}
	return result;
};
if (!window.JSON) {
	(function () {
		var escapes = {
			"\b": "\\b",
			"\t": "\\t",
			"\n": "\\n",
			"": "\\f",
			"\r": "\\r",
			"\"": "\\\"",
			"\\": "\\\\"
		};
		var re = "[";
		for (var p in escapes) {
			re += "\\" + p;
		}
		re += "]";
		re = new RegExp(re, "g");
		var stringifyString = function (value) {
			var v = value.replace(re, function (ch) {
				return escapes[ch];
			});
			return "\"" + v + "\"";
		};
		var stringifyValue = function (value, replacer, space, depth) {
			var indent = new Array(depth + 1).join(space);
			if (value === null) {
				return "null";
			}
			switch (typeof (value)) {
				case "string":
					return stringifyString(value);
					break;
				case "boolean":
				case "number":
					return value.toString();
					break;
				case "object":
					var result = "";
					if (value instanceof Array) {
						result += "[";
						for (var i = 0; i < value.length; i++) {
							var v = value[i];
							if (i > 0) {
								result += ",";
								if (space.length) {
									result += "\n" + indent + space;
								}
							}
							result += arguments.callee(v, replacer, space, depth + 1);
						}
						if (value.length > 1 && space.length) {
							result += "\n" + indent;
						}
						result += "]";
					} else {
						result += "{";
						var count = 0;
						for (var p in value) {
							var v = value[p];
							if (count > 0) {
								result += ",";
							}
							if (space.length) {
								result += "\n" + indent + space;
							}
							result += stringifyString(p) + ":" + arguments.callee(v, replacer, space, depth + 1);
							count++;
						}
						if (count > 0 && space.length) {
							result += "\n" + indent;
						}
						result += "}";
					}
					return result;
					break;
				case "undefined":
				default:
					return "undefined";
					break;
			}
		};
		window.JSON = {
			"parse": function (text) {
				return eval("(" + text + ")");
			},
			"stringify": function (value, replacer, space) {
				var sp = "";
				if (typeof (space) == "number" && space > 1) {
					sp = new Array(space + 1).join(" ");
				} else {
					if (typeof (space) == "string") {
						sp = space;
					}
				}
				return stringifyValue(value, replacer, sp, 0);
			}
		};
	})();
}
if (!window.console) {
	window.console = {
		"log": function () {}
	};
}
JAK.ClassMaker = {};
JAK.ClassMaker.VERSION = "5.0";
JAK.ClassMaker.NAME = "JAK.ClassMaker";
JAK.ClassMaker._objLib = null;
JAK.ClassMaker.makeClass = function (params) {
	var p = this._makeDefaultParams(params);
	var constructor = function () {
		if (JAK.Browser.client == "gecko" && JAK.Browser.version == "4" && !constructor.__ff4_hack) {
			for (var p in this) {
				typeof (this[p]);
			}
			constructor.__ff4_hack = true;
		}
		var inicializator = false;
		if ("$constructor" in arguments.callee.prototype) {
			inicializator = arguments.callee.prototype.$constructor;
		}
		if (inicializator) {
			inicializator.apply(this, arguments);
		}
	};
	return this._addConstructorProperties(constructor, p);
};
JAK.ClassMaker.makeSingleton = function (params) {
	var p = this._makeDefaultParams(params);
	var constructor = function () {
		throw new Error("Cannot instantiate singleton class");
	};
	constructor._instance = null;
	constructor.getInstance = this._getInstance;
	return this._addConstructorProperties(constructor, p);
};
JAK.ClassMaker.makeInterface = function (params) {
	var p = this._makeDefaultParams(params);
	var constructor = function () {
		throw new Error("Cannot instantiate interface");
	};
	return this._addConstructorProperties(constructor, p);
};
JAK.ClassMaker.makeStatic = function (params) {
	var p = this._makeDefaultParams(params);
	var obj = {};
	obj.VERSION = p.VERSION;
	obj.NAME = p.NAME;
	return obj;
};
JAK.ClassMaker._makeDefaultParams = function (params) {
	if ("EXTEND" in params) {
		if (!params.EXTEND) {
			throw new Error("Cannot extend non-exist class");
		}
		if (!("NAME" in params.EXTEND)) {
			throw new Error("Cannot extend non-JAK class");
		}
	}
	params.NAME = params.NAME || false;
	params.VERSION = params.VERSION || "1.0";
	params.EXTEND = params.EXTEND || false;
	params.IMPLEMENT = params.IMPLEMENT || [];
	params.DEPEND = params.DEPEND || [];
	if (!(params.IMPLEMENT instanceof Array)) {
		params.IMPLEMENT = [params.IMPLEMENT];
	}
	this._preMakeTests(params);
	return params;
};
JAK.ClassMaker._preMakeTests = function (params) {
	if (!params.NAME) {
		throw new Error("No NAME passed to JAK.ClassMaker.makeClass()");
	}
	if (!this._objLib && JAK.ObjLib) {
		this._objLib = new JAK.ObjLib();
	}
	var result = false;
	if (result = this._testDepend(params.DEPEND)) {
		throw new Error("Dependency error in class " + params.NAME + " (" + result + ")");
	}
};
JAK.ClassMaker._addConstructorProperties = function (constructor, params) {
	for (var p in params) {
		constructor[p] = params[p];
	}
	this._setInheritance(constructor);
	constructor.prototype.constructor = constructor;
	constructor.prototype.$super = this._$super;
	return constructor;
};
JAK.ClassMaker._getInstance = function () {
	if (!this._instance) {
		var tmp = function () {};
		tmp.prototype = this.prototype;
		this._instance = new tmp();
		if ("$constructor" in this.prototype) {
			this._instance.$constructor();
		}
	}
	return this._instance;
};
JAK.ClassMaker._setInheritance = function (constructor) {
	if (constructor.EXTEND) {
		this._makeInheritance(constructor, constructor.EXTEND);
	}
	for (var i = 0; i < constructor.IMPLEMENT.length; i++) {
		this._makeInheritance(constructor, constructor.IMPLEMENT[i], true);
	}
};
JAK.ClassMaker._makeInheritance = function (constructor, parent, noSuper) {
	for (var p in parent.prototype) {
		var item = parent.prototype[p];
		if (typeof (item) != "function") {
			continue;
		}
		if (!item.owner) {
			item.owner = parent;
		}
	}
	if (!noSuper) {
		var tmp = function () {};
		tmp.prototype = parent.prototype;
		constructor.prototype = new tmp();
		if (this._objLib) {
			for (var i in parent.prototype) {
				if (typeof parent.prototype[i] == "object") {
					constructor.prototype[i] = this._objLib.copy(parent.prototype[i]);
				}
			}
		}
		return;
	}
	for (var p in parent.prototype) {
		if (typeof parent.prototype[p] == "object") {
			if (this._objLib) {
				constructor.prototype[p] = this._objLib.copy(parent.prototype[p]);
			}
		} else {
			if (noSuper && ((p == "$constructor") || (p == "$destructor"))) {
				continue;
			}
			constructor.prototype[p] = parent.prototype[p];
		}
	}
};
JAK.ClassMaker._testDepend = function (depend) {
	for (var i = 0; i < depend.length; i++) {
		var item = depend[i];
		if (!item.sClass) {
			return "Unsatisfied dependency";
		}
		if (!item.ver) {
			return "Version not specified in dependency";
		}
		var depMajor = item.sClass.VERSION.split(".")[0];
		var claMajor = item.ver.split(".")[0];
		if (depMajor != claMajor) {
			return "Version conflict in " + item.sClass.NAME;
		}
	}
	return false;
};
JAK.ClassMaker._$super = function () {
	var caller = arguments.callee.caller;
	if (!caller) {
		throw new Error("Function.prototype.caller not supported");
	}
	var owner = caller.owner || this.constructor;
	var callerName = false;
	for (var name in owner.prototype) {
		if (owner.prototype[name] == caller) {
			callerName = name;
			break;
		}
	}
	if (!callerName) {
		throw new Error("Cannot find supplied method in constructor");
	}
	var parent = owner.EXTEND;
	if (!parent) {
		throw new Error("No super-class available");
	}
	if (!parent.prototype[callerName]) {
		throw new Error("Super-class doesn't have method '" + callerName + "'");
	}
	var func = parent.prototype[callerName];
	return func.apply(this, arguments);
};
JAK.Events = JAK.ClassMaker.makeStatic({
	"NAME": "JAK.Events",
	"VERSION": "3.0"
});
JAK.Events._eventFolder = {};
JAK.Events._domReadyTimer = null;
JAK.Events._domReadyCallback = [];
JAK.Events._domReadyAlreadyRun = false;
JAK.Events._windowLoadListenerId = false;
JAK.Events.onDomReady = function (obj, func) {
	JAK.Events._domReadyCallback[JAK.Events._domReadyCallback.length] = {
		"obj": obj,
		"func": func
	};
	JAK.Events._onDomReady();
};
JAK.Events._onDomReady = function () {
	if ((/Safari/i.test(navigator.userAgent)) || (/WebKit|Khtml/i.test(navigator.userAgent))) {
		JAK.Events._domReadyTimer = setInterval(function () {
			if (/loaded|complete/.test(document.readyState)) {
				clearInterval(JAK.Events._domReadyTimer);
				JAK.Events._domReady();
			}
		}, 10);
	} else {
		if (document.all && !window.opera) {
			if (window.parent == window) {
				try {
					document.documentElement.doScroll("left");
				} catch (error) {
					setTimeout(arguments.callee, 1);
					return;
				}
				JAK.Events._domReady();
			} else {
				JAK.Events._windowLoadListenerId = JAK.Events.addListener(window, "load", window, function () {
					JAK.Events._domReady();
				});
			}
		} else {
			if (document.addEventListener) {
				document.addEventListener("DOMContentLoaded", JAK.Events._domReady, false);
			} else {
				JAK.Events._windowLoadListenerId = JAK.Events.addListener(window, "load", window, function () {
					JAK.Events._domReady();
				});
			}
		}
	}
};
JAK.Events._domReady = function () {
	if (!JAK.Events._domReadyAlreadyRun) {
		JAK.Events._domReadyAlreadyRun = true;
		if (document.addEventListener) {
			document.removeEventListener("DOMContentLoaded", JAK.Events._domReady, true);
		}
		if (JAK.Events._windowLoadListenerId) {
			JAK.Events.removeListener(JAK.Events._windowLoadListenerId);
			JAK.Events._windowLoadListenerId = false;
		}
		for (var i = 0; i < JAK.Events._domReadyCallback.length; i++) {
			var callback = JAK.Events._domReadyCallback[i];
			if (typeof callback.func == "string") {
				callback.obj[callback.func]();
			} else {
				callback.func.apply(callback.obj, []);
			}
		}
		JAK.Events._domReadyCallback = [];
	}
};
JAK.Events.addListener = function (elm, type, obj, func, capture) {
	var capture = capture || false;
	var action = null;
	var id = JAK.idGenerator();
	if (arguments.length > 3) {
		if (typeof (func) == "string" && typeof (obj[func]) != "function") {
			throw new Error("Events.addListener: arguments[3] must be method of arguments[2]");
		}
		action = this._getMethod(obj, func, elm, id);
	} else {
		action = this._getMethod(window, obj, elm, id);
	}
	this._addListener(elm, type, action, capture);
	this._eventFolder[id] = {
		"elm": elm,
		"type": type,
		"action": action,
		"capture": capture,
		"obj": obj,
		"func": func
	};
	return id;
};
JAK.Events._addListener = function (elm, type, action, capture) {
	if (document.addEventListener) {
		elm.addEventListener(type, action, capture);
	} else {
		if (document.attachEvent) {
			elm.attachEvent("on" + type, action);
		} else {
			throw new Error("This browser can not handle events");
		}
	}
};
JAK.Events._getMethod = function (obj, func, elm, id) {
	var f = (typeof (func) == "string" ? obj[func] : func);
	return function (e) {
		return f.call(obj, e, elm, id);
	};
};
JAK.Events.removeListener = function (id) {
	if (!(id in this._eventFolder)) {
		throw new Error("Cannot remove non-existent event ID '" + id + "'");
	}
	var obj = this._eventFolder[id];
	this._removeListener(obj.elm, obj.type, obj.action, obj.capture);
	delete this._eventFolder[id];
};
JAK.Events._removeListener = function (elm, type, action, capture) {
	if (document.removeEventListener) {
		elm.removeEventListener(type, action, capture);
	} else {
		if (document.detachEvent) {
			elm.detachEvent("on" + type, action);
		}
	}
};
JAK.Events.removeListeners = function (array) {
	while (array.length) {
		this.removeListener(array.shift());
	}
};
JAK.Events.removeAllListeners = function () {
	for (var id in this._eventFolder) {
		this.removeListener(id);
	}
};
JAK.Events.stopEvent = function (e) {
	var e = e || window.event;
	if (e.stopPropagation) {
		e.stopPropagation();
	} else {
		e.cancelBubble = true;
	}
};
JAK.Events.cancelDef = function (e) {
	var e = e || window.event;
	if (e.preventDefault) {
		e.preventDefault();
	} else {
		e.returnValue = false;
	}
};
JAK.Events.getTarget = function (e) {
	var e = e || window.event;
	return e.target || e.srcElement;
};
JAK.Events.getInfo = function () {
	var output = [];
	var nodes = [];
	var events = [];
	for (var id in JAK.Events._eventFolder) {
		var o = JAK.Events._eventFolder[id];
		var elm = o.elm;
		var index = nodes.indexOf(elm);
		if (index == -1) {
			index = nodes.push(elm) - 1;
			events[index] = [];
		}
		events[index].push(o);
	}
	for (var i = 0; i < nodes.length; i++) {
		var listeners = [];
		for (var j = 0; j < events[i].length; j++) {
			var o = events[i][j];
			var obj = o.obj || window;
			var func = o.func || o.obj;
			listeners.push({
				"sType": o.type,
				"bRemoved": false,
				"sFunction": (obj != window && obj.constructor ? "[" + obj.constructor.NAME + "]" : "") + (typeof (func) == "string" ? "." + func + " = " + obj[func].toString() : " " + func.toString())
			});
		}
		output.push({
			"sSource": "JAK",
			"nNode": nodes[i],
			"aListeners": listeners
		});
	}
	return output;
};
JAK.Browser = JAK.ClassMaker.makeStatic({
	"NAME": "JAK.Browser",
	"VERSION": "3.0"
});
JAK.Browser.platform = "";
JAK.Browser.client = "";
JAK.Browser.version = 0;
JAK.Browser.agent = "";
JAK.Browser.mouse = {};
JAK.Browser._getPlatform = function () {
	if ((this._agent.indexOf("X11") != -1) || (this._agent.indexOf("Linux") != -1)) {
		return "nix";
	} else {
		if (this._agent.indexOf("Mac") != -1) {
			return "mac";
		} else {
			if (this._agent.indexOf("Win") != -1) {
				return "win";
			} else {
				return "oth";
			}
		}
	}
};
JAK.Browser._getClient = function () {
	if (window.opera) {
		return "opera";
	} else {
		if (window.chrome) {
			return "chrome";
		} else {
			if (document.attachEvent && (typeof navigator.systemLanguage != "undefined")) {
				return "ie";
			} else {
				if (document.getAnonymousElementByAttribute) {
					return "gecko";
				} else {
					if (this._agent.indexOf("KHTML") != -1) {
						if (this._vendor == "KDE") {
							return "konqueror";
						} else {
							return "safari";
						}
					} else {
						return "oth";
					}
				}
			}
		}
	}
};
JAK.Browser._getMouse = function () {
	var left;
	var right;
	var middle;
	if ((JAK.Browser.client == "ie" && parseFloat(JAK.Browser.version) < 9) || (JAK.Browser.client == "konqueror")) {
		left = 1;
		middle = 4;
		right = 2;
	} else {
		if ((JAK.Browser.client == "opera") && (JAK.Browser.version > 7) && (JAK.Browser.version < 9)) {
			left = 1;
			middle = 4;
			right = 2;
		} else {
			if (JAK.Browser.client == "safari") {
				if (parseInt(JAK.Browser.version) > 2) {
					left = 0;
					middle = 0;
					right = 2;
				} else {
					left = 1;
					middle = 1;
					right = 2;
				}
			} else {
				left = 0;
				middle = 1;
				right = 2;
			}
		}
	}
	return {
		"left": left,
		"right": right,
		"middle": middle
	};
};
JAK.Browser._getVersion = function () {
	var out = 0;
	var fncName = "_get_" + this.client + "_ver";
	if (typeof this[fncName] == "function") {
		return this[fncName]();
	} else {
		return 0;
	}
};
JAK.Browser._get_ie_ver = function () {
	if (typeof Function.prototype.call != "undefined") {
		if (document.addEventListener) {
			return "9";
		} else {
			if (window.XDomainRequest) {
				return "8";
			} else {
				if (window.XMLHttpRequest) {
					return "7";
				} else {
					if (typeof document.doctype == "object") {
						return "6";
					} else {
						return "5.5";
					}
				}
			}
		}
	} else {
		return "5.0";
	}
};
JAK.Browser._get_opera_ver = function () {
	if (window.opera.version) {
		return window.opera.version();
	} else {
		if (document.createComment) {
			return "7";
		} else {
			return "6";
		}
	}
};
JAK.Browser._get_gecko_ver = function () {
	if (history.pushState) {
		return "4";
	} else {
		if (document.getBoxObjectFor === undefined && navigator.geolocation) {
			return "3.6";
		} else {
			if (navigator.geolocation) {
				return "3.5";
			} else {
				if (document.getElementsByClassName) {
					return "3";
				} else {
					if (window.external) {
						return "2";
					} else {
						return "1.5";
					}
				}
			}
		}
	}
};
JAK.Browser._get_konqueror_ver = function () {
	var num = this._agent.indexOf("KHTML") + 6;
	var part = this._agent.substring(num);
	var end = part.indexOf(" ");
	var x = part.substring(0, end - 2);
	return x;
};
JAK.Browser._get_safari_ver = function () {
	var ver = this._agent.match(/version\/([0-9]+)/i);
	return (ver ? ver[1] : "1");
};
JAK.Browser._get_chrome_ver = function () {
	var ver = this._agent.match(/Chrome\/([0-9]+)/i);
	return (ver ? ver[1] : null);
};
JAK.Browser.isOld = function () {
	if (this.client == "ie" && parseFloat(this.version) <= 5.5) {
		return true;
	}
	if (this.client == "opera" && parseFloat(this.version) < 9.5) {
		return true;
	}
	if (this.client == "gecko" && parseFloat(this.version) < 2) {
		return true;
	}
	if (this.client == "konqueror" && parseFloat(this.version) < 3.5) {
		return true;
	}
	if (!document.documentElement) {
		return true;
	}
	if (!document.documentElement.addEventListener && !document.documentElement.attachEvent) {
		return true;
	}
	var f = function () {};
	if (!f.call || !f.apply) {
		return true;
	}
	return false;
};
JAK.Browser.getBrowser = function () {
	this._agent = this.agent = navigator.userAgent;
	this._platform = navigator.platform;
	this._vendor = navigator.vendor;
	this.platform = this._getPlatform();
	this.client = this._getClient();
	this.version = this._getVersion();
	this.mouse = this._getMouse();
};
JAK.Browser.getBrowser();
JAK.DOM = JAK.ClassMaker.makeStatic({
	"NAME": "JAK.DOM",
	"VERSION": "5.0"
});
JAK.cel = function (tagName, className, id, doc) {
	var d = doc || document;
	var node = d.createElement(tagName);
	if (className) {
		node.className = className;
	}
	if (id) {
		node.id = id;
	}
	return node;
};
JAK.mel = function (tagName, properties, styles, doc) {
	var d = doc || document;
	var node = d.createElement(tagName);
	if (properties) {
		for (var p in properties) {
			node[p] = properties[p];
		}
	}
	if (styles) {
		JAK.DOM.setStyle(node, styles);
	}
	return node;
};
JAK.ctext = function (str, doc) {
	var d = doc || document;
	return d.createTextNode(str);
};
JAK.gel = function (id, doc) {
	var d = doc || document;
	if (typeof (id) == "string") {
		return d.getElementById(id);
	} else {
		return id;
	}
};
JAK.query = function(query, root) {
	var filterNodes = function(nodes, attributes) {
		var arr = [];
		for (var i=0;i<nodes.length;i++) {
			var node = nodes[i];
			var ok = true;
			for (var j=0;j<attributes.length;j++) {
				var attrib = attributes[j];
				var ch = attrib.charAt(0);
				var value = attrib.substr(1).toLowerCase();
				if (ch == "#" && value != node.id.toLowerCase()) { ok = false; }
				if (ch == "." && !JAK.DOM.hasClass(node, value)) { ok = false; }
			}
			if (ok) { arr.push(node); }
		}
		return arr;
	};
	var result = [];
	root = root || document;
	var selectors = query.split(",");
	while (selectors.length) {
		var selector = selectors.shift().trim();
		var parts = selector.split(/ +/);
		var candidates = [root];
		for (var i=0;i<parts.length;i++) {
			var newCandidates = [];
			var part = parts[i];
			var tagName = part.match(/^[a-z0-9]*/i)[0] || "*";
			var attributes = part.match(/[\.#][^\.#]+/g) || [];
			while (candidates.length) {
				var candidate = candidates.shift();
				var nodes = candidate.getElementsByTagName(tagName);
				newCandidates = newCandidates.concat(filterNodes(nodes, attributes));
			}
			candidates = newCandidates;
		}
		for (var i=0;i<candidates.length;i++) {
			var c = candidates[i];
			if (result.indexOf(c) == -1) { result.push(c); }
		}
	}
	return result;
};
JAK.DOM.append = function () {
	for (var i = 0; i < arguments.length; i++) {
		var arr = arguments[i];
		var head = arr[0];
		for (var j = 1; j < arr.length; j++) {
			head.appendChild(arr[j]);
		}
	}
};
JAK.DOM.hasClass = function (element, className) {
	var arr = element.className.split(" ");
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].toLowerCase() == className.toLowerCase()) {
			return true;
		}
	}
	return false;
};
JAK.DOM.addClass = function (element, className) {
	if (JAK.DOM.hasClass(element, className)) {
		return;
	}
	element.className = element.className ? element.className + " " + className : className;
};
JAK.DOM.removeClass = function (element, className) {
	var classes = element.className.split(" ");
	var classNames = className.toLowerCase().split(" ");
	var newClassArr = [];
	for (var i = 0; i < classes.length; i++) {
		if (classNames.indexOf(classes[i].toLowerCase()) === -1) {
			newClassArr.push(classes[i]);
		}
	}
	element.className = newClassArr.join(" ");
};
JAK.DOM.clear = function (element) {
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
};
JAK.DOM.getDocSize = function () {
	var x = 0;
	var y = 0;
	if (document.compatMode != "BackCompat") {
		if (document.documentElement.clientWidth && JAK.Browser.client != "opera") {
			x = document.documentElement.clientWidth;
			y = document.documentElement.clientHeight;
		} else {
			if (JAK.Browser.client == "opera") {
				if (parseFloat(JAK.Browser.version) < 9.5) {
					x = document.body.clientWidth;
					y = document.body.clientHeight;
				} else {
					x = document.documentElement.clientWidth;
					y = document.documentElement.clientHeight;
				}
			}
		}
		if ((JAK.Browser.client == "safari") || (JAK.Browser.client == "konqueror")) {
			y = window.innerHeight;
		}
	} else {
		x = document.body.clientWidth;
		y = document.body.clientHeight;
	}
	return {
		"width": x,
		"height": y
	};
};
JAK.DOM.getBoxPosition = function (obj, ref) {
	var top = 0;
	var left = 0;
	var refBox = ref || obj.ownerDocument.body;
	if (obj.getBoundingClientRect && !ref) {
		var de = document.documentElement;
		var box = obj.getBoundingClientRect();
		var scroll = JAK.DOM.getBoxScroll(obj);
		return {
			"left": box.left + scroll.x - de.clientLeft,
			"top": box.top + scroll.y - de.clientTop
		};
	}
	while (obj && obj != refBox) {
		top += obj.offsetTop;
		left += obj.offsetLeft;
		if ((JAK.Browser.client == "gecko" && JAK.Browser.version < 3) || JAK.Browser.client == "safari") {
			if (JAK.DOM.getStyle(obj, "position") == "fixed") {
				var scroll = JAK.DOM.getScrollPos();
				top += scroll.y;
				left += scroll.x;
				break;
			}
		}
		obj = obj.offsetParent;
	}
	return {
		"top": top,
		"left": left
	};
};
JAK.DOM.getPortBoxPosition = function (obj, parent, fixed) {
	var pos = JAK.DOM.getBoxPosition(obj, parent, fixed);
	var scroll = JAK.DOM.getBoxScroll(obj, parent, fixed);
	pos.left -= scroll.x;
	pos.top -= scroll.y;
	return {
		"left": pos.left,
		"top": pos.top
	};
};
JAK.DOM.getBoxScroll = function (obj, ref, fixed) {
	var x = 0;
	var y = 0;
	var cur = obj.parentNode;
	var limit = ref || obj.ownerDocument.documentElement;
	var fix = false;
	while (1) {
		if (JAK.Browser.client == "opera" && JAK.DOM.getStyle(cur, "display") != "block") {
			cur = cur.parentNode;
			continue;
		}
		if (JAK.Browser.client == "opera" && JAK.Browser.version < 9.5 && cur == document.body) {
			cur = cur.parentNode;
			continue;
		}
		if (fixed && JAK.DOM.getStyle(cur, "position") == "fixed") {
			fix = true;
		}
		if (!fix) {
			x += cur.scrollLeft;
			y += cur.scrollTop;
		}
		if (cur == limit) {
			break;
		}
		cur = cur.parentNode;
		if (!cur) {
			break;
		}
	}
	return {
		"x": x,
		"y": y
	};
};
JAK.DOM.getScrollPos = function () {
	if (document.documentElement.scrollTop || document.documentElement.scrollLeft) {
		var ox = document.documentElement.scrollLeft;
		var oy = document.documentElement.scrollTop;
	} else {
		if (document.body.scrollTop || document.body.scrollLeft) {
			var ox = document.body.scrollLeft;
			var oy = document.body.scrollTop;
		} else {
			var ox = 0;
			var oy = 0;
		}
	}
	return {
		"x": ox,
		"y": oy
	};
};
JAK.DOM.getStyle = function (elm, property) {
	if (document.defaultView && document.defaultView.getComputedStyle) {
		var cs = elm.ownerDocument.defaultView.getComputedStyle(elm, "");
		if (!cs) {
			return false;
		}
		return cs[property];
	} else {
		return elm.currentStyle[property];
	}
};
JAK.DOM.setStyle = function (elm, style) {
	for (var name in style) {
		elm.style[name] = style[name];
	}
};
JAK.DOM.writeStyle = function (css) {
	var node = JAK.mel("style", {
		"type": "text/css"
	});
	if (node.styleSheet) {
		node.styleSheet.cssText = css;
	} else {
		node.appendChild(JAK.ctext(css));
	}
	var head = document.getElementsByTagName("head");
	if (head.length) {
		head = head[0];
	} else {
		head = JAK.cel("head");
		document.documentElement.appendChild(head, document.body);
	}
	head.appendChild(node);
	return node;
};
JAK.DOM.elementsHider = function (obj, elements, action) {
	var elems = elements;
	if (!elems) {
		elems = ["select", "object", "embed", "iframe"];
	}
	var hidden = arguments.callee.hidden;
	if (hidden) {
		hidden.forEach(function (node) {
			node.style.visibility = "visible";
		});
		arguments.callee.hidden = [];
	}
	function verifyParent(node) {
		var ok = false;
		var cur = node;
		while (cur.parentNode && cur != document) {
			if (cur == obj) {
				ok = true;
			}
			cur = cur.parentNode;
		}
		return ok;
	}
	if (action == "hide") {
		if (typeof obj == "string") {
			obj = JAK.gel(obj);
		}
		var hidden = [];
		var box = this.getBoxPosition(obj);
		box.width = obj.offsetWidth + box.left;
		box.height = obj.offsetHeight + box.top;
		for (var e = 0; e < elems.length; ++e) {
			var elm = document.getElementsByTagName(elems[e]);
			for (var f = 0; f < elm.length; ++f) {
				var node = this.getBoxPosition(elm[f]);
				if (verifyParent(elm[f])) {
					continue;
				}
				node.width = elm[f].offsetWidth + node.left;
				node.height = elm[f].offsetHeight + node.top;
				if (!((box.left > node.width) || (box.width < node.left) || (box.top > node.height) || (box.height < node.top))) {
					elm[f].style.visibility = "hidden";
					hidden.push(elm[f]);
				}
			}
		}
		arguments.callee.hidden = hidden;
	}
};
JAK.DOM.getElementsByClass = function (searchClass, node, tag) {
	if (document.getElementsByClassName && !tag) {
		var elm = node || document;
		return JAK.DOM.arrayFromCollection(elm.getElementsByClassName(searchClass));
	}
	if (document.querySelectorAll && !tag) {
		var elm = node || document;
		return JAK.DOM.arrayFromCollection(elm.querySelectorAll("." + searchClass));
	}
	var classElements = [];
	var node = node || document;
	var tag = tag || "*";
	var els = node.getElementsByTagName(tag);
	var elsLen = els.length;
	var pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)");
	for (var i = 0, j = 0; i < elsLen; i++) {
		if (pattern.test(els[i].className)) {
			classElements[j] = els[i];
			j++;
		}
	}
	return classElements;
};
JAK.DOM.arrayFromCollection = function (col) {
	var result = [];
	try {
		result = Array.prototype.slice.call(col);
	} catch (e) {
		for (var i = 0; i < col.length; i++) {
			result.push(col[i]);
		}
	} finally {
		return result;
	}
};
JAK.DOM.separateCode = function (str) {
	var js = [];
	var out = {};
	var s = str.replace(/<script.*?>([\s\S]*?)<\/script>/g, function (tag, code) {
		js.push(code);
		return "";
	});
	return [s, js.join("\n")];
};
JAK.DOM.shiftBox = function (box) {
	var dx = 0;
	var dy = 0;
	var pos = JAK.DOM.getBoxPosition(box);
	var scroll = JAK.DOM.getScrollPos();
	pos.left -= scroll.x;
	pos.top -= scroll.y;
	var port = JAK.DOM.getDocSize();
	var w = box.offsetWidth;
	var h = box.offsetHeight;
	var diff = pos.top + h - port.height;
	if (diff > 0) {
		pos.top -= diff;
		dy -= diff;
	}
	var diff = pos.left + w - port.width;
	if (diff > 0) {
		pos.left -= diff;
		dx -= diff;
	}
	var diff = pos.top;
	if (diff < 0) {
		pos.top -= diff;
		dy -= diff;
	}
	var diff = pos.left;
	if (diff < 0) {
		pos.left -= diff;
		dx -= diff;
	}
	return [dx, dy];
};
JAK.DOM.scrollbarWidth = function () {
	var div = JAK.mel("div", false, {
		"width": "50px",
		"height": "50px",
		"overflow": "hidden",
		"position": "absolute",
		"left": "-200px"
	});
	var innerDiv = JAK.mel("div", false, {
		"height": "100px"
	});
	div.appendChild(innerDiv);
	document.body.insertBefore(div, document.body.firstChild);
	var w1 = div.clientWidth + parseInt(JAK.DOM.getStyle(div, "paddingLeft")) + parseInt(JAK.DOM.getStyle(div, "paddingRight"));
	JAK.DOM.setStyle(div, {
		"overflowY": "scroll"
	});
	var w2 = div.clientWidth + parseInt(JAK.DOM.getStyle(div, "paddingLeft")) + parseInt(JAK.DOM.getStyle(div, "paddingRight"));
	document.body.removeChild(div);
	return (w1 - w2);
};
JAK.ObjLib = JAK.ClassMaker.makeClass({
	"NAME": "ObjLib",
	"VERSION": "3.0"
});
JAK.ObjLib.prototype.$constructor = function () {
	this._options = {
		"functionResistant": false,
		"recursionResistant": false,
		"depthResistant": false,
		"sortedSerialization": false,
		"showFlag": false,
		"depth": 200
	};
};
JAK.ObjLib.prototype.$destructor = function () {};
JAK.ObjLib.prototype.reSetOptions = function (newOptions, set) {
	if (!newOptions) {
		return this._options;
	}
	var out = {};
	for (var i in this._options) {
		if (set && newOptions[i]) {
			this._options[i] = newOptions[i];
		}
		out[i] = newOptions[i] ? newOptions[i] : this._options[i];
	}
	return out;
};
JAK.ObjLib.prototype.pretty = function (str, sep) {
	var arr = str.toString().split("");
	var newline = this._isIE() ? "\n\r" : "\n";
	var tab = sep ? sep : "\t";
	var ptr = 0;
	var depth = 0;
	var inSpecial = "";

	function countBackslashes() {
		var cnt = 0;
		var ptr2 = ptr - 1;
		while (ptr2 >= 0 && arr[ptr2] == "\\") {
			cnt++;
			ptr2--;
		}
		return cnt;
	}
	while (ptr < arr.length) {
		var ch = arr[ptr];
		switch (ch) {
			case "\"":
				if (inSpecial == "re") {
					break;
				}
				var num = countBackslashes();
				if (!(num & 1)) {
					inSpecial = (inSpecial ? "" : "str");
				}
				break;
			case "/":
				if (inSpecial == "str") {
					break;
				}
				var num = countBackslashes();
				if (!(num & 1)) {
					inSpecial = (inSpecial ? "" : "re");
				}
				break;
			case ",":
				if (!inSpecial) {
					arr.splice(++ptr, 0, newline);
					for (var i = 0; i < depth; i++) {
						arr.splice(++ptr, 0, tab);
					}
				}
				break;
			case "{":
			case "[":
				if (!inSpecial) {
					depth++;
					arr.splice(++ptr, 0, newline);
					for (var i = 0; i < depth; i++) {
						arr.splice(++ptr, 0, tab);
					}
				}
				break;
			case "}":
			case "]":
				if (!inSpecial) {
					arr.splice(ptr++, 0, newline);
					depth--;
					for (var i = 0; i < depth; i++) {
						arr.splice(ptr++, 0, tab);
					}
				}
				break;
		}
		ptr++;
	}
	return arr.join("");
};
JAK.ObjLib.prototype.serialize = function (objToSource, options) {
	var deepFlag = 0;
	var startString = "{";
	var endString = "}";
	var propertySep = ":";
	var propertyEnd = ",";
	var mySelf = this;
	var output = "";
	var firstStep = true;
	var cache = [];
	var mOptions = this.reSetOptions(options);
	var mySource = function (obj) {
		if (mOptions.depth && (mOptions.depth < deepFlag)) {
			if (!mOptions.depthResistant) {
				throw new Error("Serialize: structure is too depth.");
			} else {
				return "\"[max depth overrun]\"";
			}
		}
		if (cache.indexOf(obj) != -1) {
			if (!mOptions.recursionResistant) {
				throw new Error("serialize: Circular reference encountered");
				return null;
			} else {
				return "\"[circular reference found]\"";
			}
		}
		if (typeof arguments[1] != "undefined") {
			var propName = arguments[1];
		} else {
			var propName = false;
		}
		if (!(obj instanceof Object)) {
			switch (typeof obj) {
				case "string":
					return "\"" + mySelf._formatString(obj) + "\"";
					break;
				case "undefined":
					return obj;
					break;
				default:
					return obj;
					break;
			}
		} else {
			cache.push(obj);
			var builtIn = mySelf._builtInObjectSerialize(obj, mOptions);
			if (builtIn.isSet) {
				return builtIn.output;
			} else {
				if (typeof obj == "function") {
					if (!mOptions.functionResistant) {
						throw new Error("Serialize: can't serialize object with some method - ** " + (propName ? "obj" : propName) + " **");
					} else {
						return "\"[" + "function: " + propName + "]\"";
					}
				}
				var output = startString;
				deepFlag++;
				var klice = [];
				for (var p in obj) {
					klice.push(p);
				}
				if (mOptions.sortedSerialization) {
					klice.sort();
				}
				for (var i = 0; i < klice.length; i++) {
					var klic = klice[i];
					var propName = mySelf._formatString(klic);
					try {
						var value = obj[klic];
					} catch (e) {
						var value = "[value inaccessible]";
					}
					output += "\"" + propName + "\"" + propertySep + mySource(value, klic) + propertyEnd;
				}
				var charNum = (output.lastIndexOf(propertyEnd) >= 0) ? output.lastIndexOf(propertyEnd) : output.length;
				output = output.substring(0, charNum);
				deepFlag--;
				return output + endString;
			}
		}
	};
	var source = mySource(objToSource);
	if (mOptions.showFlag) {
		return this.pretty(source, mOptions.showFlag);
	} else {
		return source;
	}
};
JAK.ObjLib.prototype._arraySerialize = function (fieldToSerialize, options) {
	var fieldStr = "";
	var mySelf = this;
	var mOptions = options;
	var mySource = function (field) {
		if (field instanceof Array) {
			for (var i = 0; i < field.length; i++) {
				if (typeof field[i] == "function" && !(field[i] instanceof RegExp)) {
					if (!mOptions.functionResistant) {
						throw new Error("Serialize: can't serialize Function");
					} else {
						fieldStr += "\"[" + "function: " + i + "]\",";
						continue;
					}
				}
				if ((typeof field[i] != "object") && ((typeof field[i] != "function"))) {
					if (typeof field[i] == "string") {
						var str = mySelf._formatString(field[i]);
						fieldStr += "\"" + str + "\",";
					} else {
						fieldStr += field[i] + ",";
					}
				} else {
					fieldStr += mySelf.serialize(field[i], mOptions) + ",";
				}
			}
			return "[" + fieldStr.substring(0, fieldStr.length - 1) + "]";
		} else {
			throw new Error("arraySerialize: Attribute is not Array");
		}
	};
	var myString = mySource(fieldToSerialize);
	return myString;
};
JAK.ObjLib.prototype.unserialize = function (serializedString) {
	eval("var newVar=" + serializedString);
	return newVar;
};
JAK.ObjLib.prototype.match = function (refObj, matchObj, options) {
	var mOptions = {
		"functionResistant": false,
		"recursionResistant": false,
		"depthResistant": false,
		"sortedSerialization": true,
		"showFlag": false,
		"depth": 200
	};
	if (options) {
		for (var i in mOptions) {
			mOptions[i] = (typeof options[i] != "undefined" ? options[i] : mOptions[i]);
		}
	}
	if (this.serialize(refObj, mOptions) == this.serialize(matchObj, mOptions)) {
		return true;
	} else {
		return false;
	}
};
JAK.ObjLib.prototype._builtInObjectSerialize = function (testedObj, options) {
	var output = null;
	var isSet = false;
	if (testedObj instanceof String) {
		output = "new String(\"" + this._formatString(testedObj) + "\")";
		isSet = true;
	} else {
		if (testedObj instanceof Number) {
			output = "new Number(" + testedObj + ")";
			isSet = true;
		} else {
			if (testedObj instanceof RegExp) {
				output = "new RegExp(" + testedObj + ")";
				isSet = true;
			} else {
				if (testedObj instanceof Array) {
					output = this._arraySerialize(testedObj, options);
					isSet = true;
				} else {
					if (testedObj instanceof Date) {
						var tm = testedObj.getTime();
						output = "new Date(" + tm + ")";
						isSet = true;
					} else {
						if (testedObj instanceof Boolean) {
							output = "new Boolean(" + testedObj + ")";
							isSet = true;
						} else {
							if (testedObj == null) {
								isSet = true;
							}
						}
					}
				}
			}
		}
	}
	return {
		"isSet": isSet,
		"output": output
	};
};
JAK.ObjLib.prototype._isIE = function () {
	if (document.all && document.attachEvent && !window.opera) {
		return true;
	}
	return false;
};
JAK.ObjLib.prototype.copy = function (objToCopy, options) {
	var mOptions = this.reSetOptions(options);
	var str = this.serialize(objToCopy, mOptions);
	return this.unserialize(str);
};
JAK.ObjLib.prototype._formatString = function (s) {
	var re = /["\\']/g;
	var re2 = /[\n\r\t]/g;
	var replace = {
		"\n": "\\n",
		"\t": "\\t",
		"\r": "\\r"
	};
	return s.replace(re, this._addSlashes).replace(re2, function (ch) {
		return replace[ch];
	});
}, JAK.ObjLib.prototype._addSlashes = function (ch) {
	return "\\" + ch;
};
JAK.ObjLib.prototype.arrayCopy = function (arrayToCopy, options) {
	if (arrayToCopy instanceof Array) {
		var mOptions = this.reSetOptions(options);
		var out = this._arraySerialize(arrayToCopy, mOptions);
		return this.unserialize(out);
	} else {
		throw new Error("ObjLib.arrayCopy: Attribute is not Array");
	}
};
JAK.Request = JAK.ClassMaker.makeClass({
	"NAME": "JAK.Request",
	"VERSION": "2.0"
});
JAK.Request.XML = 0;
JAK.Request.TEXT = 1;
JAK.Request.JSONP = 2;
JAK.Request.BINARY = 3;
JAK.Request.prototype.$constructor = function (type, options) {
	this._NEW = 0;
	this._SENT = 1;
	this._DONE = 2;
	this._ABORTED = 3;
	this._TIMEOUT = 4;
	this._xhr = null;
	this._callback = "";
	this._script = null;
	this._type = type;
	this._headers = {};
	this._callbacks = {};
	this._state = this._NEW;
	this._options = {
		"async": true,
		"timeout": 0,
		"method": "get"
	};
	for (var p in options) {
		this._options[p] = options[p];
	}
	if (this._type == JAK.Request.JSONP) {
		if (this._options.method.toLowerCase() == "post") {
			throw new Error("POST not supported in JSONP mode");
		}
		if (!this._options.async) {
			throw new Error("Async not supported in JSONP mode");
		}
	} else {
		if (window.XMLHttpRequest) {
			this._xhr = new XMLHttpRequest();
		} else {
			if (window.ActiveXObject) {
				this._xhr = new ActiveXObject("Microsoft.XMLHTTP");
			} else {
				throw new Error("No XHR available");
			}
		}
		this._xhr.onreadystatechange = this._onReadyStateChange.bind(this);
	}
};
JAK.Request.prototype.$destructor = function () {
	if (this._state == this._SENT) {
		this.abort();
	}
	this._xhr = null;
};
JAK.Request.prototype.setHeaders = function (headers) {
	if (this._type == JAK.Request.JSONP) {
		throw new Error("Request headers not supported in JSONP mode");
	}
	for (var p in headers) {
		this._headers[p] = headers[p];
	}
};
JAK.Request.prototype.getHeaders = function () {
	if (this._state != this._DONE) {
		throw new Error("Response headers not available");
	}
	if (this._type == JAK.Request.JSONP) {
		throw new Error("Response headers not supported in JSONP mode");
	}
	var headers = {};
	var h = this._xhr.getAllResponseHeaders();
	if (h) {
		h = h.split(/[\r\n]/);
		for (var i = 0; i < h.length; i++) if (h[i]) {
			var v = h[i].match(/^([^:]+): *(.*)$/);
			headers[v[1]] = v[2];
		}
	}
	return headers;
};
JAK.Request.prototype.send = function (url, data) {
	if (this._state != this._NEW) {
		throw new Error("Request already sent");
	}
	this._state = this._SENT;
	this._userCallback(this);
	switch (this._type) {
		case JAK.Request.XML:
		case JAK.Request.TEXT:
		case JAK.Request.BINARY:
			return this._sendXHR(url, data);
			break;
		case JAK.Request.JSONP:
			return this._sendScript(url, data);
			break;
		default:
			throw new Error("Unknown request type");
			break;
	}
};
JAK.Request.prototype.abort = function () {
	if (this._state != this._SENT) {
		return false;
	}
	this._state = this._ABORTED;
	if (this._xhr) {
		this._xhr.abort();
	}
	this._userCallback(this);
	return true;
};
JAK.Request.prototype.setCallback = function (obj, method) {
	this._setCallback(obj, method, this._DONE);
	return this;
};
JAK.Request.prototype.setSendCallback = function (obj, method) {
	this._setCallback(obj, method, this._SENT);
	return this;
};
JAK.Request.prototype.setAbortCallback = function (obj, method) {
	this._setCallback(obj, method, this._ABORTED);
	return this;
};
JAK.Request.prototype.setTimeoutCallback = function (obj, method) {
	this._setCallback(obj, method, this._TIMEOUT);
	return this;
};
JAK.Request.prototype._setCallback = function (obj, method, state) {
	this._callbacks[state] = [obj, method];
};
JAK.Request.prototype._sendXHR = function (url, data) {
	var u, d;
	if (this._options.method.toLowerCase() == "get") {
		u = this._buildURL(url, data);
		d = null;
	} else {
		u = url;
		d = this._serializeData(data);
		var ctSet = false;
		for (var p in this._headers) {
			if (p.toLowerCase() == "content-type") {
				ctSet = true;
				break;
			}
		}
		if (!ctSet) {
			this.setHeaders({
				"Content-Type": "application/x-www-form-urlencoded"
			});
		}
	}
	if (this._type == JAK.Request.BINARY) {
		if (this._xhr.overrideMimeType) {
			this._xhr.overrideMimeType("text/plain; charset=x-user-defined");
		} else {
			if (JAK.Browser.client == "ie") {
				this._buildVBS();
			} else {
				throw new Error("This browser does not support binary transfer");
			}
		}
	}
	this._xhr.open(this._options.method, u, this._options.async);
	for (var p in this._headers) {
		this._xhr.setRequestHeader(p, this._headers[p]);
	}
	this._xhr.send(d);
	if (this._options.timeout) {
		setTimeout(this._timeout.bind(this), this._options.timeout);
	}
	if (!this._options.async) {
		this._onReadyStateChange();
	}
	return u;
};
JAK.Request.prototype._sendScript = function (url, data) {
	var o = data || {};
	this._callback = "callback" + JAK.idGenerator();
	o.callback = this._callback;
	var url = this._buildURL(url, o);
	window[this._callback] = this._scriptCallback.bind(this);
	this._script = JAK.mel("script", {
		"type": "text/javascript",
		"src": url
	});
	document.body.insertBefore(this._script, document.body.firstChild);
	return url;
};
JAK.Request.prototype._buildURL = function (url, data) {
	var s = this._serializeData(data);
	if (!s.length) {
		return url;
	}
	if (url.indexOf("?") == -1) {
		return url + "?" + s;
	} else {
		return url + "&" + s;
	}
};
JAK.Request.prototype._serializeData = function (data) {
	if (typeof (data) == "string" || (window.File && data instanceof File)) {
		return data;
	}
	if (!data) {
		return "";
	}
	var arr = [];
	for (var p in data) {
		var value = data[p];
		if (!(value instanceof Array)) {
			value = [value];
		}
		for (var i = 0; i < value.length; i++) {
			arr.push(encodeURIComponent(p) + "=" + encodeURIComponent(value[i]));
		}
	}
	return arr.join("&");
};
JAK.Request.prototype._onReadyStateChange = function () {
	if (this._state == this._ABORTED) {
		return;
	}
	if (this._xhr.readyState != 4) {
		return;
	}
	var status = this._xhr.status;
	var data;
	if (this._type == JAK.Request.BINARY) {
		data = [];
		if (JAK.Browser.client == "ie") {
			var length = VBS_getLength(this._xhr.responseBody);
			for (var i = 0; i < length; i++) {
				data.push(VBS_getByte(this._xhr.responseBody, i));
			}
		} else {
			var text = this._xhr.responseText;
			var length = text.length;
			for (var i = 0; i < length; i++) {
				data.push(text.charCodeAt(i) & 255);
			}
		}
	} else {
		data = (this._type == JAK.Request.XML ? this._xhr.responseXML : this._xhr.responseText);
	}
	this._done(data, status);
};
JAK.Request.prototype._scriptCallback = function (data) {
	this._script.parentNode.removeChild(this._script);
	this._script = null;
	delete window[this._callback];
	if (this._state != this._ABORTED) {
		this._done(data, 200);
	}
};
JAK.Request.prototype._done = function (data, status) {
	this._state = this._DONE;
	this._userCallback(data, status, this);
};
JAK.Request.prototype._timeout = function () {
	if (this._state != this._SENT) {
		return;
	}
	this.abort();
	this._state = this._TIMEOUT;
	this._userCallback(this);
};
JAK.Request.prototype._userCallback = function () {
	var data = this._callbacks[this._state];
	if (!data) {
		return;
	}
	var obj = data[0] || window;
	var method = data[1];
	if (obj && typeof (method) == "string") {
		method = obj[method];
	}
	if (!method) {
		method = obj;
		obj = window;
	}
	method.apply(obj, arguments);
};
JAK.Request.prototype._buildVBS = function () {
	var s = JAK.mel("script", {
		"type": "text/vbscript"
	});
	s.text = "Function VBS_getByte(data, pos)\n" + "VBS_getByte = AscB(MidB(data, pos+1,1))\n" + "End Function\n" + "Function VBS_getLength(data)\n" + "VBS_getLength = LenB(data)\n" + "End Function";
	document.getElementsByTagName("head")[0].appendChild(s);
};
JAK.Signals = JAK.ClassMaker.makeClass({
	"NAME": "Signals",
	"VERSION": "2.0",
	"CLASS": "class"
});
JAK.Signals.prototype.$constructor = function (owner, name) {
	this._owner = owner;
	this._name = name;
	this.messageFolder = {};
	this._myHandleFolder = {};
	this._myIdFolder = {};
};
JAK.Signals.prototype.$destructor = function () {};
JAK.Signals.prototype.setMessage = function (msgName, msgValue) {
	this.messageFolder[msgName] = msgValue;
};
JAK.Signals.prototype.getMessage = function (msgName) {
	return this.messageFolder[msgName];
};
JAK.Signals.prototype.addListener = function (owner, type, funcOrString, sender) {
	if (!(type in this._myHandleFolder)) {
		this._myHandleFolder[type] = {};
	}
	var typeFolder = this._myHandleFolder[type];
	for (var id in typeFolder) {
		var item = typeFolder[id];
		if ((item.eFunction == funcOrString) && (item.eOwner == owner) && (item.eSender == sender)) {
			return null;
		}
	}
	var id = JAK.idGenerator();
	typeFolder[id] = {
		"eOwner": owner,
		"eFunction": funcOrString,
		"eSender": sender
	};
	this._myIdFolder[id] = typeFolder;
	return id;
};
JAK.Signals.prototype.removeListener = function (id) {
	var typeFolder = this._myIdFolder[id];
	if (!typeFolder) {
		throw new Error("Cannot remove non-existent signal ID '" + id + "'");
	}
	delete typeFolder[id];
	delete this._myIdFolder[id];
};
JAK.Signals.prototype.removeListeners = function (array) {
	while (array.length) {
		this.removeListener(array.shift());
	}
};
JAK.Signals.prototype.makeEvent = function (type, trg, data) {
	var event = new JAK.Signals.NewEvent(type, trg, data);
	this.myEventHandler(event);
};
JAK.Signals.NewEvent = function (type, trg, data) {
	this.type = type;
	this.target = trg;
	this.timeStamp = new Date().getTime();
	this.data = (data && typeof data == "object") ? data : null;
};
JAK.Signals.prototype.myEventHandler = function (myEvent) {
	var functionCache = [];
	for (var type in this._myHandleFolder) {
		if (type == myEvent.type || type == "*") {
			for (var p in this._myHandleFolder[type]) {
				var item = this._myHandleFolder[type][p];
				if (!item.eSender || item.eSender == myEvent.target) {
					functionCache.push(item);
				}
			}
		}
	}
	for (var i = 0; i < functionCache.length; i++) {
		var item = functionCache[i];
		var owner = item.eOwner;
		var fnc = item.eFunction;
		if (typeof fnc == "string") {
			owner[fnc](myEvent);
		} else {
			if (typeof fnc == "function") {
				fnc(myEvent);
			}
		}
	}
};
JAK.signals = new JAK.Signals();
JAK.ISignals = JAK.ClassMaker.makeInterface({
	"NAME": "JAK.ISignals",
	"VERSION": "2.0",
	"CLASS": "class"
});
JAK.ISignals.prototype.setInterface = function (interfaceName) {
	if (typeof (this[interfaceName]) != "object") {
		var owner = this._owner;
		while (typeof (owner[interfaceName]) == "undefined") {
			if (typeof owner.TOP_LEVEL != "undefined") {
				throw new Error("SetInterface:Interface not found");
			} else {
				owner = owner._owner;
			}
		}
		return owner[interfaceName];
	}
};
JAK.ISignals.prototype.addListener = function (type, handleFunction, sender) {
	return this.getInterface().addListener(this, type, handleFunction, sender);
};
JAK.ISignals.prototype.removeListener = function (id) {
	return this.getInterface().removeListener(id);
};
JAK.ISignals.prototype.removeListeners = function (array) {
	while (array.length) {
		this.removeListener(array.shift());
	}
};
JAK.ISignals.prototype.makeEvent = function (type, data) {
	this.getInterface().makeEvent(type, this, data);
};
JAK.ISignals.prototype.setSysMessage = function (msgName, msgValue) {
	this.getInterface().setMessage(msgName, msgValue);
};
JAK.ISignals.prototype.getSysMessage = function (msgName) {
	return this.getInterface().getMessage(msgName);
};
JAK.ISignals.prototype.getInterface = function () {
	return (typeof (this.signals) == "object" ? this.signals : JAK.signals);
};
JAK.AbstractDecorator = JAK.ClassMaker.makeSingleton({
	"NAME": "JAK.AbstractDecorator",
	"VERSION": "2.0"
});
JAK.AbstractDecorator.prototype.decorate = function (instance) {
	instance.$super = this._$super;
	if (!instance.__decorators) {
		instance.__decorators = [];
	}
	instance.__decorators.push(this);
	return instance;
};
JAK.AbstractDecorator.prototype._$super = function () {
	var caller = arguments.callee.caller;
	if (!caller) {
		throw new Error("Function.prototype.caller not supported");
	}
	var decorators = this.__decorators || [];
	var obj = null;
	var name = null;
	var i = decorators.length;
	while (i--) {
		var d = decorators[i];
		if (!obj && name && (name in d)) {
			obj = d;
			break;
		}
		for (var p in d) {
			if (!name && caller == d[p]) {
				name = p;
				break;
			}
		}
	}
	if (!name) {
		var owner = caller.owner || this.constructor;
		var callerName = false;
		for (var name in owner.prototype) {
			if (owner.prototype[name] == caller) {
				callerName = name;
			}
		}
		if (!callerName) {
			throw new Error("Cannot find supplied method in constructor");
		}
		var parent = owner.EXTEND;
		if (!parent) {
			throw new Error("No super-class available");
		}
		if (!parent.prototype[callerName]) {
			throw new Error("Super-class doesn't have method '" + callerName + "'");
		}
		var func = parent.prototype[callerName];
		return func.apply(this, arguments);
	} else {
		if (!obj) {
			obj = this.constructor.prototype;
			if (!(name in obj)) {
				throw new Error("Function '" + name + "' has no undecorated parent");
			}
		}
	}
	return obj[name].apply(this, arguments);
};
JAK.AutoDecorator = JAK.ClassMaker.makeSingleton({
	"NAME": "JAK.AutoDecorator",
	"VERSION": "1.0",
	"EXTEND": JAK.AbstractDecorator
});
JAK.AutoDecorator.prototype.decorate = function (instance) {
	this.$super(instance);
	var exclude = ["constructor", "$super", "_$super", "decorate"];
	for (var p in this) {
		if (exclude.indexOf(p) != -1) {
			continue;
		}
		instance[p] = this[p];
	}
};
JAK.IDecorable = JAK.ClassMaker.makeClass({
	"NAME": "JAK.IDecorable",
	"VERSION": "2.0",
	"CLASS": "class"
});
JAK.IDecorable.prototype.decorate = function (decorator) {
	var args = [this];
	for (var i = 1; i < arguments.length; i++) {
		args.push(arguments[i]);
	}
	var dec = decorator.getInstance();
	return dec.decorate.apply(dec, args);
};
JAK.Timekeeper = JAK.ClassMaker.makeSingleton({
	"NAME": "JAK.Timekeeper",
	"VERSION": "1.0"
});
JAK.Timekeeper.prototype.$constructor = function () {
	this._delay = 20;
	this._listeners = [];
	this._interval = null;
	this._tick = this._tick.bind(this);
};
JAK.Timekeeper.prototype.addListener = function (what, method, count) {
	var index = this._findListener(what);
	if (index != -1) {
		throw new Error("This listener is already attached");
	}
	var obj = {
		"what": what,
		"method": method,
		"count": count || 1,
		"bucket": 0
	};
	obj.bucket = obj.count;
	this._listeners.push(obj);
	if (!this._interval) {
		this._interval = setInterval(this._tick, this._delay);
	}
	return this;
};
JAK.Timekeeper.prototype.removeListener = function (what) {
	var index = this._findListener(what);
	if (index == -1) {
		throw new Error("Cannot find listener to be removed");
	}
	this._listeners.splice(index, 1);
	if (!this._listeners.length) {
		clearInterval(this._interval);
		this._interval = null;
	}
	return this;
};
JAK.Timekeeper.prototype._findListener = function (what) {
	for (var i = 0; i < this._listeners.length; i++) {
		if (this._listeners[i].what == what) {
			return i;
		}
	}
	return -1;
};
JAK.Timekeeper.prototype._tick = function () {
	for (var i = 0; i < this._listeners.length; i++) {
		var item = this._listeners[i];
		item.bucket--;
		if (item.bucket) {
			continue;
		}
		item.bucket = item.count;
		var obj = item.what;
		var method = (typeof (item.method) == "string" ? obj[item.method] : item.method);
		method.call(obj);
	}
};
