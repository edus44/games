function refreshInputs(){
	$('input[id!=dots]').each(function(){
		$(this).val( window[this.id] );
	});
}

$(function(){
	adder.init();
	$('#dots').val(16);

	refreshInputs();

	$('span[class!=dots]').click(function(){
		var par = $(this).attr('class');
		var mod = parseFloat($(this).attr('title'));
		window[par] += mod;

		if (MASS<1) MASS=1;
		if (DELTAT<0) DELTAT=0;

		refreshInputs();
	});

	$('.dots').click(function(){
		var val = parseInt($('#dots').val());
		if ($(this).attr('title')=='up'){
			adder.createDot();
			$('#dots').val( val+1 );
		}else{
			if (val<=3) return false;
			adder.removeDot();
			$('#dots').val( val-1 );
		}
	});
	
});

var adder = {
	init : function(){
		var w = window;

		//Config
		w.DELTAT = .009;	
		w.SEGLEN = 20;		
		w.SPRINGK = 11;		
		w.MASS = 1;  			
		w.GRAVITY = 0;
		w.RESISTANCE = 11;
		w.DOTSIZE = 20;
		w.BOUNCE = 0.1;
		w.dotNumber = 16;
		
		//Vars
		w.Ypos = 0;
		w.Xpos = 0;
		w.dots = new Array();
		w.nDots = 0;
		w.time = 0;
		w.showTime = 0;
		var i = 0;

		//Creacion de los dot nodes
		for (i = 0; i < dotNumber+1; i++) adder.createDot();
	
		//Mousemove event
		$(document).mousemove(function(e){
			Xpos = e.pageX + document.body.scrollLeft-8;
			Ypos = e.pageY + document.body.scrollTop-8;
		});
			
		//Intervalo
		w.interval = setInterval(adder.animate,10);
	},
	createDot : function(){
			var i = nDots;
			dots[i] = { X : Xpos, Y : Ypos, dx : 0, dy : 0, started : false, $ : $('<div>',{'class':'dot'}).appendTo('body') ,style:{} }
			dots[i].style = dots[i].$[0].style;
			dots[i].style.left = dots[i].X;
			dots[i].style.top = dots[i].Y;
			dots[i].$.css('opacity',0);
			nDots++;
	},
	removeDot : function(i){
			$('.dot').eq(-1).remove();
			nDots--;
	},
	animate : function(){
		adder.refreshDot();
		for (i = 1 ; i < nDots; i++ ) {
			var j = i-1;
			var k = i+1;
			if (k>dots.length-1) k = dots.length-1;
			var angle = (180/Math.PI)*(Math.atan( (dots[j].Y-dots[k].Y) / (dots[j].X-dots[k].X) ) + (Math.PI/2));
			if (!dots[i].started && dots[i].X!=0 && dots[i].Y!=0 ) { dots[i].$.animate({opacity:1},100); dots[i].started = true; }
			dots[i].style.left = dots[i].X+'px';			
			dots[i].style.top =  dots[i].Y+'px';
			dots[i].style.MozTransform = 'rotate('+angle+'deg)';
			dots[i].style.webkitTransform = 'rotate('+angle+'deg)';
			dots[i].style.OTransform = 'rotate('+angle+'deg)';
		}

		var date = new Date();
		var oldTime = time;
		time = date.getTime();
		if ((time-showTime)>100){
			var fps = parseInt(1000/(time-oldTime));
			document.getElementById('fps').innerHTML = parseInt((fps+parseInt(document.getElementById('fps').innerHTML))/2)+' fps';
			showTime = time;
		}		
	},
	destroy : function(){
		clearInterval(interval);
		$('.dot').remove();
	},
	refreshDot : function(){	
		var height = document.body.clientHeight + document.body.scrollTop;
		var width  = document.body.clientWidth + document.body.scrollLeft;

		dots[0].X = Xpos;
		dots[0].Y = Ypos;
	 
		for (i = 1 ; i < nDots; i++ ) {
			
			//Elasticidad
			var spring = new adder.vec(0, 0);
			if (i > 0)
				adder.springForce(i-1, i, spring);
			if (i < (nDots - 1)) 
				adder.springForce(i+1, i, spring);
			
			//Resistencia
			var resist = new adder.vec(-dots[i].dx * RESISTANCE, -dots[i].dy * RESISTANCE);
			
			//Velocidad y gravedad
			var accel = new adder.vec((spring.X + resist.X)/ MASS, (spring.Y + resist.Y)/ MASS + GRAVITY);
			
			//Velocidad
			dots[i].dx += (DELTAT * accel.X);
			dots[i].dy += (DELTAT * accel.Y);
			
			//Nueva posicion
			dots[i].X += dots[i].dx;
			dots[i].Y += dots[i].dy;
			
			//Bounce
			if (dots[i].Y >=  height - 37 - 1) {
				if (dots[i].dy > 0) {
					dots[i].dy = BOUNCE * -dots[i].dy;
				}
				dots[i].Y = height - 37 - 1;
			}
			if (dots[i].Y <0) {
				if (dots[i].dy < 0) {
					dots[i].dy = BOUNCE * -dots[i].dx;
				}
				dots[i].Y = 0;
			}
			if (dots[i].X >= width - DOTSIZE) {
				if (dots[i].dx > 0) {
					dots[i].dx = BOUNCE * -dots[i].dx;
				}
				dots[i].X = width - DOTSIZE - 1;
			}
			if (dots[i].X < 0) {
				if (dots[i].dx < 0) {
					dots[i].dx = BOUNCE * -dots[i].dx;
				}
				dots[i].X = 0;
			}		
    	}
	},
	vec : function (X, Y){
		this.X = X;
		this.Y = Y;
	},
	springForce : function(i, j, spring){
		var dx = (dots[i].X - dots[j].X);
		var dy = (dots[i].Y - dots[j].Y);
		var len = Math.sqrt(dx*dx + dy*dy);
		if (len > SEGLEN) {
			var springF = SPRINGK * (len - SEGLEN);
			spring.X += (dx / len) * springF;
			spring.Y += (dy / len) * springF;
		}
	}
}

