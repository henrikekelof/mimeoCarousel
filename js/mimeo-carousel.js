// Mimeo Carousel v1.0 | Henrik Ekelöf - @henrikekelof
/*global $, _, _M */
var _mCarousel;

(function (win, undefined) {

	'use strict';

	var $win = $(win);

	_mCarousel = function ($carousel, opts) {
		// container: $elm.find('ul').first(),
		// items: $elm.find('li'),

		var defaults = {
			visible: 1,
			move: 1,
			start: 1,
			glimpseLeft: 0,
			glimpseRight: 0
		},
		settings;

		settings = $.extend({}, defaults, opts);

		this.$carousel = $carousel;
		this.$container = $carousel.children().first();
		this.$items = this.$container.children();

		this.width = this.$carousel.width();
		this.cWidth = this.$container.width();

		console.log('this.$container.width: ' + this.$container.width());
		console.log('this.cWidth: ' + this.cWidth);


		this.lastBreak = false;
		this.breakAtLow = false;
		this.breakAtHigh = false;

		

		if (_.isArray(settings.visible)) {
			this.breaks = settings.visible;
			this.visible = visible.apply(this);
			this.move = this.visible;
			this.glimpseLeft = (this.lastBreak[2]) ? this.lastBreak[2] : 0;
			this.glimpseRight = (this.lastBreak[3]) ? this.lastBreak[3] : 0;
		} else {
			this.breaks = false;
			this.visible = settings.visible;
			this.move = settings.move;
			this.glimpseLeft = settings.glimpseLeft;
			this.glimpseRight = settings.glimpseRight;
		}

		this.position = settings.start;

		this.length = this.$items.length;

		this.max = this.length - this.visible + 1;
		
		setUp.apply(this);

	};

	_mCarousel.prototype = {
		goto: function (pos) {

			pos = parseInt(pos, 10);

			var cssMargin, cssTranslate;

			pos = (pos < 1) ? 1 : (pos > this.max) ? this.max : pos;
			
			this.position = pos;

			cssTranslate = (1 / this.length) * (pos - 1) * -100;

			if (_M.transitionDuration) {
				this.$container.css(_M.transitionDuration, '');
			}

			if (_M.translate3d) {
				this.$container
					.css(_M.transform, 'translate3d(' + cssTranslate + '%,0,0)');
			} else {
				if (_M.transform && _M.transitionDuration) {
					this.$container
						.css(_M.transform, 'translateX(' + cssTranslate + '%)');
				} else {
					cssMargin = (pos - 1) *
								(1 - this.glimpseRight - this.glimpseLeft) /
								this.visible * -100;
					this.$container.animate({'margin-left': cssMargin + '%'}, 300);
				}
			}
			
			setPagerPosition.apply(this);

		},
		prev: function () {
			var goto = this.position - this.move;
			goto = (goto < 1 && this.position > 1) ?
						1 : (goto < 1) ?
							this.max : goto;
			this.goto(goto);
		},
		next: function () {
			var goto = this.position + this.move;
			goto = (goto > this.max && this.position < this.max) ?
						this.max : (goto > this.max) ?
							1 : goto;
			this.goto(goto);
		},
		setWidth: function (setItemWidth) {
			
			this.width = this.$carousel.width();
			
			var width = this.width * this.length *
					(1 - this.glimpseRight - this.glimpseLeft) / this.visible,
				marginLeft = (this.glimpseRight) * 100,
				marginRight = (this.glimpseLeft) * 100;
			this.$container.css({
				'width': width,
				'margin-right': marginLeft + '%',
				'margin-left': marginRight + '%'
			});
			if (setItemWidth) {
				this.$items.width(1 / this.length * 100 + '%');
			}
			this.cWidth = this.$container.width();
		},
		setVisible: function (n, m) {
			if (!n) {
				return;
			}
			this.visible = n;
			this.move = n; //(m) ? m : n;
			this.max = this.length - this.visible + 1;
			
			
			this.setWidth(true);
			// this.$container
			// .css({
			// 'width': this.$carousel.width() * this.length * (1 - this.glimpseRight - this.glimpseLeft) / this.visible
			// 	});

			setNavButtonVisibility.apply(this);

			if (this.position > this.max) {
				this.goto(this.max);
			}

			setPagerPosition.apply(this);

		}
	};

	function setNavButtonVisibility() {
		
		

		if (this.visible === this.length) {
			this.$carousel
				.find('.mCarousel-pager, .mCarousel-prev, .mCarousel-next').hide();
			return;
		}
		
		this.$carousel.find('.mCarousel-pager, .mCarousel-prev, .mCarousel-next').show();
		
	}

	function visible() {

		

		var w = $(window).width(),
			i, j;
		
		for (i = 0, j = this.breaks.length; i < j; i += 1) {
			if (w >= this.breaks[i][0]) {
				this.lastBreak = this.breaks[i];
			} else {
				break;
			}
		}


		
		return this.lastBreak[1];

	}

	function setupBreaks() {

		
		//console.log(this.lastBreak);
		var i, j;
		
		// [[1, 1], [321, 2], [640, 3], [768, 4]]
		for (i = 0, j = this.breaks.length; i < j; i += 1) {
			if (this.lastBreak[0] === this.breaks[i][0]) {
				break;
			}
		}
		
		this.breakAtLow = (i < 1) ? [0, 0] : this.breaks[i - 1];
		
		this.breakAtHigh = (i < this.breaks.length - 1) ?
			this.breaks[i + 1] :
			[
				Math.max(window.screen.width, window.screen.height) * 2, 0
			];

		this.glimpseLeft = (this.lastBreak[2]) ? this.lastBreak[2] : 0;
		this.glimpseRight = (this.lastBreak[3]) ? this.lastBreak[3] : 0;

	}

	function createNavigation() {
		
		

		var $pager, $prev, $next,
			pagerLinks = '', i, j,
			carousel = this;

		for (i = 0, j = this.length; i < j; i += 1) {
			pagerLinks += '<a href="#" data-goto="' + (i + 1) + '">' + (i + 1) + '</a>';
		}
		
		$pager = $('<div class="mCarousel-pager" />');
		$pager.append(pagerLinks);
		
		this.$pagerLinks = $pager.find('a');

		$pager.on('click', 'a', function (e) {
			e.preventDefault();
			carousel.goto(parseInt($(e.target).data('goto'), 10));
		});

		if (_M.touch) {
			this.$carousel.append($pager);
			return;
		}

		$prev = $('<a class="mCarousel-prev" href="#">Prev</a>');
		$next = $('<a class="mCarousel-next" href="#">Next</a>');
		
		$prev.on('click', function (e) {
			e.preventDefault();
			carousel.prev();
		});

		$next.on('click', function (e) {
			e.preventDefault();
			carousel.next();
		});

		this.$carousel.append($pager, $prev, $next);

	}

	function setPagerPosition() {
		
		this.$pagerLinks
			.removeClass('visible')
			.slice(this.position - 1, this.position - 1 + this.visible)
			.addClass('visible');
    }

    function windowResizeHandler() {

		

		if (this.breaks) {
			
			var w = $win.width();

			if (w < this.lastBreak[0]) {
				if (this.breakAtLow[1] !== this.lastBreak[1]) {
					this.setVisible(this.breakAtLow[1]);
				}
				this.lastBreak = this.breakAtLow;
				setupBreaks.apply(this);
				this.setWidth(false);
				return;
			}
			if (w >= this.breakAtHigh[0]) {
				if (this.breakAtHigh[1] !== this.lastBreak[1]) {
					this.setVisible(this.breakAtHigh[1]);
				}
				this.lastBreak = this.breakAtHigh;
				setupBreaks.apply(this);
				this.setWidth(false);
				return;
			}
			
		}

		this.setWidth(false);

    }

	function setUp() {
		
		
		
		var carousel = this;

		this.setWidth(true);
		
		createNavigation.apply(this);

		setNavButtonVisibility.apply(this);

		setPagerPosition.apply(this);

		if (carousel.breaks) {
			setupBreaks.apply(this);
		}

		$win.on('resize orientationchange', _.debounce(function () {
			windowResizeHandler.apply(carousel);
		}, 50));

		if (_M.touch) {
			setUpTouchNav.apply(carousel);
		}

	}

	function setUpTouchNav() {

		var carousel = this;

		carousel.$container.on('touchstart', function (evt) {
			onTouchStart.call(carousel, evt.originalEvent);
		});

		carousel.$container.on('touchmove', function (evt) {
			onTouchMove.call(carousel, evt.originalEvent);
		});

		carousel.$container.on('touchend touchcancel', function (evt) {
			onTouchEnd.call(carousel, evt.originalEvent);
		});

	}

	function onTouchStart(evt) {
		
		evt.stopPropagation();

		this.setWidth();

		this.start = {
			pageX: evt.touches[0].pageX,
			pageY: evt.touches[0].pageY,
			time: Number(new Date())
		};

		this.isScrolling = undefined;

		this.deltaX = 0;

		//carousel.$container[0].style[transitionDurationName] = '0';
		this.$container.css(_M.transitionDuration, '0');

		// carousel.$container[0].style.MozTransitionDuration =
		// carousel.$container[0].style.webkitTransitionDuration = 0;
			
	}

	function onTouchMove(evt) {
		
		var pos;

		if (evt.touches.length > 1 || evt.scale && evt.scale !== 1) {
			return;
		}
		
		this.deltaX = evt.touches[0].pageX - this.start.pageX;

		if (this.isScrolling === undefined) {
			this.isScrolling = !!(this.isScrolling || Math.abs(this.deltaX) <
				Math.abs(evt.touches[0].pageY - this.start.pageY));
		}

		if (!this.isScrolling) {

			evt.preventDefault();

			console.log('this.$container.width: ' + this.$container.width());
			console.log('this.cWidth: ' + this.cWidth);

			this.deltaX =
				this.deltaX /
				(
					(
						this.position === 1 && this.deltaX > 0 ||
						this.position == (this.max) &&
						this.deltaX < 0
					) ?
				(Math.abs(this.deltaX) / this.$container.width() + 1)
				: 1);

			//pos = (this.deltaX - (this.position - 1)  *
			// (this.$container.width() / this.length));
			
			pos = (this.deltaX - (this.position - 1)  *  (this.$container.width() / this.length));
			this.$container.css(_M.transform, 'translate3d(' + pos + 'px,0,0)');
			evt.stopPropagation();

		}

	}

	function onTouchEnd(evt) {
		
		var isValidSlide, isPastBounds, moveTo;

		isValidSlide =
			Number(new Date()) - this.start.time < 250 &&
			Math.abs(this.deltaX) > 20 ||
			Math.abs(this.deltaX) > this.$container.width() / this.length * this.visible / 4;
			// 4 = 1/4 of carousel to move prev/next
		isPastBounds =
			(this.position === 1 && this.deltaX > 0) ||
			this.position === this.max && this.deltaX < 0;

		if (!this.isScrolling) {
			
			moveTo = this.position + (isValidSlide && !isPastBounds ?
				(this.deltaX < 0 ? 1 : -1) * this.move : 0);
			if (moveTo > this.max) {
				moveTo = this.max;
			}
			if (moveTo < 1) {
				moveTo = 1;
			}
			
			this.goto(moveTo);
		}

		evt.stopPropagation();
	}
}(window));

