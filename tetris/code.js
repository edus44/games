console.log('wtf2')

var t = {
	_x : 10,
	_y : 20,
	
	level : 1,
	
	levelSpeed : [ null , [500,60,100] , [450,60,100] , [400,60,100] , [350,60,100] , [300,60,100] , [250,60,100] , [200,60,100] , [150,60,100] , [100,60,90] , [60,50,90] ],
	
	speed : 0,
	
	keyPressed : '',
	
	keyTime : 0,
	
	time : 0,
	
	gameStat : 0,
	
	init : function(){	
		t.bindEvents();	
		t.createDOM(t._x,t._y,'box');
		t.createDOM(4,4,'next');
		
		t.setInfo('Press Space to Start');
	},
	
	startGame : function(){
		//Borra las piezas actuales
		$('#box div[class!=],#next div[class!=]').removeAttr('class'); 
		
		//Crea las dos primeras piezas y las dibuja
		t.createPiece();
		t.createPiece();	
		t.move();
		
		t.resetScore();
		t.setInfo('');
		
		//Empieza el juego
		t.reanude();
	},
	
	endGame : function(){
		t.pause();
		t.gameStat=0;	
		t.setInfo('GAME OVER<br/>Press Space to Start');
	},
	
	bindEvents : function(){
		$(document).keydown( function(e){			
			if (t.gameStat==1 && e.keyCode!=80 && e.keyCode!=32) {
				if (e.keyCode==40){
					t.speed=1;	
				}else if(e.keyCode==38){
					t.trig.changeForm();
				}else{		
					t.keyPressed = t.keys[ e.keyCode ];
				}
			}
		});
		
		$(document).keyup( function(e){
			if(e.keyCode==80) t.trig.pause();
			if(e.keyCode==32) t.trig.start();
			
			t.keyPressed = null;
			if (e.keyCode==40) t.speed=0;			
		});
		
		
		$('#controls div').eq(0).click(function(){
			t.startGame();
		});
		$('#controls div').eq(1).click(function(){
			t.endGame();
		});
		$('#controls div').eq(3).click(function(){
			t.pause();
		});
		$('#controls div').eq(2).click(function(){
			t.reanude();
		});
		
	},
	
	createDOM : function(x,y,id){
		var s='';
		
		for (var f=1;f<y+1;f++)
			for (var c=1;c<x+1;c++)
				s+='<div id="x'+c+'y'+f+'"></div>';
				
		$('#'+id).html(s).css({width: x*20+'px' , height : y*20+'px'});
		
		if (id=='box') $('#game').css({width: (x*20)+120+'px' , height : (y*20)+26+'px'})
	},
	
	reanude : function(){
		t.pause();
		t.interval = setInterval(t.animate,10);
		t.gameStat=1;
		t.setInfo('');
	},
	
	pause : function(){
		clearInterval(t.interval);
		t.gameStat=2;
		t.setInfo('PAUSED<br/>Press P to reanude');
	},
	
	//
	animate : function(){
		var now = (new Date()).getTime();
		
		if (t.keyPressed && now - t.keyTime > t.levelSpeed[t.level][2] - 5 ) {
			t.keyTime = now;
			t.trig[t.keyPressed]();
		}
		
		//Se mueve si ha pasado un tiempo speed
		if (now-t.time > t.levelSpeed[t.level][t.speed] -5){
			t.time = now;
			t.move();
		}
	},
	
	//Funcion bucle
	move : function(){
		t.trig.moveDown();
	},
	
	
	//Define la siguiente pieza y la anterior a la actual
	createPiece : function(){
		t.piece.form = t.nextPiece.form;
		t.piece.stat = 0;
		t.piece.x = Math.ceil(t._x/2)-2;
		t.piece.y = 0
		
		t.nextPiece.form = parseInt(Math.random()*7);
		t.nextPiece.stat = 0;
		
		t.drawNext();
	},
	
	//Dibuja la pieza actual
	draw : function(){ 
		var l = 0;	
		$('.actual').removeAttr('class');
		for(var j=0;j<4;j++) 
			for(var i=0;i<4;i++){
				
				if (t.p[ t.piece.form ][ t.piece.stat ][l++]){
					$('#box #x'+(i+t.piece.x)+'y'+(j+t.piece.y)).addClass('c'+t.piece.form+' actual');
				}
				
			}
	},
	
	//Dibuja la siguiente pieza
	drawNext : function(){ 
		var l = 0;	
		$('#next div').removeAttr('class');
		for(var j=0;j<4;j++) 
			for(var i=0;i<4;i++){
				
				if (t.p[ t.nextPiece.form ][ t.nextPiece.stat ][ l++ ]){
					$('#next #x'+(i+1)+'y'+(j+1)).addClass('c'+t.nextPiece.form);
				}
				
			}
	},	
	
	//Retorna la posicion x del bloque o limite con quien ha tocado, si no false
	checkContact : function(){
		var l = 0;		
			
		for(var j=0;j<4;j++) 
			for(var i=0;i<4;i++)
				if (t.p[ t.piece.form ][ t.piece.stat ][ l++ ])
					if ( !document.getElementById('x'+(i+t.piece.x)+'y'+(j+t.piece.y)) || document.getElementById('x'+(i+t.piece.x)+'y'+(j+t.piece.y)).className.indexOf('block')>-1 )
						return {x:i};
		return false;
	},
	
	checkLine : function(){
		var lines={};
		var line=0;
		var selector='';
		var n=0;
		$('#box div.block').each(function(){
			var f = /y([0-9]+)/.exec(this.id)[1];
			if (!lines[f]) lines[f]=0;
			lines[f]++;
		});
		for(i in lines)
			if (lines[i]==t._x){
				$('#box div[id*=y'+i+']').removeAttr('class').eq(0).prevAll('.block').each(function(){
					var y = parseInt(/y([0-9]+)/.exec(this.id)[1]);
					var x = parseInt(/x([0-9]+)/.exec(this.id)[1]);
					var cs = $(this).attr('class');
					$(this).removeAttr('class');
					$('#x'+x+'y'+(y+1)).attr('class',cs).removeAttr('style');
				});	
				
				t.playSound('line',.3);
				
				t.addScore(1,'lines');
				line++;
			}
		
		if (line) t.addScore(100+((line-1)*2*100),'score');
	},
	
	trig : {
		changeForm : function(){
			var lastStat = t.piece.stat++;
			if (!t.p[ t.piece.form ][ t.piece.stat ]) t.piece.stat=0;
			
			var lastX = t.piece.x;
					
			var contact;
			var i=0;
			
			do{
				contact = t.checkContact(); 
				if (contact.x<=1) t.piece.x++;
				if (contact.x==3) t.piece.x--;
				i++;
			}while(contact && i<4);
			
			if (i==4){
				t.piece.x=lastX;	
				t.piece.stat=lastStat;
			}else{
				t.draw();
				t.playSound('form',.3);
			}
		},
		moveDown : function(){
			t.piece.y++;
			
			if (t.speed==1) {
				t.playSound('beep',.3);
				t.addScore(2,'score');//Puntuacion por cada vez acelerado
			} 
			
			if(t.checkContact()){
				t.playSound('block',.3);			
				$('.actual').toggleClass('actual block');
				
				t.createPiece();
				if (t.checkContact()) t.endGame();
				
				t.draw();
				
				t.addScore(50,'score'); //Puntuacion por pieza colocada
				
				t.checkLine();
			}else{
				
				t.draw();
			}
		},
		moveRight : function(){	
			t.piece.x++;
			if (!t.checkContact())
				t.draw();
			else
				t.piece.x--;
			
		},
		moveLeft : function(){
			t.piece.x--;
			if (!t.checkContact())
				t.draw();
			else
				t.piece.x++;
			
		},
		pause : function(){
			if (t.gameStat==2) t.reanude();
			else if (t.gameStat==1) t.pause();	
		},
		start : function(){
			if (t.gameStat==0 || t.gameStat==2) t.startGame();	
		}
		
	},
	
	//Reproduce un sonido
	playSound : function(sound,volume){
		// return false;
		if (!window.Audio) return false;
		window.snd = new Audio('sound/'+sound+'.wav');
		snd.volume = volume;
		snd.play();
	},
	
	//Puntuaciones
	addScore : function(add,type){
		t[type]+=add;
		$('#'+type).html(t[type]);
		
		if (type=='lines' && parseInt(t.lines/10)>=t.level){
			t.level+=1;
			if (t.level>10) t.level=10;
			$('#level').html(t.level);			
		}
		
		
	},
	
	//Resetea las puntuaciones
	resetScore : function(){
		t.level=1;
		t.score=0;
		t.lines=0;
		$('#score,#lines').html(0);
		$('#level').html(1);
	},
	
	setInfo : function(string){
		$('#controls').html(string);
	},
	
	score : 0,
	lines : 0,
	
	piece : {},
	
	nextPiece : {},
	
	p : 
	[
		[
			[0,0,0,0,  0,1,1,0,  0,1,1,0,  0,0,0,0]		//Cubo
		],
		[
			[0,0,0,0,  1,1,1,1,  0,0,0,0,  0,0,0,0],	//Linea
			[0,0,1,0,  0,0,1,0,  0,0,1,0,  0,0,1,0]
		],
		[
			[0,0,0,0,  0,0,1,1,  0,1,1,0,  0,0,0,0],	//S
			[0,0,1,0,  0,0,1,1,  0,0,0,1,  0,0,0,0]
		],
		[
			[0,0,0,0,  0,1,1,0,  0,0,1,1,  0,0,0,0],	//Z
			[0,0,0,1,  0,0,1,1,  0,0,1,0,  0,0,0,0]
		],
		[
			[0,0,0,0,  0,1,1,1,  0,1,0,0,  0,0,0,0],	//L
			[0,0,1,0,  0,0,1,0,  0,0,1,1,  0,0,0,0],	
			[0,0,0,1,  0,1,1,1,  0,0,0,0,  0,0,0,0],	
			[0,1,1,0,  0,0,1,0,  0,0,1,0,  0,0,0,0]
		],
		[
			[0,0,0,0,  0,1,1,1,  0,0,0,1,  0,0,0,0],	//J
			[0,0,1,1,  0,0,1,0,  0,0,1,0,  0,0,0,0],	
			[0,1,0,0,  0,1,1,1,  0,0,0,0,  0,0,0,0],	
			[0,0,1,0,  0,0,1,0,  0,1,1,0,  0,0,0,0]
		],
		[
			[0,0,0,0,  0,1,1,1,  0,0,1,0,  0,0,0,0],	//T
			[0,0,1,0,  0,0,1,1,  0,0,1,0,  0,0,0,0],	
			[0,0,1,0,  0,1,1,1,  0,0,0,0,  0,0,0,0],	
			[0,0,1,0,  0,1,1,0,  0,0,1,0,  0,0,0,0]
		]
	],
	
	keys : { '38' : 'changeForm',  '39' : 'moveRight', '40' : 'moveDown', '37' : 'moveLeft', '80' : 'pause', '32' : 'start' }
}


$(function(){
	
	t.init();
});