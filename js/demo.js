/*global $, _mCarousel */

(function () {

	'use strict';

	var carousels = [];

	$('.mCarousel.photos').each(function (i, elm) {
		
		var $elm = $(elm);

		carousels.push(new _mCarousel($elm, {
			visible: [[1, 1], [640, 2]]
		}));
		
	});

	//visible: (i === 0 ? [[1, 1], [480, 2], [640, 3], [768, 4]] : i),

	$('.mCarousel.one-two').each(function (i, elm) {
		
		var $elm = $(elm);

		carousels.push(new _mCarousel($elm, {
			visible: [[1, 1], [480, 2]]
		}));

		$('.mCarousel.one-four').each(function (i, elm) {
		
			var $elm = $(elm);

			carousels.push(new _mCarousel($elm, {
				visible: [
					[1, 1, 0, 0.15],
					[480, 2, 0, 0],
					[640, 3, 0, 0],
					[768, 4, 0, 0]
				]
			}));
			
		});
		
	});

}());



