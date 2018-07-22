var g = 9.81;
var pi = Math.PI;
var rad = (pi/180);

var width = 500;
var height = 300;
var mid = parseInt(width/2);

var minH = 22;
var grassH = 10;

var wallH = 30;
var wallW = 5;

var speed = 30;

var P1 = 1;
var P2 = 2;
var numPlayers = 2;

var interval;
var w = window;

var b = {

	move : function(){	
		if (!b.To) return false;
			
		//Calcula la posición 'x' e 'y' en el instante 't'
		var t = ((now()-b.To)/1000) * b.Tm;
		var x = b.Vo * Math.cos(b.Qo) * t;
		var y = (b.Vo * Math.sin(b.Qo) * t) - ( (1/2) * g * Math.pow(t,2) );
		
		//Calcula el angulo 'Qt' en el instante actual
		var Vx = b.Vo * Math.cos(b.Qo);
		var Vy = (b.Vo * Math.sin(b.Qo)) - (g*t);
		var Qt = Math.atan(Vy/Vx);
		
		//Desplazamiento según el inicio de la trayectoria 'dx' y 'dy'
		var px = (x+b.dx);
		var py = height-y-b.dy;
		
		b.x = px;
		b.y = py;		
		
		//Comprueba si ha chocado con algo, si no, dibuja la pelota
		if (!b.checkColide(px,py,Qt)){
			b.draw(px,py);
		}
	},
	
	//Resetea el valor del tiempo
	reset : function(P){
		b.To = now();
		
		if (P){
			b.dx = f[P].x-180;
			b.dy = height;
			b.Qo = -40*rad;
		}
	},
	
	//Comprueba que se haya chocado la bola
	checkColide : function(px,py,Qt){
		var c;
		//Limite horizontal
		if (py>height){
			b.dy=py-height;
			b.Qo = pi-(Qt>pi ? Qt-pi : Qt<0 ? Qt+pi : Qt);
			b.dx=px;
			b.reset();
		}
		//Limite izquierdo
		if (px>width){
			b.Qo = pi-(Qt>pi ? Qt-pi : Qt<0 ? Qt+pi : Qt);
			
			var pT = now()-b.To;
			var pX = width-b.dx;
			 
			b.To = now()-pT;
			b.dx=mid;
			b.Qo = Qt;
			
			console.log(Qt/rad , b.Qo/rad , b.dy , b.dx , b.To);
			//pause();
		}
		if (px<0) b.reset(1);
		
		//Bixo
		else if (c = checkHit()) {
			if (c==1){
				//Comprueba si el golpe es de p1 o p2
				var P = b.x>mid ? 1 : 2;
				
				//Calcula en angulo de rebote
				var Q = Math.atan((py-f[P].y-8)/(f[P].x-px));
				
				//console.log(f[P].diff,f[P].Vo-(g*f[P].lt),f[P].jumping);
			
				b.dy=height-py;
				b.dx=px;	
				
				b.Qo = f[P].x<px?Q:Q+pi;
				
				b.reset();	
				
			}else{
				if((height-py) <wallH){	
					//b.bounce = b.x<mid ? 1 : -1
					b.reset(P1);
				}else{
					b.dy=height-py;
					b.dx=px;	
					b.Qo = pi-(Qt>pi ? Qt-pi : Qt<0 ? Qt+pi : Qt);
					b.reset();		
				}
			}
			
			return true;
		}
	},
	
	To : 0,				//Tiempo inicial
	Vo : 60,			//Velocidad inicial
	Qo : 50*rad, 		//Angulo inicial
	Tm : 6,				//Multiplicacion tiempo
	dx : width/3,
	dy : 0,
	x : 0,
	y : 0,
	radio : 8
}


//Comprueba que se hayan tocado bixo y pelota
function checkHit(){
	
	drawBackup();
	
	//Comprueba que existan colores distintos de rojo y verde puros(contacto)
	var fx = b.x-b.radio-2;
	var fy = b.y-b.radio-2;
	var tx = b.radio*2+4;
	var ty = b.radio*2+4;
	
	if (fx<0) fx=0;
	if (fy<0) fy=0;
	if (fx+tx>width) tx=width-fx;
	
	try{
		var data = btx.getImageData(fx,fy,tx,ty).data;
		for(i=0;i<data.length;i+=4){
			if (data[i]==255 && data[i+1]==255) return 1;
			//if (data[i+1]==255 && data[i+2]!=0) return 2;
		}
		return false;
	}catch(e){
		//console.count('err');
	}

}

