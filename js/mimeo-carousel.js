
// Mimeo Modernize v1.0 | Henrik Ekelöf - @henrikekelof

var _M;

(function (doc, undefined) {

	'use strict';

	var el = doc.createElement('div'),
		elStyle = el.style,
		prefixes = ['ms', 'O', 'Moz', 'Webkit'],
		transitionEnds = {
			'transition': 'transitionend',
			'msTransition': 'MsTransitionEnd',
			'OTransition': 'transitionend',
			'MozTransition': 'transitionend',
			'WebkitTransition': 'webkitTransitionEnd'
		},
		i, j;

	if (window.getComputedStyle) {
		document.body.insertBefore(el, null);
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

        if (style !== undefined && style.length > 0 && style !== "none") {
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

	if (window.getComputedStyle) {
		document.body.removeChild(el);
	}

}(document));

// Mimeo Carousel v1.0 | Henrik Ekelöf - @henrikekelof

/*global $, console */

var _mCarousel;

(function (undefined) {

	'use strict';

	var carouselCount = 0,
		transitionName = _M.transition,
		transitionEndName = _M.transitionend,
		transformName = _M.transform,
		transitionDurationName = _M.transitionDuration;
	


	_mCarousel = function ($elm, opts) {
		
		carouselCount += 1;

		console.log($elm);
		this.$elm = $elm;
		this.$container = opts.container;
		this.$items = opts.items;
		this.visible = opts.visible;

		if (_.isArray(this.visible)) {
			this.breaks = this.visible;
			this.visible = 1; // Todo: get from window width
		} else {
			this.breaks = false;
		}

		this.glimpseRight = opts.glimpseRight;
		this.glimpseLeft = opts.glimpseLeft;
		this.move = opts.move;
		
		this.lastBreak = false;
		this.breakAtLow = false;
		this.breakAtHigh = false;
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

			// this.$container[0].style[transitionDurationName] = '';
			
			// this.$container.css('margin-left', + ( this.width / this.length * this.visible * (pos - 1) * -1 )  + 'px');
			
			if (_M.translate3d) {
				this.$container[0].style[transformName] = 'translate3d(' + cssTranslate + '%,0,0)';
			
			} else {
				if (transformName) {
					this.$container[0].style[transformName] = 'translateX(' + cssTranslate + '%)';
				} else {
					// Fallback use margin
			 		this.$container[0].style['marginLeft'] = cssMargin + '%';
				}
			}
			this.$container[0].style.msTransform = this.$container[0].style.OTransform = 'translateX(' + cssTranslate + '%)';

			setPagerPosition.apply(this);

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
		},
		setVisible: function (n, m) {
			console.log('Setting ' + n);
			this.visible = n;
			this.move = n;
			this.maxRight = this.length - this.visible + 1;
			this.$container
			.css({
					'width': this.$elm.width() * this.length * (1 - this.glimpseRight - this.glimpseLeft) / this.visible
				});

			this.$items.width(1 / this.length * 100 + '%');

			if (this.visible === this.length) {
				this.$elm.find('.mCarousel-pager, .mCarousel-prev, .mCarousel-next').hide();
			} else {
				this.$elm.find('.mCarousel-pager, .mCarousel-prev, .mCarousel-next').show();
			}

			if (this.position > this.maxRight) {
				this.goto(this.maxRight);
			}

			setPagerPosition.apply(this);

		}

    };

    function setPagerPosition() {
    	this.$elm.find('.mCarousel-pager a')
    		.removeClass('visible');
    	this.$elm.find('.mCarousel-pager a')
    		.slice(this.position - 1, this.position - 1 + this.visible)
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

		function setupBreaks() {
			var w = $(window).width(),
				i;
			for (i = 0; i < carousel.breaks.length; i += 1) {
				// [[1, 1], [321, 2], [640, 3], [768, 4]] 
				if (w >= carousel.breaks[i][0]) {
					carousel.lastBreak = carousel.breaks[i];
				} else {
					break;
				}
			}
			
			if (i === 1) {
				carousel.breakAtLow = [0, 0];
				carousel.breakAtHigh = carousel.breaks[i];
			}
			else if (i === carousel.breaks.length) {
				carousel.breakAtLow = carousel.breaks[i-2];
				carousel.breakAtHigh = [Math.max(window.screen.width, window.screen.height) * 2, 0];
			} else {
				carousel.breakAtLow = carousel.breaks[i-2];
				carousel.breakAtHigh = carousel.breaks[i];
			}

			console.log('Setup');
			console.log(carousel.breakAtLow);
			console.log(carousel.lastBreak);
			console.log(carousel.breakAtHigh);

			carousel.setVisible(carousel.lastBreak[1]);

		}

		function resetBreaks() {
			
			var w = $(window).width(),
				i;
			
			for (i = 0; i < carousel.breaks.length; i += 1) {
				// [[1, 1], [321, 2], [640, 3], [768, 4]] 
				if (carousel.lastBreak[0] === carousel.breaks[i][0]) {
					break;
				}
			}

			console.log(i);
			
			if (i === 1) {
				carousel.breakAtLow = carousel.breaks[i-1];
				carousel.breakAtHigh = carousel.breaks[i+1];
			}
			else if (i === carousel.breaks.length - 1) {
				carousel.breakAtLow = carousel.breaks[i-1];
				carousel.breakAtHigh = [Math.max(window.screen.width, window.screen.height) * 2, 0];
			} else {
				carousel.breakAtLow = carousel.breaks[i-1];
				carousel.breakAtHigh = carousel.breaks[i+1];
			}

			console.log('Resize');
			console.log(carousel.breakAtLow);
			console.log(carousel.lastBreak);
			console.log(carousel.breakAtHigh);
			
			//carousel.setVisible(carousel.lastBreak[1]);

		}

		if (carousel.breaks) {
			setupBreaks();
		}

		setPagerPosition.apply(carousel);

		$(window).on('resize', function () {

			carousel.$container
				.css({
					'width': carousel.$elm.width() * carousel.length * (1 - carousel.glimpseRight - carousel.glimpseLeft) / carousel.visible,
					'margin-right': (carousel.glimpseRight) * 100 + '%',
					'margin-left': (carousel.glimpseLeft) * 100 + '%'
				});

			if (carousel.breaks) {
				
				var w = $(window).width(),
					i;

				//} else {
				if (w < carousel.lastBreak[0]) {
					console.log('Break low');
					if (carousel.breakAtLow[1] !== carousel.lastBreak[1]) {
						carousel.setVisible(carousel.breakAtLow[1]);
					}
					carousel.lastBreak = carousel.breakAtLow;
					resetBreaks();
				}
				if (w >= carousel.breakAtHigh[0]) {
					console.log('Break hi');	
					if (carousel.breakAtHigh[1] !== carousel.lastBreak[1]) {
						carousel.setVisible(carousel.breakAtHigh[1]);	
					}
					carousel.lastBreak = carousel.breakAtHigh;
					resetBreaks();
				}
				//}

				//this.lastBreak = x;
			}

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

			carousel.$container[0].style[transitionDurationName] = '0';

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

	var $carousels = $('.mCarousel'),
		instances = [];

	$carousels.each(function (i, elm) {
		var $elm = $(elm);
		instances.push(new _mCarousel($elm, {
			container: $elm.find('ul').first(),
			items: $elm.find('li'),
			visible: (i == 0 ? [[1, 1], [480, 2], [640, 3], [768, 4]] : i),
			move: i,
			glimpseRight: (i == 1 ? .1 : 0),
			glimpseLeft: 0 //.1
		}));
		
	});

	

}());



