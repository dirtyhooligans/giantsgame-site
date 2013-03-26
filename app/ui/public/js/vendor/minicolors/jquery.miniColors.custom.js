/*
 * jQuery miniColors: A small color selector
 *
 * Copyright 2011 Cory LaViska for A Beautiful Site, LLC. (http://abeautifulsite.net/)
 *
 * Dual licensed under the MIT or GPL Version 2 licenses
 *
*/
if(jQuery) (function($) {
	
	$.extend($.fn, {
		
		miniColors: function(o, data) {
			
			var create = function(input, o, data) {
				//
				// Creates a new instance of the miniColors selector
				//
				
				// Determine initial color (defaults to white)
				var color = expandHex(input.val());
				if( !color ) color = 'ffffff';
				var hsb = hex2hsb(color);
				
				// Create trigger
				var trigger = $('<a class="miniColors-trigger" style="background-color: #' + color + '" href="#"></a>');
				trigger.insertAfter(input);
				
				// Set input data and update attributes
				input
					.addClass('miniColors')
					.data('original-maxlength', input.attr('maxlength') || null)
					.data('original-autocomplete', input.attr('autocomplete') || null)
					.data('letterCase', o.letterCase ? o.letterCase : 'uppercase')
					.data('trigger', trigger)
					.data('hsb', hsb)
					.data('change', o.change ? o.change : null)
					.data('close', o.close ? o.close : null)
					.data('open', o.open ? o.open : null)
					.attr('maxlength', 7)
					.attr('autocomplete', 'off')
					.val('#' + convertCase(color, o.letterCase));
				
				// Handle options
				if( o.readonly ) input.prop('readonly', true);
				if( o.disabled ) disable(input);
				
				// Show selector when trigger is clicked
				trigger.on('click.miniColors', function(event) {
					event.preventDefault();
					if( input.val() === '' ) input.val('#');
					show(input);

				});
				
				// Show selector when input receives focus
				input.on('focus.miniColors', function(event) {
					if( input.val() === '' ) input.val('#');
					show(input);
				});
				
				// Hide on blur
				input.on('blur.miniColors', function(event) {
					var hex = expandHex( hsb2hex(input.data('hsb')) );
					input.val( hex ? '#' + convertCase(hex, input.data('letterCase')) : '' );
				});
				
				// Hide when tabbing out of the input
				input.on('keydown.miniColors', function(event) {
					if( event.keyCode === 9 ) hide(input);
				});
				
				// Update when color is typed in
				input.on('keyup.miniColors', function(event) {
					setColorFromInput(input);
				});
				
				// Handle pasting
				input.on('paste.miniColors', function(event) {
					// Short pause to wait for paste to complete
					setTimeout( function() {
						setColorFromInput(input);
					}, 5);
				});
				
			};
			
			var destroy = function(input) {
				//
				// Destroys an active instance of the miniColors selector
				//
				
				hide();
				input = $(input);
				
				// Restore to original state
				input.data('trigger').remove();
				input
					.attr('autocomplete', input.data('original-autocomplete'))
					.attr('maxlength', input.data('original-maxlength'))
					.removeData()
					.removeClass('miniColors')
					.off('.miniColors');
				$(document).off('.miniColors');
			};
			
			var enable = function(input) {
				//
				// Enables the input control and the selector
				//
				input
					.prop('disabled', false)
					.data('trigger')
					.css('opacity', 1);
			};
			
			var disable = function(input) {
				//
				// Disables the input control and the selector
				//
				hide(input);
				input
					.prop('disabled', true)
					.data('trigger')
					.css('opacity', 0.5);
			};
			
			var show = function(input) {
				//
				// Shows the miniColors selector
				//
				if( input.prop('disabled') ) return false;
				
				// Hide all other instances 
				hide();				
                
				// Generate the selector
				var selector = $('<div class="miniColors-selector"></div>');
				selector
					.append('<div class="miniColors-colors" style="background-color: #FFF;"><div class="miniColors-colorPicker"><div class="miniColors-colorPicker-inner"></div></div>')
					.append('<div class="miniColors-hues"><div class="miniColors-huePicker"></div></div>')
					.css('display', 'none')
					.addClass( input.attr('class') );
				
				// Set background for colors
				var hsb = input.data('hsb');
				selector
					.find('.miniColors-colors')
					.css('backgroundColor', '#' + hsb2hex({ h: hsb.h, s: 100, b: 100 }));
				
				// Set colorPicker position
				var colorPosition = input.data('colorPosition');
				if( !colorPosition ) colorPosition = getColorPositionFromHSB(hsb);
				selector.find('.miniColors-colorPicker')
					.css('top', colorPosition.y + 'px')
					.css('left', colorPosition.x + 'px');
				
				// Set huePicker position
				var huePosition = input.data('huePosition');
				if( !huePosition ) huePosition = getHuePositionFromHSB(hsb);
				selector.find('.miniColors-huePicker').css('top', huePosition.y + 'px');
				
				// Set input data
				input
					.data('selector', selector)
					.data('huePicker', selector.find('.miniColors-huePicker'))
					.data('colorPicker', selector.find('.miniColors-colorPicker'))
					.data('mousebutton', 0);
				
				$('BODY').append(selector);
				
				// Position the selector
				var trigger = input.data('trigger'),
					hidden = !input.is(':visible'),
					top = hidden ? trigger.offset().top + trigger.outerHeight() : input.offset().top + input.outerHeight(),
					left = hidden ? trigger.offset().left : input.offset().left,
					selectorWidth = selector.outerWidth(),
					selectorHeight = selector.outerHeight(),
					triggerWidth = trigger.outerWidth(),
					triggerHeight = trigger.outerHeight(),
					windowHeight = $(window).height(),
					windowWidth = $(window).width(),
					scrollTop = $(window).scrollTop(),
					scrollLeft = $(window).scrollLeft();
				
				// Adjust based on viewport
				if( (top + selectorHeight) > windowHeight + scrollTop ) top = top - selectorHeight - triggerHeight;
				if( (left + selectorWidth) > windowWidth + scrollLeft ) left = left - selectorWidth + triggerWidth;
				
				// Set position and show
				selector.css({
					top: top,
					left: left
				}).fadeIn(100);
				
				// Prevent text selection in IE
				selector.on('selectstart', function() { return false; });
				
				// Hide on resize (IE7/8 trigger this when any element is resized...)
				if( !$.browser.msie || ($.browser.msie && $.browser.version >= 9) ) {
					$(window).on('resize.miniColors', function(event) {
						hide(input);
					});
				}
				
				$(document).on('mousedown.miniColors touchstart.miniColors', function(event) {
					
					input.data('mousebutton', 1);
					var testSubject = $(event.target).parents().andSelf();
					
					if( testSubject.hasClass('miniColors-colors') ) {
						event.preventDefault();
						input.data('moving', 'colors');
						moveColor(input, event);
					}
					
					if( testSubject.hasClass('miniColors-hues') ) {
						event.preventDefault();
						input.data('moving', 'hues');
						moveHue(input, event);
					}
					
					if( testSubject.hasClass('miniColors-selector') ) {
						event.preventDefault();
						return;
					}
					
					if( testSubject.hasClass('miniColors') ) return;
					
					hide(input);
				});
				
				$(document)
					.on('mouseup.miniColors touchend.miniColors', function(event) {
					    event.preventDefault();
						input.data('mousebutton', 0).removeData('moving');
					})
					.on('mousemove.miniColors touchmove.miniColors', function(event) {
						event.preventDefault();
						if( input.data('mousebutton') === 1 ) {
							if( input.data('moving') === 'colors' ) moveColor(input, event);
							if( input.data('moving') === 'hues' ) moveHue(input, event);
						}
					});
				
				// Fire open callback
				if( input.data('open') ) {
					input.data('open').call(input.get(0), '#' + hsb2hex(hsb), hsb2rgb(hsb));
				}
				
			};
			
			var hide = function(input) {
				
				//
				// Hides one or more miniColors selectors
				//
				
				// Hide all other instances if input isn't specified
				if( !input ) input = $('.miniColors');
				
				input.each( function() {
					var selector = $(this).data('selector');
					$(this).removeData('selector');
					$(selector).fadeOut(100, function() {
						// Fire close callback
						if( input.data('close') ) {
							var hsb = input.data('hsb'), hex = hsb2hex(hsb);	
							input.data('close').call(input.get(0), '#' + hex, hsb2rgb(hsb));
						}
						$(this).remove();
					});
				});
				
				$(document).off('.miniColors');
				
			};
			
			var moveColor = function(input, event) {

				var colorPicker = input.data('colorPicker');
				
				colorPicker.hide();
				
				var position = {
					x: event.pageX,
					y: event.pageY
				};
				
				// Touch support
				if( event.originalEvent.changedTouches ) {
					position.x = event.originalEvent.changedTouches[0].pageX;
					position.y = event.originalEvent.changedTouches[0].pageY;
				}
				position.x = position.x - input.data('selector').find('.miniColors-colors').offset().left - 5;
				position.y = position.y - input.data('selector').find('.miniColors-colors').offset().top - 5;
				if( position.x <= -5 ) position.x = -5;
				if( position.x >= 144 ) position.x = 144;
				if( position.y <= -5 ) position.y = -5;
				if( position.y >= 144 ) position.y = 144;
				
				input.data('colorPosition', position);
				colorPicker.css('left', position.x).css('top', position.y).show();
				
				// Calculate saturation
				var s = Math.round((position.x + 5) * 0.67);
				if( s < 0 ) s = 0;
				if( s > 100 ) s = 100;
				
				// Calculate brightness
				var b = 100 - Math.round((position.y + 5) * 0.67);
				if( b < 0 ) b = 0;
				if( b > 100 ) b = 100;
				
				// Update HSB values
				var hsb = input.data('hsb');
				hsb.s = s;
				hsb.b = b;
				
				// Set color
				setColor(input, hsb, true);
			};
			
			var moveHue = function(input, event) {
				
				var huePicker = input.data('huePicker');
				
				huePicker.hide();
				
				var position = {
					y: event.pageY
				};
				
				// Touch support
				if( event.originalEvent.changedTouches ) {
					position.y = event.originalEvent.changedTouches[0].pageY;
				}
				
				position.y = position.y - input.data('selector').find('.miniColors-colors').offset().top - 1;
				if( position.y <= -1 ) position.y = -1;
				if( position.y >= 149 ) position.y = 149;
				input.data('huePosition', position);
				huePicker.css('top', position.y).show();
				
				// Calculate hue
				var h = Math.round((150 - position.y - 1) * 2.4);
				if( h < 0 ) h = 0;
				if( h > 360 ) h = 360;
				
				// Update HSB values
				var hsb = input.data('hsb');
				hsb.h = h;
				
				// Set color
				setColor(input, hsb, true);
				
			};
			
			var setColor = function(input, hsb, updateInput) {
				input.data('hsb', hsb);
				var hex = hsb2hex(hsb);	
				if( updateInput ) input.val( '#' + convertCase(hex, input.data('letterCase')) );
				input.data('trigger').css('backgroundColor', '#' + hex);
				if( input.data('selector') ) input.data('selector').find('.miniColors-colors').css('backgroundColor', '#' + hsb2hex({ h: hsb.h, s: 100, b: 100 }));
				
				// Fire change callback
				if( input.data('change') ) {
					if( hex === input.data('lastChange') ) return;
					input.data('change').call(input.get(0), '#' + hex, hsb2rgb(hsb));
					input.data('lastChange', hex);
				}
				
			};
			
			var setColorFromInput = function(input) {
				
				input.val('#' + cleanHex(input.val()));
				var hex = expandHex(input.val());
				if( !hex ) return false;
				
				// Get HSB equivalent
				var hsb = hex2hsb(hex);
				
				// If color is the same, no change required
				var currentHSB = input.data('hsb');
				if( hsb.h === currentHSB.h && hsb.s === currentHSB.s && hsb.b === currentHSB.b ) return true;
				
				// Set colorPicker position
				var colorPosition = getColorPositionFromHSB(hsb);
				var colorPicker = $(input.data('colorPicker'));
				colorPicker.css('top', colorPosition.y + 'px').css('left', colorPosition.x + 'px');
				input.data('colorPosition', colorPosition);
				
				// Set huePosition position
				var huePosition = getHuePositionFromHSB(hsb);
				var huePicker = $(input.data('huePicker'));
				huePicker.css('top', huePosition.y + 'px');
				input.data('huePosition', huePosition);
				
				setColor(input, hsb);
				
				return true;
				
			};
			
			var convertCase = function(string, letterCase) {
				if( letterCase === 'lowercase' ) return string.toLowerCase();
				if( letterCase === 'uppercase' ) return string.toUpperCase();
				return string;
			};
			
			var getColorPositionFromHSB = function(hsb) {				
				var x = Math.ceil(hsb.s / 0.67);
				if( x < 0 ) x = 0;
				if( x > 150 ) x = 150;
				var y = 150 - Math.ceil(hsb.b / 0.67);
				if( y < 0 ) y = 0;
				if( y > 150 ) y = 150;
				return { x: x - 5, y: y - 5 };
			};
			
			var getHuePositionFromHSB = function(hsb) {
				var y = 150 - (hsb.h / 2.4);
				if( y < 0 ) h = 0;
				if( y > 150 ) h = 150;				
				return { y: y - 1 };
			};

			var colors =
			{
			    'aliceblue': 'F0F8FF', 'antiquewhite': 'FAEBD7', 'aqua': '00FFFF',
			    'aquamarine': '7FFFD4', 'azure': 'F0FFFF', 'beige': 'F5F5DC',
			    'bisque': 'FFE4C4', 'black': '000000', 'blanchedalmond': 'FFEBCD',
			    'blue': '0000FF', 'blueviolet': '8A2BE2', 'brown': 'A52A2A',
			    'burlywood': 'DEB887', 'cadetblue': '5F9EA0', 'chartreuse': '7FFF00',
			    'chocolate': 'D2691E', 'coral': 'FF7F50', 'cornflowerblue': '6495ED',
			    'cornsilk': 'FFF8DC', 'crimson': 'DC143C', 'cyan': '00FFFF',
			    'darkblue': '00008B', 'darkcyan': '008B8B', 'darkgoldenrod': 'B8860B',
			    'darkgray': 'A9A9A9', 'darkgrey': 'A9A9A9', 'darkgreen': '006400',
			    'darkkhaki': 'BDB76B', 'darkmagenta': '8B008B', 'darkolivegreen': '556B2F',
			    'darkorange': 'FF8C00', 'darkorchid': '9932CC', 'darkred': '8B0000',
			    'darksalmon': 'E9967A', 'darkseagreen': '8FBC8F', 'darkslateblue': '483D8B',
			    'darkslategray': '2F4F4F', 'darkslategrey': '2F4F4F', 'darkturquoise': '00CED1',
			    'darkviolet': '9400D3', 'deeppink': 'FF1493', 'deepskyblue': '00BFFF',
			    'dimgray': '696969', 'dimgrey': '696969', 'dodgerblue': '1E90FF',
			    'firebrick': 'B22222', 'floralwhite': 'FFFAF0', 'forestgreen': '228B22',
			    'fuchsia': 'FF00FF', 'gainsboro': 'DCDCDC', 'ghostwhite': 'F8F8FF',
			    'gold': 'FFD700', 'goldenrod': 'DAA520', 'gray': '808080',
			    'grey': '808080', 'green': '008000', 'greenyellow': 'ADFF2F',
			    'honeydew': 'F0FFF0', 'hotpink': 'FF69B4', 'indianred': 'CD5C5C',
			    'indigo': '4B0082', 'ivory': 'FFFFF0', 'khaki': 'F0E68C',
			    'lavender': 'E6E6FA', 'lavenderblush': 'FFF0F5', 'lawngreen': '7CFC00',
			    'lemonchiffon': 'FFFACD', 'lightblue': 'ADD8E6', 'lightcoral': 'F08080',
			    'lightcyan': 'E0FFFF', 'lightgoldenrodyellow': 'FAFAD2', 'lightgray': 'D3D3D3',
			    'lightgrey': 'D3D3D3', 'lightgreen': '90EE90', 'lightpink': 'FFB6C1',
			    'lightsalmon': 'FFA07A', 'lightseagreen': '20B2AA', 'lightskyblue': '87CEFA',
			    'lightslategray': '778899', 'lightslategrey': '778899', 'lightsteelblue': 'B0C4DE',
			    'lightyellow': 'FFFFE0', 'lime': '00FF00', 'limegreen': '32CD32',
			    'linen': 'FAF0E6', 'magenta': 'FF00FF', 'maroon': '800000',
			    'mediumaquamarine': '66CDAA', 'mediumblue': '0000CD', 'mediumorchid': 'BA55D3',
			    'mediumpurple': '9370D8', 'mediumseagreen': '3CB371', 'mediumslateblue': '7B68EE',
			    'mediumspringgreen': '00FA9A', 'mediumturquoise': '48D1CC', 'mediumvioletred': 'C71585',
			    'midnightblue': '191970', 'mintcream': 'F5FFFA', 'mistyrose': 'FFE4E1',
			    'moccasin': 'FFE4B5', 'navajowhite': 'FFDEAD', 'navy': '000080',
			    'oldlace': 'FDF5E6', 'olive': '808000', 'olivedrab': '6B8E23',
			    'orange': 'FFA500', 'orangered': 'FF4500', 'orchid': 'DA70D6',
			    'palegoldenrod': 'EEE8AA', 'palegreen': '98FB98', 'paleturquoise': 'AFEEEE',
			    'palevioletred': 'D87093', 'papayawhip': 'FFEFD5', 'peachpuff': 'FFDAB9',
			    'peru': 'CD853F', 'pink': 'FFC0CB', 'plum': 'DDA0DD',
			    'powderblue': 'B0E0E6', 'purple': '800080', 'red': 'FF0000',
				'rosybrown': 'BC8F8F', 'royalblue': '4169E1', 'saddlebrown': '8B4513',
			    'salmon': 'FA8072', 'sandybrown': 'F4A460', 'seagreen': '2E8B57',
			    'seashell': 'FFF5EE', 'sienna': 'A0522D', 'silver': 'C0C0C0',
			    'skyblue': '87CEEB', 'slateblue': '6A5ACD', 'slategray': '708090',
			    'slategrey': '708090', 'snow': 'FFFAFA', 'springgreen': '00FF7F',
			    'steelblue': '4682B4', 'tan': 'D2B48C', 'teal': '008080',
			    'thistle': 'D8BFD8', 'tomato': 'FF6347', 'turquoise': '40E0D0',
			    'violet': 'EE82EE', 'wheat': 'F5DEB3', 'white': 'FFFFFF',
			    'whitesmoke': 'F5F5F5', 'yellow': 'FFFF00', 'yellowgreen': '9ACD32'
			};
			var convertNameToHex = function(color) {
				return colors[color.toLowerCase()] || color;
			};

			var cleanHex = function(hex) {
				hex = convertNameToHex(hex);
				return hex.replace(/[^A-F0-9]/ig, '');
			};
			
			var expandHex = function(hex) {
				hex = cleanHex(hex);
				if( !hex ) return null;
				if( hex.length === 3 ) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
				return hex.length === 6 ? hex : null;
			};			
			
			var hsb2rgb = function(hsb) {
				var rgb = {};
				var h = Math.round(hsb.h);
				var s = Math.round(hsb.s*255/100);
				var v = Math.round(hsb.b*255/100);
				if(s === 0) {
					rgb.r = rgb.g = rgb.b = v;
				} else {
					var t1 = v;
					var t2 = (255 - s) * v / 255;
					var t3 = (t1 - t2) * (h % 60) / 60;
					if( h === 360 ) h = 0;
					if( h < 60 ) { rgb.r = t1; rgb.b = t2; rgb.g = t2 + t3; }
					else if( h < 120 ) {rgb.g = t1; rgb.b = t2; rgb.r = t1 - t3; }
					else if( h < 180 ) {rgb.g = t1; rgb.r = t2; rgb.b = t2 + t3; }
					else if( h < 240 ) {rgb.b = t1; rgb.r = t2; rgb.g = t1 - t3; }
					else if( h < 300 ) {rgb.b = t1; rgb.g = t2; rgb.r = t2 + t3; }
					else if( h < 360 ) {rgb.r = t1; rgb.g = t2; rgb.b = t1 - t3; }
					else { rgb.r = 0; rgb.g = 0; rgb.b = 0; }
				}
				return {
					r: Math.round(rgb.r),
					g: Math.round(rgb.g),
					b: Math.round(rgb.b)
				};
			};
			
			var rgb2hex = function(rgb) {
				var hex = [
					rgb.r.toString(16),
					rgb.g.toString(16),
					rgb.b.toString(16)
				];
				$.each(hex, function(nr, val) {
					if (val.length === 1) hex[nr] = '0' + val;
				});
				return hex.join('');
			};
			
			var hex2rgb = function(hex) {
				hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);
				
				return {
					r: hex >> 16,
					g: (hex & 0x00FF00) >> 8,
					b: (hex & 0x0000FF)
				};
			};
			
			var rgb2hsb = function(rgb) {
				var hsb = { h: 0, s: 0, b: 0 };
				var min = Math.min(rgb.r, rgb.g, rgb.b);
				var max = Math.max(rgb.r, rgb.g, rgb.b);
				var delta = max - min;
				hsb.b = max;
				hsb.s = max !== 0 ? 255 * delta / max : 0;
				if( hsb.s !== 0 ) {
					if( rgb.r === max ) {
						hsb.h = (rgb.g - rgb.b) / delta;
					} else if( rgb.g === max ) {
						hsb.h = 2 + (rgb.b - rgb.r) / delta;
					} else {
						hsb.h = 4 + (rgb.r - rgb.g) / delta;
					}
				} else {
					hsb.h = -1;
				}
				hsb.h *= 60;
				if( hsb.h < 0 ) {
					hsb.h += 360;
				}
				hsb.s *= 100/255;
				hsb.b *= 100/255;
				return hsb;
			};			
			
			var hex2hsb = function(hex) {
				var hsb = rgb2hsb(hex2rgb(hex));
				// Zero out hue marker for black, white, and grays (saturation === 0)
				if( hsb.s === 0 ) hsb.h = 360;
				return hsb;
			};
			
			var hsb2hex = function(hsb) {
				return rgb2hex(hsb2rgb(hsb));
			};

			
			// Handle calls to $([selector]).miniColors()
			switch(o) {
			
				case 'readonly':
					
					$(this).each( function() {
						if( !$(this).hasClass('miniColors') ) return;
						$(this).prop('readonly', data);
					});
					
					return $(this);
				
				case 'disabled':
					
					$(this).each( function() {
						if( !$(this).hasClass('miniColors') ) return;
						if( data ) {
							disable($(this));
						} else {
							enable($(this));
						}
					});
										
					return $(this);
			
				case 'value':
					
					// Getter
					if( data === undefined ) {
						if( !$(this).hasClass('miniColors') ) return;
						var input = $(this),
							hex = expandHex(input.val());
						return hex ? '#' + convertCase(hex, input.data('letterCase')) : null;
					}
					
					// Setter
					$(this).each( function() {
						if( !$(this).hasClass('miniColors') ) return;
						$(this).val(data);
						setColorFromInput($(this));
					});
					
					return $(this);
					
				case 'destroy':
					
					$(this).each( function() {
						if( !$(this).hasClass('miniColors') ) return;
						destroy($(this));
					});
										
					return $(this);
				
				default:
					
					if( !o ) o = {};
					
					$(this).each( function() {
						
						// Must be called on an input element
						if( $(this)[0].tagName.toLowerCase() !== 'input' ) return;
						
						// If a trigger is present, the control was already created
						if( $(this).data('trigger') ) return;
						
						// Create the control
						create($(this), o, data);
						
					});
					
					return $(this);
					
			}
			
		}
			
	});
	
})(jQuery);