var f = {
	move : function(P){
		//Relativo a movimiento lateral y componente horizontal
		f.side(P);
		
		//Relativo a saltar y componente vertical
		f.jump(P);		
		
		//Dibuja el bixo
		f.draw(f[P].x,f[P].y,P);	
	},
	
	side : function(P){	
		var time = key.time[P+'left'] || key.time[P+'right'];	
		var diff;
		
		if (!time){
			f[P].dx = f[P].x;
		}else{
			var k = key.time[P+'left']?-1:1;		
			diff = ((now()-time)/speed);
			
				diff = Math.pow(diff,1.6)-diff/3;
				
			f[P].x= f[P].dx + diff * k;
			
			if (f[P].x < f[P].mMin) f[P].x = f[P].mMin;
			if (f[P].x > f[P].mMax) f[P].x = f[P].mMax;
			
		}
	},
	
	jump : function(P){
		//Si pulsa boton y no esta saltando
		if (key.pressed[P+'up'] && !f[P].jumping){
			f[P].jumping = true;
			f[P].jumpcut = false;
			f[P].To = now();
			f[P].Hm = 1;
		}
			
		//Saltando
		if (f[P].jumping){

			//Si suelta el boton en medio del salto
			if (!key.pressed[P+'up'] && !f[P].jumpcut) {

				var v = f[P].Vo-(g*f[P].lt);		//Velocidad actual
				
				if (v<0) f[P].jumpcut = true;	
				
				//Si no tiene velocidad negativa y es mayor que la minima				
				if (v>0 && v<f[P].Vo-8){ 		
					var h = (f[P].Vo*f[P].Vo)/(2*g);	///Altura max de la parabola
					f[P].Hm = f[P].ly/h;	///Relacion altura maxima y actual, resulta en x menos tiempo y altura
					
					f[P].jumpcut = true;
					
					var tt = (f[P].Vo*f[P].Hm*2)/(7*g)/2;	//valor de t donde la futura parabola es maxima
					f[P].To -= (tt*1000)-(now()-f[P].To);	//Diferencia de t futura y t acual añadida a tiempo inicial
				}
			}


			var t = ((now()-f[P].To)/1000)*7;		///t actual
			f[P].y = ((f[P].Vo * t) - ( (1/2) * g * (Math.pow(t,2)/f[P].Hm) ));	///Posición de la y actual

			//Copia de valores
			f[P].lt = t;
			f[P].ly = f[P].y;
			
			//Si ha vuelto al horizonte se para
			if (f[P].y<0) {
				f[P].y=0;
				f[P].jumping=false;
			}
		}else{ f[P].y=0 }

		f[P].y = height-minH-f[P].y; //Invierte la posicion
	},
	
	startMove : function(P){	
		key.time[P+'right']=0;
		key.time[P+'left']=0;	
		f[P].dx = f[P].x;
	},
	
	'1' : {
		jumping : false,
		jumpcut : false,
		
		Hm : 0,
		To : 0,
		lt : 0,
		ly : 0,
		Vo : 42,
		v : 0,
		dx : 0,
		
		radio1 : 10,
		radio2 : 12,
	
		x : mid+(mid/2),
		y : 0,
		mMax : width - 10,
		mMin : mid + wallW+8,
		
		color1 : '#A76E75',
		color2 : '#89424C',
		shadowColor : '#6C3940',
		strokeStyle : '#2E1115'
	},
	
	'2' : {
		jumping : false,
		jumpcut : false,
		
		Hm : 0,
		To : 0,
		lt : 0,
		ly : 0,
		Vo : 42,
		diff : 0,
		v : 0,
		dx : 0,
		
		radio1 : 10,
		radio2 : 12,
	
		x : mid-(mid/2),
		y : 0,
		mMax : mid-wallW-8,
		mMin : 10,
		
		color1 : '#8D7C96',
		color2 : '#6B4F7A',
		shadowColor : '#594862',
		strokeStyle : '#3A3040'
	}
}

function now(){return (new Date).getTime()}
	
function animate(){	

	clearCanvas();
	
	
	f.move(P1);
	f.move(P2);
	
	b.move();
	
	drawWall();
	
	drawFloor();
}


var key = {
	down : function(k){
		if (!key.map[k]) return false;
		var val = key.map[k];
		if (!key.pressed[val]){
			
			if (k==key.map['1right'] || k==key.map['1left']) f.startMove(P1);
			if (k==key.map['2right'] || k==key.map['2left']) f.startMove(P2);
			
			if (k==key.map.pause) pause();
			if (k==key.map.space) start();
			
			key.pressed[val] = true;
			key.time[val] = now();
		}
			
	},
	up : function(k){
		var val = key.map[k];    
		if (val){
			key.pressed[val] = false;
			key.time[val] = 0;
		}
	},
	start : function(){
		for(val in key.map){
			key.map[key.map[val]] = val;
			key.time[val]=key.pressed[val]=false;	
		}
	},
	map : {
		'1up' : 38,
		'1right' : 39,
		'1left' : 37,
		'2up' : 87,
		'2right' : 68,
		'2left' : 65,
		space : 32,
		pause : 80	
	},
	time : {},
	pressed : {}
	
}

function start(){	
	pause();
	interval = setInterval(animate,1000/100);
	b.reset(P1);
}
function pause(){
	clearInterval(interval);	
}


$(function(){
	w.canvas = $('#canvas')[0];
	w.backup = $('#backup')[0];
	
	canvas.height = height;
	canvas.width = width;
	backup.height = height;
	backup.width = width;
	
	w.ctx = canvas.getContext('2d');
	w.btx = backup.getContext('2d');
	
	//Despaza el canvas hacia arriba
	ctx.translate(0,-grassH);
	

	$(document).keydown(function(e){key.down(e.keyCode)});
	$(document).keyup(function(e){key.up(e.keyCode)});	

	key.start();
	start();
	//drawWall();
});