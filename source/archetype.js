(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define("archetype", factory);
	} else {
		root.archetype = factory();
	}
}(window, function () {

	"use strict";

	//
	// Initialisation
	//

	var _frame = (function prepareIframe() {
			var frame = document.createElement("iframe");
			frame.style.display = "none";
			frame.style.visibility = "hidden";
			frame.setAttribute("owner", "archetype");
			document.body.appendChild(frame);
			return frame;
		})(),
		_safeWindow = _frame.contentWindow;

	var fnToString = _safeWindow.Function.prototype.toString,
		toString = _safeWindow.Object.prototype.toString,
		reHostCtor = /^\[object .+?Constructor\]$/,
		reNative = new RegExp('^' +
			// Coerce `Object#toString` to a string
			String(toString)
				// Escape any special regexp characters
				.replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&')
				// Replace mentions of `toString` with `.*?` to keep the template generic.
				// Replace thing like `for ...` to support environments like Rhino which add extra info
				// such as method arity.
				.replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
		);

	//
	// Toolkit
	//

	function getMethodAtPath(path, windowObj) {
		windowObj = windowObj || window;
		var currentObj,
			pathParts = path.split("."),
			windowName = pathParts.shift();
		if (windowName !== "window") {
			throw new Error("Invalid path");
		}
		pathParts.unshift(windowObj);
		return pathParts.reduce(function(previous, current) {
			if (previous && previous[current]) {
				return previous[current];
			}
			return undefined;
		});
	}

	/**
	 * Check if a method is native
	 * Taken from: https://davidwalsh.name/detect-native-function
	 */
	function isNative(value) {
		var type = typeof value;
		return type === "function" ?
			// Use `Function#toString` to bypass the value's own `toString` method
			// and avoid being faked out.
			reNative.test(fnToString.call(value)) :
			// Fallback to a host object check because some environments will represent
			// things like typed arrays as DOM methods which may not conform to the
			// normal native pattern.
			(value && type == 'object' && reHostCtor.test(toString.call(value))) || false;
	}

	function pathIsNative(path, windowObj) {
		var currentObj = getMethodAtPath(path, windowObj);
		return currentObj ? isNative(currentObj) : false;
	}
	
	return {

		isNative: function(pathOrMethod) {
			return typeof pathOrMethod === "string" ?
				pathIsNative(pathOrMethod) :
				isNative(pathOrMethod);
		}

	};

}));
