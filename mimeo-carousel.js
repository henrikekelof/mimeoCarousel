
// Mimeo Carousel v1.0 | Henrik Ekelöf - @henrikekelof

var _mCarousel;

(function (win, doc, undefined) {

    'use strict';

    // _M feature detection
    
    var isArray,
        _M,
        el = doc.createElement('div'),
        elStyle = el.style,
        Modernizr = win.Modernizr || {},
        prefixes = ['ms', 'O', 'Moz', 'Webkit'],
        transformProps = {
            'transform': 'transform',
            'msTransform': '-ms-transform',
            'OTransform': '-o-transform',
            'MozTransform': '-moz-transform',
            'WebkitTransform': '-webkit-transform'
        };

    if (win.getComputedStyle) {
        doc.body.insertBefore(el, null);
    }

    function isString(obj) {
        return Object.prototype.toString.call(obj) === '[object String]';
    }

    function capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    function prefixed(prop) {
        if (!isString(prop)) {
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

        var style;

        el.style[prefixedProp] = val;

        style = win.getComputedStyle(el).getPropertyValue(transformProps[prefixedProp]);

        if (style !== undefined && style.length > 0 && style !== 'none') {
            return true;
        }

        return false;

    }

    _M = {
        transition: prefixed('transition'),
        transitionDuration: prefixed('transitionDuration'),
        transform: prefixed('transform')
    };

    _M.transformProp = _M.transform ? transformProps[_M.transform] : false;
    
    _M.translate3d = (_M.transform) ?
                        computed(_M.transform, 'translate3d(1px,0,0)') :
                        false;

    _M.touch = (Modernizr.touch) ?
        Modernizr.touch : 'ontouchstart' in doc.documentElement;

    if (win.getComputedStyle) {
        doc.body.removeChild(el);
    }

    // Utilities

    function defaults(a, b) {
        var prop;
        for (prop in b) {
            if (b.hasOwnProperty(prop)) {
                a[prop] = b[prop];
            }
        }
        return a;
    }

    isArray = Array.isArray || function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    function isNumber(obj) {
        return Object.prototype.toString.call(obj) === '[object Number]';
    }

    function getWidth(elm) {
        return parseInt(elm.offsetWidth, 10);
    }

    function addEventListener(elm, evt, fn) {
        if (elm.addEventListener) {
            elm.addEventListener(evt, fn, false);
            return;
        }
        if (elm.attachEvent) {
            elm.attachEvent('on' + evt, fn);
            return;
        }
    }

    function animate(element, prop, end, time) {
        var interval, times, pos, step,
            counter = 0;
        pos = parseInt(element.style.marginLeft, 10);
        times = time / 10;
        step = (end - pos) / times;
        interval = win.setInterval(function () {
            counter += 1;
            if (counter === times) {
                element.style.marginLeft = end + '%';
                clearInterval(interval);
                return;
            }
            pos = pos + step;
            element.style.marginLeft = pos + '%';
        }, 10);
    }
    
    function setStyle(elm, styles) {
        var prop;
        for (prop in styles) {
            if (styles.hasOwnProperty) {
                elm.style[prop] = styles[prop];
            }
        }
    }

    // The Carousel

    _mCarousel = function (carousel, settings) {

        settings = defaults({
            visible: 1,
            move: 1,
            start: 1,
            speed: 300,
            after: undefined,
            before: undefined,
            // Swipe at least 1/4 of carousel width to move prev/next
            sensitivity: 0.25,
            glimpseLeft: 0,
            glimpseRight: 0,
            prev: 'Prev',
            next: 'Next'
        }, settings ? settings : {});

        this.settings = settings;

        this.carousel = carousel;
        this.container = carousel.children[0];
        this.items = this.container.children;

        this.lastBreak = false;
        this.breakAtLow = false;
        this.breakAtHigh = false;

        if (isArray(settings.visible)) {
            this.breakpoints = settings.visible;
            this.visible = visible.apply(this);
            this.move = this.visible;
            this.glimpseLeft = (this.lastBreak[2]) ? this.lastBreak[2] : 0;
            this.glimpseRight = (this.lastBreak[3]) ? this.lastBreak[3] : 0;
        } else {
            this.breakpoints = false;
            this.visible = settings.visible;
            this.move = settings.move;
            this.glimpseLeft = settings.glimpseLeft;
            this.glimpseRight = settings.glimpseRight;
        }
        
        this.position = settings.start;
        this.length = this.items.length;
        this.max = this.length - this.visible + 1;
        
        setup.apply(this);

    };

    _mCarousel.prototype = {
        moveTo: function (pos) {

            var cssMarginPos, cssTranslatePos, carousel;
            
            if (this.settings.before) {
                this.settings.before.call(this, this);
            }

            pos = isNumber(pos) ? pos : parseInt(pos, 10);
            pos = (pos < 1) ? 1 : (pos > this.max) ? this.max : pos;
            
            this.position = pos;

            cssTranslatePos = (1 / this.length) * (pos - 1) * -100;

            if (_M.transitionDuration) {
                this.container.style[_M.transitionDuration] = this.settings.speed;
            }

            setPagerPosition.apply(this);

            if (this.settings.after) {
                carousel = this;
                setTimeout(function () {
                    carousel.settings.after.call(carousel, carousel);
                }, this.settings.speed);
            }

            if (_M.translate3d) {
                this.container.style[_M.transform] =
                    'translate3d(' + cssTranslatePos + '%,0,0)';
                return;
            }

            if (_M.transform && _M.transitionDuration) {
                this.container.style[_M.transform] =
                    'translateX(' + cssTranslatePos + '%)';
                return;
            }
            
            cssMarginPos =
                (pos - 1) *
                (1 - this.glimpseRight - this.glimpseLeft) /
                this.visible * -100;

            animate(this.container, 'marginLeft', cssMarginPos, this.settings.speed);

        },
        prev: function () {
            var moveTo = this.position - this.move;
            if (moveTo < 1 && this.position > 1) {
                moveTo = 1;
            }
            if (moveTo < 1) {
                moveTo = this.max;
            }
            this.moveTo(moveTo);
        },
        next: function () {
            var moveTo = this.position + this.move;
            if (moveTo > this.max && this.position < this.max) {
                moveTo = this.max;
            }
            if (moveTo > this.max) {
                moveTo = 1;
            }
            this.moveTo(moveTo);
        },
        setSize: function (n) {
            
            if (!n) {
                return;
            }

            this.visible = n;
            this.move = n;
            this.max = this.length - this.visible + 1;
            
            setWidth.call(this, true);
            setNavButtonVisibility.apply(this);

            if (this.position > this.max) {
                this.moveTo(this.max);
            }

        }
    };

    function setup() {

        var carousel = this,
            resize;

        if (_M.transformProp && _M.transition) {
            this.container.style[_M.transition] =
                _M.transformProp + ' ' + this.settings.speed + 'ms';
        }

        setWidth.call(this, true);
        createNavigation.apply(this);
        setNavButtonVisibility.apply(this);
        setPagerPosition.apply(this);

        if (carousel.breakpoints) {
            setupBreaks.apply(this);
        }

        resize = function () {
            onWindowResize.apply(carousel);
        };

        addEventListener(win, 'resize', resize);

        addEventListener(win, 'orientationchange', function () {
            setTimeout(resize, 10);
        });

        if (_M.touch && doc.addEventListener) {
            setUpTouchNav.apply(carousel);
        }

        if (this.position !== 1) {
            this.moveTo(this.position);
        }

    }

    function setUpTouchNav() {

        var carousel = this;

        carousel.container.addEventListener('touchstart', function (evt) {
            onTouchStart.call(carousel, evt);
        });

        carousel.container.addEventListener('touchmove', function (evt) {
            onTouchMove.call(carousel, evt);
        });

        carousel.container.addEventListener('touchend', function (evt) {
            onTouchEnd.call(carousel, evt);
        });

        carousel.container.addEventListener('touchcancel', function (evt) {
            onTouchEnd.call(carousel, evt);
        });

    }

    function setupBreaks() {

        var i, j;
        
        for (i = 0, j = this.breakpoints.length; i < j; i += 1) {
            if (this.lastBreak[0] === this.breakpoints[i][0]) {
                break;
            }
        }
        
        this.breakAtLow = (i < 1) ? [0, 0] : this.breakpoints[i - 1];
        
        this.breakAtHigh = (i < this.breakpoints.length - 1) ?
            this.breakpoints[i + 1] :
            [Math.max(win.screen.width, win.screen.height) * 2, 0];

        this.glimpseLeft = (this.lastBreak[2]) ? this.lastBreak[2] : 0;
        this.glimpseRight = (this.lastBreak[3]) ? this.lastBreak[3] : 0;

    }

    function createNavigation() {
        
        var i, j, nav, pager, pagerLink,
            carousel = this;
        
        nav = doc.createElement('div');
        pager = doc.createElement('div');
        pager.className = 'mCarousel-pager';

        for (i = 0, j = this.length; i < j; i += 1) {
            pagerLink = doc.createElement('a');
            pagerLink.setAttribute('href', '#moveTo' + (i + 1));
            pagerLink.innerHTML = (i + 1);
            pager.appendChild(pagerLink);
        }

        addEventListener(pager, 'click', function (evt) {
            var target = evt.target || evt.srcElement,
                moveTo = target.getAttribute('href');
            if (moveTo) {
                moveTo = moveTo.replace(/[^0-9.]/g, '');
                carousel.moveTo(parseInt(moveTo, 10));
            }
            return false;
        });

        nav.appendChild(pager);
        
        if (!_M.touch) {

            pagerLink = doc.createElement('a');
            pagerLink.setAttribute('href', '#prev');
            pagerLink.className = 'mCarousel-prev';
            pagerLink.innerHTML = this.settings.prev;
            
            addEventListener(pagerLink, 'click', function () {
                carousel.prev();
                return false;
            });

            nav.appendChild(pagerLink);

            pagerLink = doc.createElement('a');
            pagerLink.setAttribute('href', '#next');
            pagerLink.className = 'mCarousel-next';
            pagerLink.innerHTML = this.settings.next;
            
            addEventListener(pagerLink, 'click', function () {
                carousel.next();
                return false;
            });

            nav.appendChild(pagerLink);

        }
                
        this.carousel.appendChild(nav);

        this.pagerLinks = nav.getElementsByTagName('DIV')[0].childNodes;
        this.nav = nav;

    }

    function pagerItemGrouped(i, visible) {
        return !(visible === 1 || i % visible === 0);
    }

    function setPagerPosition() {
        
        var i, j, cssClass,
            pos = this.position - 1;
        
        for (i = 0, j = this.length; i < j; i += 1) {
            if (i === pos || (i > pos && i < pos + this.visible)) {
                cssClass = 'visible';
            } else {
                cssClass = '';
            }
            if (pagerItemGrouped(i, this.visible)) {
                cssClass += ' grouped';
            }
            if (this.pagerLinks && this.pagerLinks[i]) {
                this.pagerLinks[i].className = cssClass;
            }
        }

    }

    function setNavButtonVisibility() {
        if (this.visible === this.length) {
            this.nav.style.display = 'none';
            return;
        }
        this.nav.style.display = '';
    }

    function setWidth(setItemWidth) {
        
        var width, i, j;

        width = getWidth(this.carousel) * this.length *
                (1 - this.glimpseRight - this.glimpseLeft) / this.visible;
        
        setStyle(this.container, {
            width: width + 'px',
            marginLeft: (this.glimpseLeft) * 100 + '%',
            marginRight: (this.glimpseRight) * 100 + '%'
        });
        
        if (setItemWidth) {
            width = 1 / this.length * 100 + '%';
            for (i = 0, j = this.items.length; i < j; i += 1) {
                this.items[i].style.width = width;
            }
        }
        
    }

    function visible() {
        var w = getWidth(doc.documentElement),
            i, j;
        for (i = 0, j = this.breakpoints.length; i < j; i += 1) {
            if (w >= this.breakpoints[i][0]) {
                this.lastBreak = this.breakpoints[i];
            } else {
                break;
            }
        }
        if (!this.lastBreak) {
            this.lastBreak = [1, 1];
        }
        return this.lastBreak[1];
    }

    function onWindowResize() {
        
        if (this.breakpoints) {
        
            var w = getWidth(doc.documentElement);
        
            if (w < this.lastBreak[0]) {
                if (this.breakAtLow[1] !== this.lastBreak[1]) {
                    this.setSize(this.breakAtLow[1]);
                    setPagerPosition.apply(this);
                }
                this.lastBreak = this.breakAtLow;
                setupBreaks.apply(this);
                return;
            }
            if (w >= this.breakAtHigh[0]) {
                if (this.breakAtHigh[1] !== this.lastBreak[1]) {
                    this.setSize(this.breakAtHigh[1]);
                    setPagerPosition.apply(this);
                }
                this.lastBreak = this.breakAtHigh;
                setupBreaks.apply(this);
                return;
            }
            
        }

        setWidth.call(this);

    }


    function onTouchStart(evt) {
        
        evt.stopPropagation();

        this.start = {
            pageX: evt.touches[0].pageX,
            pageY: evt.touches[0].pageY
        };

        this.isScrolling = undefined;
        this.deltaX = 0;
        this.container.style[_M.transitionDuration] = '0';
    
    }

    function onTouchMove(evt) {
        
        var pos, width, resistance;

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
            evt.stopPropagation();

            width = getWidth(this.container);
            resistance = width / this.length;

            if ((this.deltaX > 0 && this.position === 1) ||
                (this.deltaX < 0 && this.position === this.max)) {
                // Increase resistance if sliding outside of range
                this.deltaX = this.deltaX / (Math.abs(this.deltaX) / resistance + 1);
            }

            pos = (this.deltaX - (this.position - 1)  *  (width / this.length));
            this.container.style[_M.transform] = 'translate3d(' + pos + 'px,0,0)';

        }

    }

    function onTouchEnd(evt) {
        
        evt.stopPropagation();

        var width, minDeltaX, validSwipe, slidePossible, moveTo;

        if (!this.isScrolling) {

            width = getWidth(this.container);
            minDeltaX = width / this.length * this.visible * this.settings.sensitivity;
            validSwipe = Math.abs(this.deltaX) > minDeltaX;
            slidePossible =
                (this.deltaX > 0 && this.position > 1) ||
                (this.deltaX < 0 && this.position < this.max);

            moveTo = this.position;

            if (validSwipe && slidePossible) {
                moveTo += (this.deltaX < 0 ? 1 : -1) * this.move;
            }

            if (moveTo > this.max) {
                moveTo = this.max;
            }

            if (moveTo < 1) {
                moveTo = 1;
            }
            
            this.moveTo(moveTo);

        }
        
    }

}(window, document));


