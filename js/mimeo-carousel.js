// Mimeo Carousel v1.0 | Henrik Ekelöf - @henrikekelof
/*global _, _M */

var _mCarousel;

(function (win, doc, undefined) {

    'use strict';

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
        interval = window.setInterval(function () {
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
        _.each(styles, function (a, b) {
            elm.style[b] = a;
        });
    }

    _mCarousel = function (carousel, settings) {

        settings = _.defaults({
            visible: 1,
            move: 1,
            start: 1,
            sensitivity: 0.25, // 1/4 of carousel to move prev/next on swipe
            glimpseLeft: 0,
            glimpseRight: 0
        }, settings ? settings : {});

        this.carousel = carousel;
        this.container = carousel.children[0]; //().first();
        this.items = this.container.children;

        //this.width = getWidth(this.carousel);
        // console.log(this.width);

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
        this.length = this.items.length;
        this.max = this.length - this.visible + 1;
        
        setup.apply(this);

    };

    _mCarousel.prototype = {
        goto: function (pos) {
            
            pos = _.isNumber(pos) ? pos : parseInt(pos, 10);

            var cssMargin, cssTranslate;

            pos = (pos < 1) ? 1 : (pos > this.max) ? this.max : pos;
            
            this.position = pos;

            cssTranslate = (1 / this.length) * (pos - 1) * -100;

            if (_M.transitionDuration) {
                this.container.style[_M.transitionDuration] = '';
            }

            if (_M.translate3d) {
                this.container
                    .style[_M.transform] = 'translate3d(' + cssTranslate + '%,0,0)';
            } else {
                if (_M.transform && _M.transitionDuration) {
                    this.container
                        .style[_M.transform] = 'translateX(' + cssTranslate + '%)';
                } else {
                    cssMargin = (pos - 1) *
                                (1 - this.glimpseRight - this.glimpseLeft) /
                                this.visible * -100;
                    
                    animate(this.container, 'marginLeft', cssMargin, 300);

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
                this.goto(this.max);
            }

        }
    };

    function setup() {

        var carousel = this,
            resize;

        setWidth.call(this, true);
        
        createNavigation.apply(this);

        setNavButtonVisibility.apply(this);

        setPagerPosition.apply(this);

        if (carousel.breaks) {
            setupBreaks.apply(this);
        }

        resize = function () {
            onWindowResize.apply(carousel);
        };

        addEventListener(win, 'resize', resize);

        addEventListener(win, 'orientationchange', function () {
            setTimeout(function () {
                onWindowResize.apply(carousel);
            }, 10);
        });

        if (_M.touch && doc.addEventListener) {
            setUpTouchNav.apply(carousel);
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
        
        var i, j, nav, pager, pagerLink,
            carousel = this;
        
        nav = doc.createElement('div');
        pager = doc.createElement('div');
        pager.className = 'mCarousel-pager';

        for (i = 0, j = this.length; i < j; i += 1) {
            pagerLink = doc.createElement('a');
            pagerLink.setAttribute('href', '#goto' + (i + 1));
            pagerLink.innerHTML = (i + 1);
            //pagerLink.className = 'visible';
            pager.appendChild(pagerLink);
        }

        addEventListener(pager, 'click', function (evt) {
            var target = evt.target || evt.srcElement,
                goto = target.getAttribute('href');
            if (goto) {
                goto = goto.replace(/[^0-9.]/g, '');
                carousel.goto(parseInt(goto, 10));
            }
            return false;
        });

        nav.appendChild(pager);
        
        pagerLink = doc.createElement('a');
        pagerLink.setAttribute('href', '#prev');
        pagerLink.className = 'mCarousel-prev';
        pagerLink.innerHTML = 'Prev';
        
        addEventListener(pagerLink, 'click', function () {
            carousel.prev();
            return false;
        });

        nav.appendChild(pagerLink);

        pagerLink = doc.createElement('a');
        pagerLink.setAttribute('href', '#next');
        pagerLink.className = 'mCarousel-next';
        pagerLink.innerHTML = 'Next';
        
        addEventListener(pagerLink, 'click', function () {
            carousel.next();
            return false;
        });

        nav.appendChild(pagerLink);
        
        this.carousel.appendChild(nav);

        this.pagerLinks = nav.getElementsByTagName('DIV')[0].childNodes;
        this.nav = nav;

    }

    function pagerItemGrouped(i, j, v) {
        return !(v === 1 || i % v === 0);
    }

    function setPagerPosition() {
        

        var i, j, cssClass,
            pagerLinks = this.pagerLinks,
            visible = this.visible,
            pos = this.position - 1;
        
        for (i = 0, j = this.length; i < j; i += 1) {

            if (i === pos || (i > pos && i < pos + visible)) {
                cssClass = 'visible';
            } else {
                cssClass = '';
            }
            
            if (pagerItemGrouped(i, j, this.visible)) {
                cssClass += ' grouped';
            }

            if (pagerLinks && pagerLinks[i]) {
                pagerLinks[i].className = cssClass;
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
        
        var width;

        width = getWidth(this.carousel) * this.length *
                (1 - this.glimpseRight - this.glimpseLeft) / this.visible;
        
        setStyle(this.container, {
            width: width + 'px',
            marginLeft: (this.glimpseLeft) * 100 + '%',
            marginRight: (this.glimpseRight) * 100 + '%'
        });
        
        if (setItemWidth) {
            width = 1 / this.length * 100 + '%';
            _.each(this.items, function (item) {
                item.style.width = width;
            });
        }
        
    }

    function visible() {
        var w = getWidth(doc.documentElement),
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

    function onWindowResize() {
        
        if (this.breaks) {
        
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
            pageY: evt.touches[0].pageY,
            time: Number(new Date())
        };

        this.isScrolling = undefined;

        this.deltaX = 0;

        this.container.style[_M.transitionDuration] = '0';
    
    }

    function onTouchMove(evt) {
        
        var pos, width;

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

            width = getWidth(this.container);

            this.deltaX =
                this.deltaX /
                (
                    (
                        this.position === 1 && this.deltaX > 0 ||
                        this.position === this.max &&
                        this.deltaX < 0
                    ) ?
                (Math.abs(this.deltaX) / width + 1)
                : 1);

            pos = (this.deltaX - (this.position - 1)  *  (width / this.length));
            this.container.style[_M.transform] = 'translate3d(' + pos + 'px,0,0)';
            evt.stopPropagation();

        }

    }

    function onTouchEnd(evt) {
        
        var isValidSlide, isPastBounds, moveTo, width;

        width = getWidth(this.container);

        isValidSlide =
            Number(new Date()) - this.start.time < 250 &&
            Math.abs(this.deltaX) > 20 ||
            Math.abs(this.deltaX) > width / this.length * this.visible * this.sensitivity;

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
}(window, document));


