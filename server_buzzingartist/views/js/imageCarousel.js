
$(document).ready(function(e) {
	$('.with-hover-text, .regular-link').click(function(e){
		e.stopPropagation();
	});
	//enable_arrows( 3 );
	
	/***************
	* = Hover text *
	* Hover text for the last slide
	***************/
	
	var img_loaded = 0;
	var j_images = [];
	
	/*************************
	* = Controls active menu *
	* Hover text for the last slide
	*************************/
	// $('#slide-3 img').each(function(index, element) {
		
	// 	var time = new Date().getTime();
	// 	var oldHref = $(this).attr('src');
	// 	//alert("oldhref " + oldHref);
	// 	var myImg = $('<img />').attr('src', oldHref + '?' + time );
	// 	//alert("my img " + myImg.attr('src'));
		

	// });
	
});

/******************
* = Gallery width *
******************/
$(function() {
	var pause = 50; // will only process code within delay(function() { ... }) every 100ms.
	$(window).resize(function() {
			delay(function() {
				var gallery_images = $('#slide-3 img');
				
				var images_per_row = 0;
				if ( gallery_images.length % 2 == 0 ) {
					images_per_row = gallery_images.length / 2;
				} else {
					images_per_row = gallery_images.length / 2 + 1;
				}
				//alert(" $('#slide-3 img').width() " + $('#slide-3 img').width() + " and length " + $('#slide-3 img').length)
				var gallery_width = $('#slide-3 img').width() * $('#slide-3 img').length + 100 * $('#slide-3 img').length;
				// gallery_width /= 2;
				// if ( $('#slide-3 img').length % 2 != 0 ) {
				// 	gallery_width += $('#slide-3 img').width();
				// }
				//alert("gallery width " + gallery_width);
				//alert("gallery_width " + gallery_width);
				$('#slide-3 .row').css('width', gallery_width );
				//lert("$('#slide-3 .row').width() " + $('#slide-3 .row').width())
				var left_pos = 0;
				//left_pos /= -2;
				//alert("left_pos " + left_pos);
				
				$('#slide-3 .row').css('left', left_pos);
			
			},
			pause
		);
	});
	$(window).resize();
});

var delay = (function(){
	var timer = 0;
	return function(callback, ms){
		clearTimeout (timer);
		timer = setTimeout(callback, ms);
	};
})();



// function enable_arrows( dataslide ) {
	
// 	if ( dataslide == 3 ) {
// 		$('#arrow-left').removeClass('disabled');
// 		$('#arrow-right').removeClass('disabled');
// 	}
// }

/*************
* = Parallax *
*************/

/***************
* = Menu hover *
***************/


/******************
* = Gallery hover *
******************/
jQuery(document).ready(function ($) {
	//Cache some variables
	var images = $('#slide-3 a');
	images.hover(
		function(e) {
			$(this).css('overflow', 'visible');
			var asta = $(this).find('img');
			var astaspan = $(this).find('span');
			$('#slide-3 img').not(asta).stop(false, false).animate(
				{
					opacity: 0.5
				},
				'fast',
				'linear'
			);
			$('#slide-3 span').not(astaspan).stop(false, false).animate(
				{
					opacity: 0.5
				},
				'fast',
				'linear'
			);
			// $(this).find('.hover-text')
			// 	.show()
		},
		function(e) {
			var obj = $(this);
			$('#slide-3 img').stop(false, false).animate(
				{
					opacity: 1
				},
				'fast',
				'linear'
			);
			$('#slide-3 span').stop(false, false).animate(
				{
					opacity: 1
				},
				'fast',
				'linear'
			);
			
			// $(this).find('.hover-text').hide();
				// .animate(
				// 	{
				// 		paddingTop: '0',
				// 		opacity: 0
				// 	},
				// 	'fast',
				// 	'linear',
				// 	function() {
				// 		$(this).hide();
				// 		$( obj ).css('overflow', 'hidden');
				// 	}
				// );
		}
	);
	// images.hover(
	// 	function(e) {

	// 		var asta = $(this).find('img');
	// 		$('#slide-3 img').not( asta ).stop(false, false).animate(
	// 			{
	// 				opacity: .5,
					
	// 			},
	// 			'fast',
	// 			'linear'
	// 		);

	// 		// $('#slide-3 input').show();
	// 		// $('#slide-3 input').text("Hello")
			
	// 	},
	// 	function(e) {
	// 		$('#slide-3 img').stop(false, false).animate(
	// 			{
	// 				opacity: 1
	// 			},
	// 			'fast',
	// 			'linear'
	// 		);
	// 		// $('.zoom').remove();
	// 		// $('#eventDetails').hide();
	// 	}
	// );
});

/******************
* = Arrows click  *
******************/
jQuery(document).ready(function ($) {
	//Cache some variables
	var arrows = $('#arrows div');
	
	arrows.click(function(e) {
		e.preventDefault();
		
		if ( $(this).hasClass('disabled') )
			return;
		
		var slide = null;
		var offset_top = false;
		var offset_left = false;
		
		
		switch( $(this).attr('id') ) {
			case 'arrow-left':
				//alert("('$('#slide-3 .row').offset().left " + $('#slide-3 .row').offset().left)
				offset_left = $('#slide-3 .row').offset().left + $( window ).width();;
				if ( offset_left > 0 ) {
					offset_left = '0px';
				}
				break;
			case 'arrow-right':
				offset_left = $('#slide-3 .row').offset().left - $( window ).width();;
				
				
				//alert("$('#slide-3 .row').width() " + $('#slide-3 .row').width())
				//alert("offset_left " + offset_left);
				if ( offset_left < $(window).width() - $('#slide-3 .row').width() ) {
					offset_left = $(window).width() - $('#slide-3 .row').width();
				}
				break;
		}
		//alert("offset_left " + offset_left);	
		if ( offset_left != false ) {

			if ( $('#slide-3 .row').width() != $(window).width() ) {
				//alert("going for animation");
				$('#slide-3 .row').stop(false, false).animate({
					left: offset_left
				}, 1500);
			}
		}
	});
});