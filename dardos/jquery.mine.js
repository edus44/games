/********** 1.5 ******/

(function(jQuery){

//Propiedades de animate class change
var _prop = '';
_prop += 'width height opacity color backgroundColor outlineColor display backgroundPosition ';
_prop += 'borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth borderTopColor borderTopWidth borderRightColor borderRightWidth ';
_prop += 'fontSize fontWeight letterSpacing lineHeight ';
_prop += 'margin marginLeft marginRight marginTop marginBottom padding paddingLeft paddingRight paddingTop paddingBottom top left bottom right';
_prop  = _prop.split(' ');

jQuery.fn.extend({

//Mostrar y ocultar, con opacity
	mostrar :	function( opac ){
		if (opac) this.css({opacity:1});
		return this.css({display:'block'});
	},

	ocultar :	function( opac ){
		if (opac) this.css({opacity:0});
		return this.css({display:'none'});
	},

//Igual fadeIn pero con Stop
	fadIn : 	function( speed, easing, callback ){ 
		speed = speed || 250 ;
		callback = jQuery.isFunction(easing)? easing: callback || function(){};
		easing = typeof(easing)=='string'? easing : 'swing';
	
		return this.css({display:'block'}).stop().animate({opacity:1} , speed , easing , callback ); 
	},

	fadOut : 	function( speed, easing, callback ){ 
		speed = speed || 250 ;
		callback = jQuery.isFunction(easing)? easing: callback || function(){};
		easing = typeof(easing)=='string'? easing : 'swing';
	
		return this.stop().animate({opacity:0},speed, easing , function(){ $(this).css({display:'none'}); callback(); }); 
	},

	fadTo : 	function( to, speed, easing, callback ){ 
		speed = speed || 250 ;
		callback = jQuery.isFunction(easing)? easing: callback || function(){};
		easing = typeof(easing)=='string'? easing : 'swing';
	
		return this.stop().animate({opacity:to},speed, easing , callback); 
	},

//Fades con desplazamiento: $().fadeInFx({lon:18,dir:'bottom'},300,function(){}); $().fadeInFx({},300); $().fadeInFx({},0,'ease'); $().fadeInFx();
	fadOutFx : 	function( prop, speed, easing, callback ) {
		var dir = prop? prop.dir || 'top' : 'top';
		var lon = prop? prop.lon ||  10 : 10;
		if (!prop.Left) prop.Left=0;
		if (!prop.Top) prop.Top=0;
		speed = typeof prop == 'number'? prop : speed || 250;
		callback = jQuery.isFunction(easing)? easing: callback || function(){};
		easing = typeof(easing)=='string'? easing : 'swing';
	
		var left = dir=='left' ? -lon : dir=='right'  ? lon : 0 ,
			top  = dir=='top'  ? -lon : dir=='bottom' ? lon : 0 ;
	
		return this.stop().animate({opacity:0,'marginTop' : prop.Top+top+'px','marginLeft': prop.Left+left+'px'},speed,function(){
			$(this).css({display:'none'}); callback();
		});			
	},

	fadInFx : 	function( prop, speed, easing, callback ) {
		var dir = prop? prop.dir || 'top' : 'top';
		var lon = prop? prop.lon ||  10 : 10;
		if (!prop.Left) prop.Left=0;
		if (!prop.Top) prop.Top=0;
		speed = typeof prop == 'number'? prop : speed || 250;
		callback = jQuery.isFunction(easing)? easing: callback || function(){};
		easing = typeof(easing)=='string'? easing : 'swing';
		
		var left = dir=='left' ? -lon : dir=='right'  ? lon : 0 ,
			top  = dir=='top'  ? -lon : dir=='bottom' ? lon : 0 ;
		
		return this.css({opacity: 0, display : 'block','marginTop' : prop.Top+top+'px','marginLeft': prop.Left+left+'px'})
		.stop().animate({opacity:1,'marginTop' : prop.Top,'marginLeft': prop.Left},speed,easing,callback);
	},

//Hace mas accesible los forms
	formEasy :	function( def , reset){
		if (reset) $(this).val(def);
		return this.focus(function(){
			if ($(this).val()==def) $(this).val('').addClass('valid');
		}).blur(function(){
			if ($(this).val().length<1) $(this).val(def).removeClass('valid');
		}).keydown(function(){
			$(this).removeClass('error');
		});
	},

//Animating Class change
	animateClass : function(type,nclass,speed,easing,callback){
		var _this = this[0],before={},after={},newprops={},style = this.attr('style');
		speed = speed || 250 ;
		callback = jQuery.isFunction(easing)? easing: callback || $.noop;
		easing = typeof(easing)=='string'? easing : 'swing';

		//Capturo css actual
		for(i in _prop) before[_prop[i]] = $.curCSS(_this,_prop[i]);

		//Borro inline css y cambio class
		this.removeAttr('style');
		switch(type){
			case 'toggleClassFx' : this.toggleClass(nclass);break;	
			case 'addClassFx' : this.addClass(nclass);break;	
			case 'removeClassFx' : this.removeClass(nclass);break;	
		}

		//Capturo css futuro
		for(i in _prop) after[_prop[i]] = $.curCSS(_this,_prop[i]);

		//Vuelvo a cambio class y su css inline
		this.attr('style',style || 'none');
		switch(type){
			case 'toggleClassFx' : this.toggleClass(nclass);break;	
			case 'addClassFx' : this.removeClass(nclass);break;	
			case 'removeClassFx' : this.addClass(nclass);break;	
		}

		//Display:none = opacity:0;	
		if (before.display=='none'){ before.opacity='0'; this.css({opacity:0,display:after.display}); }
		if (after.display=='none'){ after.opacity='0';}
		delete before.display; delete after.display;

		//Me quedo solo con las propiedades que cambian
		for(i in _prop) if (before[_prop[i]]!=after[_prop[i]]) newprops[_prop[i]] = after[_prop[i]];

		c.log(before,after,newprops,this);

		//Hago la animacion
		return this.animate(newprops,speed,easing,function(e){
			//Hago el cambio de clase
			$(this).removeAttr('style');
			switch(type){
				case 'toggleClassFx' : $(this).toggleClass(nclass);break;	
				case 'addClassFx' : $(this).addClass(nclass);break;	
				case 'removeClassFx' : $(this).removeClass(nclass);break;	
			}
			callback(e);
		});
		
	},
	toggleClassFx : function(nclass,speed,easing,callback){	
		return this.animateClass('toggleClassFx',nclass,speed,easing,callback);
	},
	addClassFx : function(nclass,speed,easing,callback){	
		return this.animateClass('addClassFx',nclass,speed,easing,callback);
	},
	removeClassFx : function(nclass,speed,easing,callback){	
		return this.animateClass('removeClassFx',nclass,speed,easing,callback);
	}
});

/**
 * @author Alexander Farkas
 * v. 1.21
 */
	if(!document.defaultView || !document.defaultView.getComputedStyle){ // IE6-IE8
		var oldCurCSS = jQuery.curCSS;
		jQuery.curCSS = function(elem, name, force){
			if(name === 'background-position'){
				name = 'backgroundPosition';
			}
			if(name !== 'backgroundPosition' || !elem.currentStyle || elem.currentStyle[ name ]){
				return oldCurCSS.apply(this, arguments);
			}
			var style = elem.style;
			if ( !force && style && style[ name ] ){
				return style[ name ];
			}
			return oldCurCSS(elem, 'backgroundPositionX', force) +' '+ oldCurCSS(elem, 'backgroundPositionY', force);
		};
	}
	
	var oldAnim = $.fn.animate;
	$.fn.animate = function(prop){
		if('background-position' in prop){
			prop.backgroundPosition = prop['background-position'];
			delete prop['background-position'];
		}
		if('backgroundPosition' in prop){
			prop.backgroundPosition = '('+ prop.backgroundPosition;
		}
		return oldAnim.apply(this, arguments);
	};
	
	function toArray(strg){
		strg = strg.replace(/left|top/g,'0px');
		strg = strg.replace(/right|bottom/g,'100%');
		strg = strg.replace(/([0-9\.]+)(\s|\)|$)/g,"$1px$2");
		var res = strg.match(/(-?[0-9\.]+)(px|\%|em|pt)\s(-?[0-9\.]+)(px|\%|em|pt)/);
		return [parseFloat(res[1],10),res[2],parseFloat(res[3],10),res[4]];
	}
	
	$.fx.step. backgroundPosition = function(fx) {
		if (!fx.bgPosReady) {
			var start = $.curCSS(fx.elem,'backgroundPosition');
			
			if(!start){//FF2 no inline-style fallback
				start = '0px 0px';
			}
			
			start = toArray(start);
			
			fx.start = [start[0],start[2]];
			
			var end = toArray(fx.options.curAnim.backgroundPosition);
			fx.end = [end[0],end[2]];
			
			fx.unit = [end[1],end[3]];
			fx.bgPosReady = true;
		}
		//return;
		var nowPosX = [];
		nowPosX[0] = ((fx.end[0] - fx.start[0]) * fx.pos) + fx.start[0] + fx.unit[0];
		nowPosX[1] = ((fx.end[1] - fx.start[1]) * fx.pos) + fx.start[1] + fx.unit[1];           
		fx.elem.style.backgroundPosition = nowPosX[0]+' '+nowPosX[1];

	};

/*
 * jQuery Color Animations
 * Copyright 2007 John Resig
 * Released under the MIT and GPL licenses.
 */


// We override the animation for all of these color styles
jQuery.each(['backgroundColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor', 'color', 'outlineColor'], function(i,attr){
	jQuery.fx.step[attr] = function(fx){
		if ( fx.state == 0 ) {
			fx.start = getColor( fx.elem, attr );
			fx.end = getRGB( fx.end );
		}
		fx.elem.style[attr] = "rgb(" + [
			Math.max(Math.min( parseInt((fx.pos * (fx.end[0] - fx.start[0])) + fx.start[0]), 255), 0),
			Math.max(Math.min( parseInt((fx.pos * (fx.end[1] - fx.start[1])) + fx.start[1]), 255), 0),
			Math.max(Math.min( parseInt((fx.pos * (fx.end[2] - fx.start[2])) + fx.start[2]), 255), 0)
		].join(",") + ")";
	}
});

// Color Conversion functions from highlightFade
// By Blair Mitchelmore
// http://jquery.offput.ca/highlightFade/

// Parse strings looking for color tuples [255,255,255]
function getRGB(color) {
	var result;

	// Check if we're already dealing with an array of colors
	if ( color && color.constructor == Array && color.length == 3 )
		return color;

	// Look for rgb(num,num,num)
	if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))
		return [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])];

	// Look for rgb(num%,num%,num%)
	if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))
		return [parseFloat(result[1])*2.55, parseFloat(result[2])*2.55, parseFloat(result[3])*2.55];

	// Look for #a0b1c2
	if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))
		return [parseInt(result[1],16), parseInt(result[2],16), parseInt(result[3],16)];

	// Look for #fff
	if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))
		return [parseInt(result[1]+result[1],16), parseInt(result[2]+result[2],16), parseInt(result[3]+result[3],16)];

	// Otherwise, we're most likely dealing with a named color
	return colors[jQuery.trim(color).toLowerCase()];
}

