var trials = ['palabras','personajes','iniciales','peliculas','fechas'];

var card_ids = Object.keys(cards);
shuffle(card_ids);

var current = -1;

function loadCard(id){
	if (cards[id]==undefined) return false;
	var card = cards[id];
	for(i in trials){
		var k = i*2
		var v = k+1;
		var html = '<div class="key">'+card[k]+'</div><div class="val">'+card[v]+'</div>';
		$('#card .'+trials[i]+' .info').html(html);	
		$('#card_id').text(id);
	}
}

function loadNext(animate){
	current = (current+1) % card_ids.length;
	if (animate){
		$('#card').stop().animate({opacity:0,marginLeft:'-50px'},500,function(){
			loadCard(card_ids[current]);
			$(this).css({marginLeft:'50px'}).animate({opacity:1,marginLeft:0},500);
		});
	}else{
		loadCard(card_ids[current]);
	}
}

function resize(){
	var height = $(window).height()-42;
	$('#manual,#card').height(height);	
}

$(function(){
	
	//Saltar portada
	$('#start').tap(function(){
		loadNext();
		$('#portada:not(:animated)').animate({opacity:0},500,function(){
			$(this).addClass('hide');
		});
	});
	
	//Mostrar value
	$('#card tr').tap(function(){
		$(this).toggleClass('view');
		$('#card .view').not(this).removeClass('view');
	});
	
	//Cambiar tarjeta
	$('#refresh').tap(function(){
		if (confirm('¿Cambiar de tarjeta?')){
			loadNext(true);	
		};
	});
	
	//Ayuda
	$('#help').tap(function(){
		$('#manual,#card').toggleClass('hide');
		$(this).toggleClass('active');
	});
	
	//Resize
	$(window).bind('resize',resize);
	resize();
});


/**
 * Eduardo Hidalgo Holgado
 * hhweb.es
 * 07 2012
 */

//Bindea click o touch segun corresponda
jQuery.event.special.tap={setup:function(data,namespaces){var $elem=jQuery(this);if('ontouchstart'in document){$elem.bind('touchstart',jQuery.event.special.tap.onTouchStart);$elem.bind('touchmove',jQuery.event.special.tap.onTouchMove);$elem.bind('touchend',jQuery.event.special.tap.onTouchEnd);}else{$elem.bind('click',jQuery.event.special.tap.click);}},click:function(event){event.type="tap";jQuery.event.handle.apply(this,arguments);},teardown:function(namespaces){var $elem=jQuery(this);if('ontouchstart'in document){$elem.unbind('touchstart',jQuery.event.special.tap.onTouchStart);$elem.unbind('touchmove',jQuery.event.special.tap.onTouchMove);$elem.unbind('touchend',jQuery.event.special.tap.onTouchEnd);}else{$elem.unbind('click',jQuery.event.special.tap.click);}},onTouchStart:function(e){this.moved=false;},onTouchMove:function(e){this.moved=true;},onTouchEnd:function(event){if(!this.moved){event.type="tap";jQuery.event.handle.apply(this,arguments)}}};jQuery.fn['tap']=function(data,fn){if(fn==null){fn=data;data=null;}
return arguments.length>0?this.on('tap',null,data,fn):this.trigger('tap');};

Object.keys = Object.keys || function(o) {  
    var result = [];  
    for(var name in o) {  
        if (o.hasOwnProperty(name))  
          result.push(name);  
    }  
    return result;  
};

function shuffle(sourceArray) {
    for (var n = 0; n < sourceArray.length - 1; n++) {
        var k = n + Math.floor(Math.random() * (sourceArray.length - n));

        var temp = sourceArray[k];
        sourceArray[k] = sourceArray[n];
        sourceArray[n] = temp;
    }
}