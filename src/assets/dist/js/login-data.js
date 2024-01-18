/*Login Init*/

// "use strict";

export var OwlCarousel = function (id) {
	$('#' + id).owlCarousel({
		items: 1,
		animateOut: 'fadeOut',
		loop: true,
		margin: 10,
		autoplay: true,
		mouseDrag: false

	});
}
