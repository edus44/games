
if ( !window.requestAnimationFrame ) {

	window.requestAnimationFrame = ( function() {

		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( callback, element ) {

			window.setTimeout( callback, 1000 / 60 );

		};

	} )();

}

function Progress($video,$progress){
	var self = this;
	this.width = $progress.width();


	$video.bind('progress', function() {
		var buffered = $video[0].buffered.end(0) / $video[0].duration;
		$('#progress_buffered').width(buffered*self.width);
	});

	$video.bind('timeupdate', function(e) {
		var elapsed = $video[0].currentTime / $video[0].duration;
		$('#progress_elapsed').width(elapsed*self.width);
	});

	$progress.click(function(e){
		var x = (e.pageX-$(this).offset().left) / self.width;
		$video[0].currentTime = x*$video[0].duration;
	});

}

function Glass(){
	var self = this;
	this.size = 120;
	this.frameWidth = 530;
	this.frameHeight = 313;
	this.destX = this.frameWidth/2-this.size/2;
	this.destY = this.frameHeight/2-this.size/2;

	this.$canvas = $('#canvas');
	this.$video = $('#video');

	this.$canvas[0].width = this.frameWidth;
	this.$canvas[0].height = this.frameHeight;
	this.ctx = this.$canvas[0].getContext('2d');

	//Estilo del borde
	//this.ctx.lineWidth=10;
	//this.ctx.strokeStyle = 'rgba(41, 159, 213,.5)';
	//this.ctx.shadowBlur = 10;
	//this.ctx.shadowColor = "rgba(0, 0, 0, 1)";

	this.reverse = true;


	this.start();

}

Glass.prototype = {
	destX : 0,
	destY : 0,
	curX : 0,
	curY : 0,
	smooth : 3,
	count : 0,

	start : function(){
		var self = this;

		this.$canvas.mousemove(function(e){
			var offset = $(this).offset();
			var destX = e.pageX-offset.left;
			var destY = e.pageY-offset.top;

			self.destX = destX;
			self.destY = destY;

			self.count = ++self.count%360;

		});

		new Progress(this.$video,$('#progress'));

		this.$video[0].play();
		//this.$video[0].muted = 1;
		this.loop();
	},

	loop : function(){
		var self = this;
		window.requestAnimationFrame(function(){
			self.anim();
			self.loop();
		});
	},
	anim : function(){

		this.curX += (this.destX-this.curX) / this.smooth;
		this.curY += (this.destY-this.curY) / this.smooth;

		//Dibuja el video de fondo
		this.ctx.drawImage(this.$video[0],0, !this.reverse ? -this.frameHeight : 0);

		//Dibuja el circulo con el video superpuesto
		this.ctx.save();

		/**
		var dX = this.frameWidth/2 - this.curX;
		var dY = this.frameHeight/2 - this.curY;
		var dist = Math.sqrt( Math.pow(dX,2) + Math.pow(dY,2))
		var m = (dist/this.frameWidth*2);
		var r = 70+((1-m)*70)>>0;
		(function (ctx, x, y, r, p, m, t){
			ctx.beginPath();
			ctx.translate(x, y);
			ctx.moveTo(0,0-r);
			for (var i = 0; i < p; i++){
				ctx.rotate((Math.PI / p));
				ctx.lineTo(0, 0 - (r*m));
				ctx.rotate((Math.PI / p));
				ctx.lineTo(0, 0 - r);
			}
			ctx.stroke();
		})(this.ctx, this.curX, this.curY, r, 5, 0.5, (this.count*Math.PI)/180);
		this.ctx.clip();
		this.ctx.drawImage(this.$video[0], -this.curX,-this.curY);
		/**/


		/**
		this.ctx.beginPath();
		this.ctx.arc(this.curX, this.curY, this.size, 0, Math.PI * 2, true);
		this.ctx.closePath();
		//this.ctx.stroke();
		this.ctx.clip();
		this.ctx.drawImage(this.$video[0], 0, this.reverse ? -this.frameHeight : 0);
		/**/


		/**/
		this.ctx.beginPath();
		var center = this.curX;
		var rel = this.curX/this.frameWidth;
		var size = 600*(this.curY/this.frameHeight)+200;
		size = 150;
		center -= size * (0.5-rel)*3;
		this.ctx.moveTo(center-0,0);
		this.ctx.lineTo(center-size,this.frameHeight);
		this.ctx.lineTo(center+0,this.frameHeight);
		this.ctx.lineTo(center+size,0);
		this.ctx.closePath();
		this.ctx.stroke();
		this.ctx.clip();
		this.ctx.drawImage(this.$video[0], 0,this.reverse ? -this.frameHeight : 0);
		/**/


		/**
		this.ctx.beginPath();
		this.ctx.arc(this.curX-50, this.curY, this.size-40, 0, Math.PI * 2, true);
		this.ctx.arc(this.curX+50, this.curY, this.size-40, 0, Math.PI * 2, true);
		this.ctx.closePath();
		this.ctx.stroke();
		this.ctx.clip();
		this.ctx.drawImage(this.$video[0], 0,this.reverse ? -this.frameHeight : 0);
		/**/

		this.ctx.restore();

	}
}

$(function(){
	window.glass = new Glass();
});