function getColor(elem, attr) {
	var color;

	do {
		color = jQuery.curCSS(elem, attr);

		// Keep going until we find an element that has color, or we hit the body
		if ( color != '' && color != 'transparent' || jQuery.nodeName(elem, "body") )
			break; 

		attr = "backgroundColor";
	} while ( elem = elem.parentNode );

	return getRGB(color);
};

// Some named colors to work with
// From Interface by Stefan Petre
// http://interface.eyecon.ro/

var colors = {
	aqua:[0,255,255],
	azure:[240,255,255],
	beige:[245,245,220],
	black:[0,0,0],
	blue:[0,0,255],
	brown:[165,42,42],
	cyan:[0,255,255],
	darkblue:[0,0,139],
	darkcyan:[0,139,139],
	darkgrey:[169,169,169],
	darkgreen:[0,100,0],
	darkkhaki:[189,183,107],
	darkmagenta:[139,0,139],
	darkolivegreen:[85,107,47],
	darkorange:[255,140,0],
	darkorchid:[153,50,204],
	darkred:[139,0,0],
	darksalmon:[233,150,122],
	darkviolet:[148,0,211],
	fuchsia:[255,0,255],
	gold:[255,215,0],
	green:[0,128,0],
	indigo:[75,0,130],
	khaki:[240,230,140],
	lightblue:[173,216,230],
	lightcyan:[224,255,255],
	lightgreen:[144,238,144],
	lightgrey:[211,211,211],
	lightpink:[255,182,193],
	lightyellow:[255,255,224],
	lime:[0,255,0],
	magenta:[255,0,255],
	maroon:[128,0,0],
	navy:[0,0,128],
	olive:[128,128,0],
	orange:[255,165,0],
	pink:[255,192,203],
	purple:[128,0,128],
	violet:[128,0,128],
	red:[255,0,0],
	silver:[192,192,192],
	white:[255,255,255],
	yellow:[255,255,0]
};


/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * 
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
	def: 'easeInOutQuad',
	swing: function (x, t, b, c, d) {
		//alert(jQuery.easing.default);
		return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * 
 */

})($);