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
		this.glimpseRight = opts.glimpseRight;
		this.glimpseLeft = opts.glimpseLeft;
		this.move = opts.move;
		this.length = this.$items.length;
		this.position = 1;
		this.maxRight = this.length - this.visible + 1;
		this.width = this.$container.width();
		setUp(this);

		console.log(this.maxRight);

    };

    _mCarousel.prototype = {
		goto: function (pos) {
			pos = parseInt(pos, 10);
			var cssMargin, cssTranslate;
			if (pos < 1) {
				pos = 1;
			}
			if (pos > this.maxRight) {
				pos = this.maxRight;
			}
			this.position = pos;

			cssMargin = (pos - 1) / this.visible * -100;
			cssTranslate = (1 / this.length) * (pos - 1) * -100;

			//this.$container.css('margin-left', cssMargin + '%');

			this.$container[0].style.webkitTransitionDuration = 
				this.$container[0].style.MozTransitionDuration = 
				this.$container[0].style.msTransitionDuration = 
				this.$container[0].style.OTransitionDuration = 
				this.$container[0].style.transitionDuration = '';

			this.$container[0].style.MozTransform = this.$container[0].style.webkitTransform = 'translate3d(' + cssTranslate + '%,0,0)';
			this.$container[0].style.msTransform = this.$container[0].style.OTransform = 'translateX(' + cssTranslate + '%)';

			setPagerPosition(this);
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

    function setPagerPosition(carousel) {
    	carousel.$elm.find('.mCarousel-pager a')
    		.removeClass('visible');
    	carousel.$elm.find('.mCarousel-pager a')
    		.slice(carousel.position - 1, carousel.position - 1 + carousel.visible)
    		.addClass('visible');
    }

    function setUp (carousel) {
		//carousel.setUp();
		carousel.$container
			.css({
					'width': carousel.$elm.width() * carousel.length * (1 - carousel.glimpseRight - carousel.glimpseLeft) / carousel.visible,
					'margin-right': (carousel.glimpseRight) * 100 + '%',
					'margin-left': (carousel.glimpseLeft) * 100 + '%'
				});

		carousel.$items.width(1 / carousel.length * 100 + '%');

		var p = '',
			i,
			$buttonNav, $breakpointDetector;

		$breakpointDetector = $('<div class="mCarousel-detector" />');
		
		for (i = 0; i < carousel.length; i += 1) {
			p += '<a href="#" data-goto="' + (i + 1) + '">' + (i + 1) + '</a>';
		}
		$buttonNav = '<div class="mCarousel-pager">' + p + '</div>';

		$buttonNav += '<a class="mCarousel-prev" href="#">Prev</a>';
		$buttonNav += '<a class="mCarousel-next" href="#">Next</a>';

		carousel.$elm.append($buttonNav);

		setPagerPosition(carousel);

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
			carousel.$container
				.css({
					'width': carousel.$elm.width() * carousel.length * (1 - carousel.glimpseRight - carousel.glimpseLeft) / carousel.visible,
					'margin-right': (carousel.glimpseRight) * 100 + '%',
					'margin-left': (carousel.glimpseLeft) * 100 + '%'
				});
			});

		$(document.body).append($breakpointDetector);

		$breakpointDetector.on('transitionend', function () {
			console.log(carousel);
		});
		
		carousel.$container.on('touchstart', function (evt) {
			
			evt.stopPropagation();

			var e = evt.originalEvent;

			carousel.start = {
				pageX: e.touches[0].pageX,
				pageY: e.touches[0].pageY,
				time: Number( new Date() )
			};

			carousel.isScrolling = undefined;
			
			carousel.deltaX = 0;

			carousel.$container[0].style.webkitTransitionDuration = 
				carousel.$container[0].style.MozTransitionDuration = 
				carousel.$container[0].style.msTransitionDuration = 
				carousel.$container[0].style.OTransitionDuration = 
				carousel.$container[0].style.transitionDuration = '0';

//			carousel.$container[0].style.MozTransitionDuration = carousel.$container[0].style.webkitTransitionDuration = 0;
			
		});

		carousel.$container.on('touchmove', function (evt) {

			var e = evt.originalEvent;

			if (e.touches.length > 1 || e.scale && e.scale !== 1) {
				return;
			}
			
			carousel.deltaX = e.touches[0].pageX - carousel.start.pageX;

			if ( typeof carousel.isScrolling == 'undefined') {
				carousel.isScrolling = !!( carousel.isScrolling || Math.abs(carousel.deltaX) < Math.abs(e.touches[0].pageY - carousel.start.pageY) );
			}

			// if user is not trying to scroll vertically
			if (!carousel.isScrolling) {

				// prevent native scrolling
				e.preventDefault();

				// increase resistance if first or last slide
				carousel.deltaX =
				carousel.deltaX /
				( (carousel.position === 1 && carousel.deltaX > 0 // if first slide and sliding left
				|| carousel.position === carousel.maxRight // or if last slide and sliding right
				&& carousel.deltaX < 0 // and if sliding at all
				) ?
				( Math.abs(carousel.deltaX) / carousel.$container.width() + 1 ) // determine resistance level
				: 1 ); // no resistance if false

				// translate immediately 1-to-1
				carousel.$container[0].style.MozTransform = carousel.$container[0].style.webkitTransform = 'translate3d(' + (carousel.deltaX - (carousel.position - 1)  *  (carousel.$container.width() / carousel.length)) + 'px,0,0)';

				e.stopPropagation();

			}

		});

		carousel.$container.on('touchend touchcancel', function (evt) {

			var e = evt.originalEvent;
			// determine if slide attempt triggers next/prev slide
			var isValidSlide = 
			Number(new Date()) - carousel.start.time < 250      // if slide duration is less than 250ms
			&& Math.abs(carousel.deltaX) > 20                   // and if slide amt is greater than 20px
			|| Math.abs(carousel.deltaX) > carousel.$container.width() / carousel.length * carousel.visible / 4,        // or if slide amt is greater than half the width

			// determine if slide attempt is past start and end
			isPastBounds = 
			(carousel.position === 1 && carousel.deltaX > 0 )                         // if first slide and slide amt is greater than 0
			|| carousel.position == (carousel.maxRight) && carousel.deltaX < 0;    // or if last slide and slide amt is less than 0

			// if not scrolling vertically
			if (!carousel.isScrolling) {
				var moveTo = carousel.position + ( isValidSlide && !isPastBounds ? (carousel.deltaX < 0 ? 1 : -1) * carousel.move : 0 );
				if (moveTo > carousel.maxRight) {
					moveTo = carousel.maxRight;
				}
				if (moveTo < 1) {
					moveTo = 1;
				}
				
				// call slide function with slide end value based on isValidSlide and isPastBounds tests
				carousel.goto( moveTo);
			}

			e.stopPropagation();
		});

// case 'webkitTransitionEnd':
// case 'msTransitionEnd':
// case 'oTransitionEnd':
// case 'transitionend':
	}

	
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
			move: i + 1,
			glimpseRight: (i == 0 ? .1 : 0),
			glimpseLeft: 0 //.1
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



