// Mimeo M v1.0 | Henrik Ekelöf - @henrikekelof
/*global _, Modernizr */
var _M;

(function (doc, undefined) {

	'use strict';

	var el = doc.createElement('div'),
		elStyle = el.style,
		Modernizr = window.Modernizr || {},
		prefixes = ['ms', 'O', 'Moz', 'Webkit'],
		transitionEnds = {
			'transition': 'transitionend',
			'msTransition': 'MsTransitionEnd',
			'OTransition': 'transitionend',
			'MozTransition': 'transitionend',
			'WebkitTransition': 'webkitTransitionEnd'
		};

	if (window.getComputedStyle) {
		document.body.insertBefore(el, null);
	}

	function hasClass(elm, className) {
	    return ((' ' + elm.className + ' ').indexOf(' ' + className + ' ') > -1);
	}

	function capitalize(s) {
		// TODO: Extend prototype or add to _ ?
		return s.charAt(0).toUpperCase() + s.slice(1);
	}

	function prefixed(prop) {
		if (!_.isString(prop)) {
			return;
		}
		if (prop in elStyle) {
			return prop;
		}
		prop = capitalize(prop);
		for (var i = 0, j = prefixes.length; i < j; i += 1) {
			if (prefixes[i] + prop in elStyle) {
				return prefixes[i] + prop;
			}
		}
	}

	function computed(prefixedProp, val) {

		var style,
			props = {
				'transform': 'transform',
				'msTransform': '-ms-transform',
				'OTransform': '-o-transform',
				'MozTransform': '-moz-transform',
				'WebkitTransform': '-webkit-transform'
			};

		el.style[prefixedProp] = val;

		style = window.getComputedStyle(el).getPropertyValue(props[prefixedProp]);

        if (style !== undefined && style.length > 0 && style !== 'none') {
			return true;
        }

        return false;

	}

	_M = {
		prefixed: prefixed,
		transition: prefixed('transition'),
		transitionDuration: prefixed('transitionDuration'),
		transform: prefixed('transform')
	};
	
	_M.translate3d = (_M.transform) ?
						computed(_M.transform, 'translate3d(1px,0,0)') :
						false;

	_M.transitionend = transitionEnds[_M.transition];

	_M.touch = (Modernizr.touch) ?
		Modernizr.touch : 'ontouchstart' in doc.documentElement;

	doc.documentElement.className =
		doc.documentElement.className + ((_M.touch) ? ' ' : ' no-') + 'touch';

	if (window.getComputedStyle) {
		document.body.removeChild(el);
	}

}(document));

