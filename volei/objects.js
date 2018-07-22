//Limpia el canvas
function clearCanvas(){
	
	ctx.shadowBlur=0;
	ctx.shadowColor='rgba(0,0,0,0)';
	ctx.fillStyle='rgba(238,238,238,0.4)';

	ctx.fillRect(0,0,width,height+grassH);	
}

//Dibuja un suelo
function drawFloor(){
	
	var grass = ctx.createLinearGradient(0, height, 0, height+grassH);
	grass.addColorStop(0,'#8BA06E');
	grass.addColorStop(1,'#49693F');	
		
	ctx.shadowBlur=2;
	ctx.shadowColor='rgba(51,90,40,.5)';
	ctx.strokeStyle='#3C692F';
	ctx.fillStyle = grass;
	
	ctx.beginPath();
	
	ctx.moveTo(0,height+grassH);
	ctx.lineTo(0,height);	
	for (var i=0;i<Math.ceil(width/10)+1;i++)
		ctx.quadraticCurveTo(i*10,height+2,(i*10)+5,height);
	ctx.lineTo(width,height+grassH);	
	ctx.closePath();
	ctx.fill();
}

//Dibuja el muro
function drawWall(){
	var grass = ctx.createLinearGradient(mid, height-wallH, mid, height);
	grass.addColorStop(0,'#fc0');
	grass.addColorStop(1,'#BAA142');	
		
	ctx.shadowBlur=0;
	
	ctx.fillStyle = '#71762C';
	ctx.fillRect(mid-wallW,height-wallH,wallW+wallW,wallH+4);
	
	ctx.fillStyle = grass;
	ctx.fillRect(mid-wallW+1,height-wallH+1,wallW+wallW-2,wallH+4-2);
}

//Dibuja la copia de bixos y bola en btx
function drawBackup(){
	
	btx.clearRect(0,0,width,height);
	var x,y;
	var numPlayers=1;
	
	//Dibjuja el primer bixo
	for (var P=1;P<numPlayers+1;P++){
		x = f[P].x;
		y = f[P].y;
		btx.fillStyle='rgba(255,0,0,1)';		
		btx.beginPath();	
		btx.arc(x,y,f[P].radio1,0,pi,true);
		btx.moveTo(x-f[P].radio1,y);
		btx.lineTo(x-f[P].radio2,y+10);
		btx.arc(x,y+10,f[P].radio2,0,pi,false);
		btx.lineTo(x+f[P].radio2,y+10);
		btx.lineTo(x+f[P].radio1,y);
		btx.closePath();
		btx.fill();
	}
	
	
	btx.fillStyle = 'rgba(0,0,255,1)';
	btx.fillRect(mid-5,height-wallH,10,wallH);
	
	
	//Dibuja la bola en modo lighter para resaltar el contacto
	btx.globalCompositeOperation = 'lighter';
	
	x = b.x;
	y = b.y;
	btx.fillStyle='rgba(0,255,0,1)';
	btx.beginPath();
	btx.arc(x,y,b.radio,0,2*pi,true);	
	btx.fill();
}


//Dibuja el bixo
$.extend(f,{
	draw : function(x,y,P){
		f[P].radio2 = 12-((2/90)*(height-minH-f[P].y));
		
		var red = ctx.createRadialGradient(x-6, y-6, 0,x-6, y-3,20);
		red.addColorStop(0,f[P].color1);
		red.addColorStop(1,f[P].color2);	
		
		ctx.shadowBlur=2;
		ctx.shadowColor = f[P].shadowColor;			
		ctx.fillStyle=red;
		ctx.strokeStyle	= f[P].strokeStyle;
			
		ctx.beginPath();
		
		ctx.arc(x,y,f[P].radio1,0,pi,true);
		ctx.moveTo(x-f[P].radio1,y);
		ctx.lineTo(x-f[P].radio2,y+10);
		ctx.arc(x,y+10,f[P].radio2,0,pi,false);
		ctx.lineTo(x+f[P].radio2,y+10);
		ctx.lineTo(x+f[P].radio1,y);
		
		ctx.closePath();		
		ctx.stroke();
		ctx.fill();
	}
});

//Dibuja la bola
$.extend( b ,{
	draw : function(x,y){
		
		var gradient1 = ctx.createRadialGradient(x-b.radio/2, y-b.radio/2, 0,x-b.radio/2, y-b.radio/2,b.radio);
		gradient1.addColorStop(0,   '#B1D4DE'); // red
		gradient1.addColorStop(1,   '#82B1BE'); // blue
				
		ctx.fillStyle=gradient1;
		ctx.shadowBlur=1;
		ctx.shadowColor = '#000';
		
		ctx.beginPath();
		ctx.arc(x,y,b.radio,0,2*pi,true);	
		ctx.fill();
	}
});