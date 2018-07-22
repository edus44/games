function int(n){ return parseInt(n);}
function now(){ return (new Date()).getTime()};

var timer = {
	time : 0,
	start : function(){
		timer.time = now();	
	},
	stop : function(){
		return now()-timer.time;
	}
}

var r = {
	
	turnIA : 0,
	initTurn : 1,
	
	level : 2,
	
	aniTime : 300,
	
	ayudas : true,
	turn : 0,
	col : ['bp','wp','bh','wh'],	
	len : 8,
	history : [],
	levelName : [0,'easy','medium','difficult'],
	
	value : { 
		'11' : 50 , '12' : -1 , '13' :  5 , '14' :  2 , '15' :  2 , '16' :  5 , '17' : -1 , '18' : 50 ,
		'21' : -1 , '22' :-10 , '23' :  1 , '24' :  1 , '25' :  1 , '26' :  1 , '27' :-10 , '28' : -1 ,	
		'31' :  5 , '32' :  1 , '33' :  1 , '34' :  1 , '35' :  1 , '36' :  1 , '37' :  1 , '38' :  5 ,
		'41' :  2 , '42' :  1 , '43' :  1 , '44' :  0 , '45' :  0 , '46' :  1 , '47' :  1 , '48' :  2 ,
		
		'51' :  2 , '52' :  1 , '53' :  1 , '54' :  0 , '55' :  0 , '56' :  1 , '57' :  1 , '58' :  2 ,
		'61' :  5 , '62' :  1 , '63' :  1 , '64' :  1 , '65' :  1 , '66' :  1 , '67' :  1 , '68' :  5 ,
		'71' : -1 , '72' :-10 , '73' :  1 , '74' :  1 , '75' :  1 , '76' :  1 , '77' :-10 , '78' : -1 ,	
		'81' : 50 , '82' : -1 , '83' :  5 , '84' :  2 , '85' :  2 , '86' :  5 , '87' : -1 , '88' : 50 
	},
		
	//Inicia el juego ( DOM,binds)
	init : function(){
		$('.cell:empty,.cell:has(.wh,.bh)').live('mouseenter mouseleave',function(e){
			if (e.type=='mouseover') $(this).addClass('hover');
			else $(this).removeClass('hover').removeClass('invalid');
		}).live('click',function(){
			var id = $(this).attr('id');
			r.clickCell(id.substr(0,1),id.substr(1,1));
		});
		r.createDOM();
		r.startGame();
	},
	
	//Crea el dom del tablero de juego
	createDOM : function(){
		var str='';
		for (var j=1;j<r.len+1;j++){
			for (var i=1;i<r.len+1;i++){
				str += '<div id="'+j+''+i+'" class="cell '+(j%2? i%2==1?'odd':'' : i%2==0?'odd':'')+'"></div>';
			}
		}
		$('#wrapper').html($('<div id="box">').html(str));
		$('#wrapper,#box').width((r.len)*31).height((r.len)*31);
	},
	
	//Empieza el juego
	startGame : function(){
		//Borra historial y piezas
		$('.cell .piece').remove();
		r.history = [];
		
		//Piezas iniciales
		r.putPiece(1,4,4);
		r.putPiece(0,4,5);
		r.putPiece(1,5,5);
		r.putPiece(0,5,4);
		
		//Empieza con el turno inicial
		r.turn = r.initTurn?0:1;
		r.changeTurn();	
	},
	
	//Retorna el nodo de la celda x,y
	getCell : function(x,y){
		return $('#'+x+''+y);
	},
	
	//Pone una pieza (tipo t en x,y) en el tablero
	putPiece : function(c,x,y){
		if (c==-1){ r.getCell(x,y).empty(); return 0;}
		
		var $piece = $('<div>',{ 'class' : 'piece '+r.col[c] , css : {opacity : 0 } });
		var $cell = r.getCell(x,y);
		$cell.removeClass('hover').find('.piece').addClass('deleting').animate({opacity:0},r.aniTime,function(){
			$(this).remove();
		});
		$piece.prependTo($cell).animate({opacity:1},r.aniTime);
	},
	
	//Pone un numero de piezas pasadas en array [{x:x,y:y},..] de tipo t
	putPieces : function(c,piece){
		for(p in piece) r.putPiece(c,piece[p].x,piece[p].y);
	},
	
	//Retorna si hay alguna animacion activa
	animating : function(){
		return $('.piece:animated').length>0;
	},
	
	//Click en la celda x,y
	clickCell : function(x,y){
		if (r.animating() || r.turnIA==r.turn) return false;
		var v = r.checkValid(r.turn,x,y);
		//Comprueba que es valido el lugar donde pulsa
		if (v.length>0) {
			r.saveMove();
			r.putPiece(r.turn,x,y);
			setTimeout(function(){
				r.putPieces(r.turn,v);
				setTimeout(r.changeTurn,r.aniTime);
			},r.aniTime);
		}else{
			r.getCell(x,y).addClass('invalid');	
		}
	},
	
	//Marca sobre el tablero las posiciones validas, si get=1 las retorna en un array
	markValids : function(c,get){
		//timer.start();
		var v; c=int(c);
		var valids=[];
		$('.cell:empty').each(function(){
			var id = $(this).attr('id'),
				x = id.substr(0,1),
				y = id.substr(1,1);
			v = r.checkValid(c,x,y);
			if(v.length>0){
				if (get){
					valids.push({x:x,y:y,l:v.length});
				}else{
					r.putPiece(c+2,x,y);
					//r.getCell(x,y).find('.piece').html(v.length);
				}
			}
		});
		//console.log(timer.stop());
		if (get) return valids;
	},
	
	//Borra las r.ayudas
	cleanMarks : function(){
		$('.bh,.wh').remove();
	},
	
	//Comprueba que la pieza tipo c en x,y es un movimiento valido retornando las piezas contrarias que flanquea
	checkValid : function(c,x,y){
		var obj = r.getSibs(x,y);
		var piece,hand,valids = [],tempValids;
		for(o in obj){
			hand = 1;
			tempValids = [];
			for(p in obj[o]){
				if (hand){
					piece = obj[o][p];
					if ( ((piece.t==-1||piece.t==c) && hand==1) || (piece.t==-1 && hand==2) ) hand=0;
					else{
						if (piece.t!=c && hand==1) hand=2;
						if (piece.t==c && hand==2) hand=3;
					}
				}
				if(hand==2) tempValids.push({ x:piece.x , y:piece.y });
			}
			if (hand==3) $.merge(valids,tempValids);
		}
		
		return valids;
	},
	
	//Retorna las piezas que colidan en horizontal,vertical y diagonal a x,y 
	getSibs : function(x,y){
		x = parseInt(x)
		y = parseInt(y);
		
		var obj = [],o=-1,p;
		var dy = r.len+1-y, dx = r.len+1-x;
		
		//Vertical 		arriba
		o++; p=0; obj[o]={};
		for (i=1;i<x;i++) 			obj[o][p++] = { t:r.getPieceType(x-i,y), x:x-i , y:y }
		
		//Diagonal 		arriba-derecha
		o++; p=0; obj[o]={};
		d=parseInt(x>dy?dy:x);
		for (i=1;i<d;i++) 			obj[o][p++] = { t:r.getPieceType(x-i,y+i), x:x-i , y:y+i }
		
		//Horizontal 	derecha
		o++; p=0; obj[o]={};
		for (i=1;i<dy;i++) 			obj[o][p++] = { t:r.getPieceType(x,y+i), x:x , y:y+i }
		
		//Diagonal 		abajo-derecha
		o++; p=0; obj[o]={};
		d=parseInt(dx>dy?dy:dx);
		for (i=1;i<d;i++) 			obj[o][p++] = { t:r.getPieceType(x+i,y+i), x:x+i , y:y+i }

		//Vertical 		abajo
		o++; p=0; obj[o]={};
		for (i=1;i<dx;i++) 			obj[o][p++] = { t:r.getPieceType(x+i,y), x:x+i , y:y }
		
		//Diagonal 		abajo-izquierda
		o++; p=0; obj[o]={};
		d=parseInt(dx>y?y:dx);
		for (i=1;i<d;i++) 			obj[o][p++] = { t:r.getPieceType(x+i,y-i), x:x+i , y:y-i }
		
		//Horizontal 	izquierda
		o++; p=0; obj[o]={};
		for (i=1;i<y;i++) 			obj[o][p++] = { t:r.getPieceType(x,y-i), x:x , y:y-i }
		
		//Diagonal 		arriba-izquierda
		o++; p=0; obj[o]={};
		d=parseInt(x>y?y:x);
		for (i=1;i<d;i++) 			obj[o][p++] = { t:r.getPieceType(x-i,y-i), x:x-i , y:y-i }

		return obj;
	},
	
	//Retorna el tipo de pieza en x,y
	getPieceType : function(x,y){
		var cls = r.getCell(x,y).find('.piece:first').attr('class');
		if (!cls) return -1;
		if (/wp/.test(cls)) return 1;
		if (/bp/.test(cls)) return 0;
		return -1;
	},
	
	//Guarda un movimiento en cache
	saveMove : function(){
		var h = {turn : r.turn};
		$('.cell').each(function(){
			var pos = $(this).attr('id');
			h[pos] = r.getPieceType(pos.substr(0,1),pos.substr(1,1));
		});
		r.history.push(h);
	},
	
	//Carga el tablero en cache anterior
	backMove : function(){
		var hlen = r.history.length;
		var his = r.history[hlen-1];
		
		if (!his || r.animating()) return false;
		
		r.turn = his.turn?0:1;
		delete his.turn;
		
		for(c in his) r.putPiece(his[c],c.substr(0,1),c.substr(1,1));
		
		r.changeTurn();
		r.history.splice(hlen-1,hlen)
	},
	
	//Actualiza el contador de fichas
	updateCounter : function(){
		var nb = $('.cell .bp').not('.deleting').length;
		var nw = $('.cell .wp').not('.deleting').length;
		$('#bpcounter').html(nb);
		$('#wpcounter').html(nw);
		$('.current').removeClass('current');
		$('#'+r.col[r.turn]+'turn').addClass('current');
		
	},
	
	//Cambia el turno
	changeTurn : function(){
		r.turn = r.turn?0:1;
		
		r.updateCounter();
		r.cleanMarks();
		
		//Si es turno de la maquina
		if (r.turnIA==r.turn) setTimeout(r.moveIA,r.aniTime);;
		
		//Si estan activadas las ayudas y no es turno de la maquina
		if(r.ayudas && r.turnIA!=r.turn) r.markValids(r.turn);
	},
	
	//Realiza el movimiento de la maquina
	moveIA : function(){
		var valids = r.markValids(r.turn,true);
		
		//Si no tiene movimientos posibles pasa el turno
		if (valids.length==0){
			r.changeTurn();
			return false;
		}
		
		//Obtiene el movimiento elegido segun el nivel
		var p = r.selectMove[r.levelName[r.level]] (valids);
		
		var v = r.checkValid(r.turn,p.x,p.y);
		r.putPiece(r.turn,p.x,p.y);
		setTimeout(function(){
			r.putPieces(r.turn,v);
			setTimeout(r.changeTurn,r.aniTime);
		},r.aniTime);
	},
	
	selectMove : {
		easy : function(valids){
			var i = parseInt(Math.random()*valids.length);
			return {x:valids[i].x,y:valids[i].y}
		},
		medium : function(valids){
			var id, sel=-10,p=[];
			for (v in valids){
				id = valids[v].x+''+valids[v].y;
				if (r.value[id]>sel) {
					sel = r.value[id];
					p = [{x:valids[v].x,y:valids[v].y}];
				}else if (r.value[id]==sel){
					p.push({x:valids[v].x,y:valids[v].y});
				}
			}
			var i = parseInt(Math.random()*p.length);
			return {x:p[i].x,y:p[i].y}
		}
	}
}

$(function(){
	r.init();
	
	$('#marks').click(function(){
		if (r.ayudas){
			r.ayudas=false;
			r.cleanMarks();
		}else{
			r.ayudas=true;
			r.markValids(r.turn);
		}
	});
	
	$('#reset').click(r.startGame);
	$('#back').click(r.backMove);
	$('#pass').click(r.changeTurn);
});