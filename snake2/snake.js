//Autor : Eduardo Hidalgo [hhweb.es]
//Licensed under a Creative Commons Attribution 3.0 License

var keys = { '38' : 'up',  '39' : 'right', '40' : 'down', '37' : 'left', '80' : 'pause', '32' : 'start' };

var levels = {easy : {level:5,speed:130}, hard :{level:9,speed:90}, veryhard : {level:13,speed:60}};

var actualLevel = 'hard';

var s = {
	
	init : function(){
		s.destroy();
		s.paused = false;
		s.gaming = false;
		s.createInfoDOM();
		$(document).keydown(function(e){
			if (keys[e.keyCode]){
				if (keys[e.keyCode]=='pause') s.pauseHandler();
				else if (keys[e.keyCode]=='start') s.startHandler();
				else if (s.gaming) s.changedir(keys[e.keyCode]);
			}
		});		
		$('#info div').click(function(){
			if (!$(this).hasClass('active')){
				$('.active').removeClass('active');
				$(this).addClass('active');
				actualLevel = this.id;
			}
		});
	},
	
	createInfoDOM : function(){
		$('#container').html('').append(
			$('<div>',{id:'info','html':'<div id="easy"></div><div id="hard"></div><div id="veryhard"></div>'})
		);
		$('#'+actualLevel).addClass('active');
	},

	pauseHandler : function(){
		if (!s.gaming) return false;
		if (!s.paused) {
			$('#box').addClass('paused');
			s.pause();
			s.paused = true;
		}else {
			$('#box').removeClass('paused');
			s.reanude();
			s.paused = false;
		}
	},
	
	startHandler : function(){
		if (!s.gaming && !s.paused) s.startGame();
		if (s.paused) s.init();
	},

	startGame : function(){
		s.createGameDOM();
		
		//Posicion inicial de la cabeza
		s.adder = [];
		s.adder[0] = new s.setSection(9,5,'head','right');
		
		//Relleno la primera serpiente
		for (var i=6;i;i--) s.addSection();
		
		//Nivel
		s.level = levels[actualLevel].level;

		//Velocidad
		s.speed = levels[actualLevel].speed;
		
		//Score
		s.score = 0;
		s.refreshScore();
		s.scoreCount = 0;
		
		//Primer food
		s.setFood();
		
		s.bug = {x : 0, y : 0};
		s.bugFree = false;
		s.bugCount = -1;
		
		//Empieza el bucle
		s.reanude();
		
		s.gaming = true;
	},
	
	//Borra lo que hay en el container
	destroy : function(){
		$(document).unbind('keydown');
		$('#container').html('');
		s.pause();
	},
	
	//Crea el dom para el juego
	createGameDOM : function(){
		var string = '';
		for (var j=9;j;j--)
			for(var i=1;i<21;i++)
				string += '<div id="x'+i+'y'+j+'"></div>';
				
		$('#container').html('').append(
			$('<div>',{id:'score'}).append(
				$('<div>',{id:'left','class':'scores'}).append($('<div>',{id:'n1'})).append($('<div>',{id:'n2'})).append($('<div>',{id:'n3'})).append($('<div>',{id:'n4'}))
			).append(
				$('<div>',{id:'gameover'})
			).append(
				$('<div>',{id:'right','class':'scores'}).append($('<div>',{id:'b1'})).append($('<div>',{id:'b2'})).append($('<div>',{id:'b3'})).append($('<div>',{id:'b4'}))
			)
		).append($('<div>',{id:'box',html:string}));
	},
	
	//Bucle de movimiento
	animate : function(){
		var now = (new Date()).getTime();
		if (!s.time) s.time = now;

		//Se mueve si ha pasado un tiempo speed
		if (now-s.time>s.speed){
			s.time = now;
			
			s.move();
			s.checkFood();
			if (!s.checkHit())
				s.refresh();
		}
	},

	//Desplaza una seccion toda la serpiente
	move : function(){
		var buffer = [];
		var buffer2 = [],type,dir;

		for(i in s.adder){
			i = parseInt(i);
			
			//Guardo en buffer la antigua serpiente
			buffer[i] = new s.setSection(s.adder[i].x,s.adder[i].y,s.adder[i].type,s.adder[i].dir,s.adder[i].bola);
			
			if (i==0){
				//Desplaza la cabeza y atraviesa las paredes
				if (s.adder[i].dir=='up') 	 s.adder[i].y = s.adder[i].y+1>9 ? 1 : s.adder[i].y+1;
				else if (s.adder[i].dir=='right') s.adder[i].x = s.adder[i].x+1>20? 1 : s.adder[i].x+1;
				else if (s.adder[i].dir=='down')  s.adder[i].y = s.adder[i].y-1<1 ? 9 : s.adder[i].y-1;
				else if (s.adder[i].dir=='left')  s.adder[i].x = s.adder[i].x-1<1 ? 20: s.adder[i].x-1;
				s.adder[i].bola = '';
			}else{
				//Aplico la posicion de la anterior seccion
				s.adder[i].x = buffer[i-1].x;
				s.adder[i].y = buffer[i-1].y;

				//Aplico la ultima direccion del string en caso de ser un corner
				s.adder[i].dir = /((?:left$)|(?:right$)|(?:up$)|(?:down$))/.exec(buffer[i-1].dir)[0];
				
				//Hereda las bolas
				s.adder[i].bola = buffer[i-1].bola;
				
				//Sustituye los corners por body
				if (buffer[i-1].type=='corner') s.adder[i-1].type = 'body';
			}
			//Guardo en buffer las nuevas direcciones
			buffer2[i] = s.adder[i].dir;
		}

		//Busca esquinas y sustituye sus propiedades
		for(i in s.adder){
			i = parseInt(i);
			if (buffer2[i] && buffer2[i+1] && buffer2[i] != buffer2[i+1]){ 
				s.adder[i].type = 'corner';
				s.adder[i].dir = buffer2[i+1]+buffer2[i];
			}
		}
		
		if (s.bugFree) s.bugCount--;
		if (s.bugCount==0) s.bugOut();
	},	
	
	//Comprueba que se haya comido algo
	checkFood : function(){		
		var head = s.adder[0];
		var x = head.x;
		var y = head.y;	
		
		if (head.dir=='up') y++;
		else if (head.dir=='down') y--;
		else if (head.dir=='right') x++;
		else if (head.dir=='left') x--;
		
		if ((s.food.x==x && s.food.y==y) || ( s.bugFree && (x == s.bug.x || x == s.bug.x+1) && y == s.bug.y)) s.adder[0].type = 'eath'; 
		else s.adder[0].type = 'head';
		
		//Bixo comido
		if (( s.bugFree && (head.x == s.bug.x || head.x == s.bug.x+1) && head.y == s.bug.y)){
			s.addSection();
			s.adder[0].bola='bola';
			s.score+=s.level*s.bugCount;
			s.bugOut();
			s.refreshScore();
		}
		
		//Food comido
		if (s.food.x==head.x && s.food.y==head.y) {
			s.setFood();
			s.addSection();
			s.adder[0].bola='bola';
			s.score+=s.level;
			if (s.scoreCount++%5==4) s.setBug();  //Cada 5 bolas lanza el bixo
			s.refreshScore();
		}		
	},
	
	//Comprueba que se haya chocado con sigo misma
	checkHit : function(){		
		var head  = s.adder[0];
		var x = head.x;
		var y = head.y;			
		
		for (i in s.adder){
			if (i!='0' && s.adder[i].x == x && s.adder[i].y == y) {s.crash(); return true;}
		}
		return false;
	},
	
	crash : function(){
		s.gaming = false;
		s.paused = true;
		$('#gameover').addClass('show');
		s.pause();
	},
	
	//Para la serpiente
	pause : function(){
		clearInterval(s.timer);
	},
	
	//Reanuda la serpiente
	reanude : function(){
		s.refresh();
		setTimeout(function(){
			s.timer = setInterval(s.animate,10);
		},500);
	},
	
	//Pone una comida en un sitio aleatorio y comprueba que no coincida con la serpiente
	setFood : function(){  
		s.food = {
			x : parseInt(Math.random()*20)+1,
			y : parseInt(Math.random()*9)+1
		}
		for (i in s.adder)
			if ((s.adder[i].x == s.food.x && s.adder[i].y == s.food.y) || ( s.bugFree && (s.food.x == s.bug.x || s.food.x == s.bug.x+1) && s.food.y == s.bug.y)) s.setFood();
		
	},
	
	//Suelta al bicho
	setBug : function(){
		s.bug = {
			x : parseInt(Math.random()*19)+1,
			y : parseInt(Math.random()*9)+1,
			type : parseInt(Math.random()*5)+1
		}
		for (i in s.adder)
			if ( ( (s.adder[i].x == s.bug.x || s.adder[i].x == s.bug.x+1) && s.adder[i].y == s.bug.y) || ( (s.food.x == s.bug.x || s.food.x == s.bug.x+1) && s.food.y == s.bug.y)) {
				s.setBug(); 
				return false;
			}
			
		s.bugFree = true;
		s.bugCount = 21;
	},
	
	bugOut : function(){
		s.bugFree = false;
		s.bugCount = -1;
		$('#right div').removeAttr('class');
	},

	//Cambia la direccion de la serpiente
	changedir : function(newdir){
		var predir = s.adder[0].dir;
		if (newdir==predir) return false;
		if (!s.dirChanged) {setTimeout(function(){s.changedir(newdir);},5); return false }
		if ((predir=='left' && newdir!='right') || (predir=='right' && newdir!='left') || (predir=='up' && newdir!='down') || (predir=='down' && newdir!='up')){
			s.adder[0].dir = newdir;
			s.dirChanged = false;
		}
	},

	//Dibuja la nueva serpiente y su comida
	refresh : function(){
		$('#box div[class!=]').removeAttr('class');
		
		$('#x'+s.food.x+'y'+s.food.y).addClass('food');
		
		if (s.bugFree) {
			$('#x'+s.bug.x+'y'+s.bug.y+',#b1').attr('class','bixo a'+s.bug.type);
			$('#x'+(s.bug.x+1)+'y'+s.bug.y+',#b2').attr('class','bixo b'+s.bug.type);
			
			var sc = s.bugCount+'';
			while (sc.length<2) sc = '0'+sc;
			
			$('#b3').attr('class','p'+sc.substr(0,1));
			$('#b4').attr('class','p'+sc.substr(1,1));			
		}
		
		for (i in s.adder)
			$('#x'+s.adder[i].x+'y'+s.adder[i].y).addClass(s.adder[i].type+'-'+s.adder[i].dir+' '+s.adder[i].bola);
			
		s.dirChanged = true;
	},
	
	//Actualiza la puntuacion
	refreshScore: function(){
		var sc = s.score+'';
		while (sc.length<4) sc = '0'+sc;
		
		$('#n1').attr('class','p'+sc.substr(sc.length-4,1));
		$('#n2').attr('class','p'+sc.substr(sc.length-3,1));
		$('#n3').attr('class','p'+sc.substr(sc.length-2,1));
		$('#n4').attr('class','p'+sc.substr(sc.length-1,1));
	},

	//Añade una seccion a la serpiente
	addSection : function(){
		var len = s.adder.length-1;
		var tail = s.adder[len];
		var x = tail.x;
		var y = tail.y;
		
		if (len>100) return false;
		
		if (tail.dir == 'right') x--;
		else if (tail.dir == 'left') x++;
		else if (tail.dir == 'up') y--;
		else if (tail.dir == 'down') y++;
		
		if (len>0)  s.adder[len].type = 'body';
		s.adder[len+1] = new s.setSection(x,y,'tail',tail.dir);
	},
	
	//Vars y class
	adder : [],
	setSection : function(x,y,type,dir,bola){
		this.x = x;
		this.y = y;
		this.type = type;
		this.dir = dir;
		this.bola = bola || '';
	},
	time:0,
	timer:0
}

$(function(){
	s.init();

});

