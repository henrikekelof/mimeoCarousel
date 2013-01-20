// Mimeo Carousel v1.0 | Henrik Ekelöf - @henrikekelof

/*global $, console */

var _mCarousel;

(function () {

	'use strict';

	_mCarousel = function ($elm, opts) {
		
		console.log($elm);
		this.$elm = $elm;
		this.$container = opts.container;
		this.$items = opts.items;
		this.visible = opts.visible;
		this.move = opts.move;
		this.length = this.$items.length;
		this.position = 1;
		this.maxRight = this.length - this.visible + 1;
		setUp(this);

		console.log(this.maxRight);

    };

    _mCarousel.prototype = {
		goto: function (pos) {
			pos = parseInt(pos, 10);
			var css;
			if (pos < 1) {
				pos = this.maxRight;
			}
			if (pos > this.length) {
				pos = 1;
			}
			this.position = pos;
			css = (pos - 1) * 100 / this.visible * -1;
			this.$container.css('margin-left', css + '%');
		},
		prev: function () {
			var goto = this.position - this.move;
			if (goto < 1 && this.position > 1) {
				goto = 1;
			}
			if (goto < 1) {
				goto = this.maxRight;
			}
			this.position = goto;
			this.goto(this.position);
		},
		// 1.2.3.4.5
		// x x        1 + 2 = 3
		//     x x    3 + 2 = 5
		//       x x

		next: function () {
			var goto = this.position + this.move;
			if (goto > this.maxRight && this.position < this.maxRight) {
				goto = this.maxRight;
			}
			if (goto > this.maxRight) {
				goto = 1;
			}
			this.position = goto;
			this.goto(this.position);
		}
    };

    var setUp = function (carousel) {
		//carousel.setUp();
		carousel.$container.width(carousel.$elm.width() * carousel.length / carousel.visible);
		carousel.$items.width(1 / carousel.length * 100 + '%');

		var p = '',
			i,
			$buttonNav;

		for (i = 0; i < carousel.length; i += 1) {
			p += '<a href="#" data-goto="' + (i + 1) + '">' + (i + 1) + '</a>';
		}
		$buttonNav = '<div class="mCarousel-pager">' + p + '</div>';

		$buttonNav += '<a class="mCarousel-prev" href="#">Prev</a>';
		$buttonNav += '<a class="mCarousel-next" href="#">Next</a>';

		carousel.$elm.append($buttonNav);

		carousel.$elm.find('.mCarousel-next').on('click', function (e) {
			e.preventDefault();
			carousel.next();
		});

		carousel.$elm.find('.mCarousel-prev').on('click', function (e) {
			e.preventDefault();
			carousel.prev();
		});

		carousel.$elm.find('.mCarousel-pager a').on('click', function (e) {
			e.preventDefault();
			carousel.goto(parseInt($(e.target).data('goto'), 10));
		});

		$(window).on('resize', function () {
			carousel.$container.width(carousel.$elm.width() * carousel.length / carousel.visible);
		});
	};

	
}());


(function () {

	'use strict';

	var $carousels = $('.mCarousel');

	$carousels.each(function (i, elm) {
		var $elm = $(elm);
		new _mCarousel($elm, {
			container: $elm.find('ul').first(),
			items: $elm.find('li'),
			visible: i + 1,
			move: i + 1
		});
		
	});

}());
/*
(function (undefined) {

    'use strict';
    
    var Mimeo, mimeo,
		current, instances = {};

	function hasKey(query) {
		return (query && _.has(_m.breakpoints, query));
	}

	function value(query) {
		if (hasKey(query)) {
			return _m.breakpoints[query];
		}
	}

	function narrowerThan(query) {
		return (hasKey(query) && value(current) < value(query));
	}

	function equals(query) {
		return (hasKey(query) && value(current) === value(query));
	}

	function widerThan(query) {
		return (hasKey(query) && value(current) > value(query));
	}

    window._m = function (query) {
		if (_.isString(query) && hasKey(query)) {
			if (!instances.hasOwnProperty(query)) {
				instances[query] = new Mimeo(query);
			}
			return instances[query];
		} else {
			return mimeo;
		}
    };

    Mimeo = function (query) {
		if (query) {
			this.query = query;
		}
    };

    _m.fn = Mimeo.prototype = {
		wider: function (fn, args) {
			if (_.isFunction(fn) && this.query && widerThan(this.query)) {
				fn(args);
			}
			return this;
		},
		equal: function (fn, args) {
			if (_.isFunction(fn) && this.query && equals(this.query)) {
				fn(args);
			}
			return this;
		},
		narrower: function (fn, args) {
			if (_.isFunction(fn) && this.query && narrowerThan(this.query)) {
				fn(args);
			}
			return this;
		}
    };

    _m.set = function (breakpoint) {
		if (hasKey(breakpoint)) {
			_m.current(breakpoint);
			return true;
		}
		return false;
	};

	_m.current = function (breakpoint) {
		if (breakpoint && _.isString(breakpoint) && hasKey(breakpoint)) {
			current = breakpoint;
		} else {
			return current;
		}
	};

	_m.narrowerThan = narrowerThan;
	_m.equals = equals;
	_m.widerThan = widerThan;

    mimeo = new Mimeo();

}());


(function () {
 
	'use strict';

	var modulesIncluded = { },
		modulesLength = 0,
		i, l;

	function addModules(mods) {
		if (!modulesIncluded[mods]) {
			modulesIncluded[mods] = true;
			modulesLength += 1;
		}
	}

	function include(mods) {

		if (typeof mods === 'string') {
			addModules(mods);
		} else {
			for (i = 0, l = mods.length; i < l; i += 1) {
				addModules(mods[i]);
			}
		}
	}

	_m.include = include;
	_m.included = modulesIncluded;
	
}());
*/



