

function Glass(){
	var self = this;
	this.size = 200;
	this.frameWidth = 640;
	this.frameHeight = 360;
	this.destX = this.frameWidth/2-this.size/2;
	this.destY = this.frameHeight/2-this.size/2;
	
	this.$hover = $('#hover');
	this.$back = $('#back');
	this.$hoverbox = $('#hoverbox');
	
	
	
	$('#play').click(function(){
		$(this).animate({opacity:0},1000,function(){
			$(this).remove();
		});
		self.start();
		self.$hoverbox.removeClass('hide').css({opacity:0}).animate({opacity:1},500);
	});
		
}

Glass.prototype = {
	destX : 0,
	destY : 0,
	curX : 0,
	curY : 0,
	smooth : 4,
	
	start : function(){
		var self = this;
		
		$('#catchbox').mousemove(function(e){
			var offset = $(this).offset();
			var destX = e.pageX-offset.left-self.size/2;
			var destY = e.pageY-offset.top-self.size/2;
			
			if (destX>self.frameWidth-self.size) destX = self.frameWidth-self.size;
			if (destY>self.frameHeight-self.size) destY = self.frameHeight-self.size;
			if (destX<0) destX = 0;
			if (destY<0) destY = 0;
			
			self.destX = destX;
			self.destY = destY;
		});
		
		this.loop();
		this.play();
	},
	
	play : function(){
		
		this.$hover[0].play();
		this.$back[0].play();
		
		//this.$hover[0].muted=true;
	},
	
	loop : function(){
		var self = this;
		setInterval(function(){
			self.anim();
		},1000/60);
	},
	anim : function(){
		var dX = this.destX-this.curX;
		var dY = this.destY-this.curY;
		
		if (Math.abs(dX)<0.1 && Math.abs(dY)<0.1) return false;
		
		this.curX +=  dX / this.smooth;
		this.curY += dY / this.smooth;
		
		this.$hoverbox.css({ marginTop : this.curY , marginLeft : this.curX });
		this.$hover.css({ marginTop : -this.curY , marginLeft : -this.curX });
		
	}
}

$(function(){
	window.glass = new Glass();
});