var xlen = 7;
var ylen = 6;


var wlen = 44;
var xtra = wlen+10;


var c = {
	turn : 0,
	color : ['yel','red'],
	
	init : function(){
		var str = '', cstr = '';
		for (var j=0;j<xlen;j++){
			cstr += '<div class="c'+(j+1)+' col"></div>';
			for (var i=0;i<ylen;i++)
				str += '<div class="hcell"></div>';
		}
		$('#back').html(cstr).css({marginTop:-xtra+'px'}).find('.col').width(wlen).height((wlen*ylen)+xtra);
		
		$('#back').clone().attr('id','cols').appendTo('#box');
		
		$('#hover').html(str);
		$('#hover,#back,#cols').width(wlen*xlen).height(wlen*ylen);	
		$('#box').width((wlen*xlen)+20).height((wlen*ylen)+20);
	},
	
	getCol : function(col){
		return $('#back .c'+col);		
	},
	
	getColNum : function(t){
		return /c(\d+)/.exec($(t).attr('class'))[1];
	},
	
	getNumPieces : function(col){
		return c.getCol(col).find('.piece').not('.preview').length+1;
	},
	
	prePiece : {
		show : function(col){
			$('<div class="piece '+c.color[c.turn]+' preview"></div>').appendTo(c.getCol(col)).css({opacity:0}).animate({opacity:1},100);
			c.getCol(col)[0].isHover = true;
		},
		hide : function(col){
			c.getCol(col).find('.preview').stop().animate({opacity:0},100,function(){$(this).remove()});
			delete c.getCol(col)[0].isHover;
		},
		drop : function(col){
			var n = ylen-c.getNumPieces(col);
			if(n<0) return false;
			var m = (n*wlen)+xtra;
			c.getCol(col).find('.preview').removeClass('preview').animate({marginTop:m+'px'},700,'easeOutBounce',function(){
			});
			c.changeTurn();
			if (c.getCol(col)[0].isHover) c.prePiece.show(col);	
		}
		
	},
	
	changeTurn : function(){
		c.turn = c.turn?0:1;
	}
	
}

function getCol(t){
}

$(function(){
	c.init();
	
	$(document).mousedown(function(e){ e.preventDefault(); return false;});
	
	$('#cols .col').hover(function(){
		c.prePiece.show( c.getColNum(this) );
	},function(){
		c.prePiece.hide( c.getColNum(this) );
	}).click(function(){
		c.prePiece.drop( c.getColNum(this) );
	});
});