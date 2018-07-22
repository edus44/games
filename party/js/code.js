

//Clas quesito
var chis = function(color,name,current_node_id,discs,historial){
	this.obj = $('<div class="chis color'+color+'">');
	
	this.color = color;
	this.name = name;
	this.current_node_id = current_node_id;
	this.historial = typeof historial == 'object' ? historial : {};
	this.offset = 40;
	this.speed = 400;
	
	this.get_export_form = function(){
		return {
			color : this.color,
			name : this.name,
			current_node_id : this.current_node_id,
			historial : this.historial,
			discs : this.get_discs()	
		};	
	}
	
	this.get_discs = function(){
		var arr = [];
		this.obj.find('.disc').each(function(){
			arr.push($(this).data('type'));
		});
		return arr;
	}
	
	//Se mueve a un nodo
	this.moveto = function(node_id,fast,sounded){
		if (!nodes[node_id]) return ;//console.error('moving to '+node_id+' : bad node_id');
		//console.log('move '+this.color+' to '+node_id);
		if (fast && fast==1){
			this.obj.css({ marginLeft : (nodes[node_id].left-this.offset) +'px' , marginTop : (nodes[node_id].top-this.offset) +'px' });
			this.current_node_id = node_id;
		}else{
			var _this = this;
			this.obj.animate({ marginLeft : (nodes[node_id].left-this.offset) +'px' , marginTop : (nodes[node_id].top-this.offset) +'px' },this.speed,'easeOutCubic',function(){
				if (sounded) sound.play('moving');
				_this.current_node_id = node_id;
			});
		}
	}
	
	//Sigue un camino de arrays de node_ids
	this.gopath = function(path,callback){
		var i = 0;
		for(p in path){
			this.moveto(path[p],0, path.length-1 != p );
			i++;
		}
		var _this = this;
		setTimeout(function(){
			//Arregla si cae donde hay otro
			_this.fix_multiple();
			if (typeof callback == 'function') callback();
		},i*this.speed+100);
	}
	
	this.fix_multiple = function(){
		var arr = {};
		for(c in chises){
			if (arr[chises[c].current_node_id])
				arr[chises[c].current_node_id].push(c);
			else
				arr[chises[c].current_node_id] = [c]; 
		}
		for(node_id in arr){
			for(chis_id in arr[node_id]){
				c = arr[node_id][chis_id];
				chises[c].moveto(node_id,1);
				if (arr[node_id].length>1){
					var rnd = ((2*Math.PI)/arr[node_id].length)*chis_id;
					var left = Math.sin(rnd)*15;
					var top = Math.cos(rnd)*15;
					chises[c].obj.animate({marginTop:'+='+top+'px',marginLeft:'+='+left+'px'},300);
				}
					
			}
		}
	}
	
	//Añade un disco a la ficha
	this.add_disc = function(disc_type,callback){
		disc_type = disc_type>>0;
		if (disc_type<1 || disc_type>5) return;// console.error('disc_type error :'+disc_type);
		if (this.obj.find('.d'+disc_type).length) {
			if (typeof callback == 'function') callback();
			return;
		}
		var $disc = $('<div class="disc d'+disc_type+' enter" data-type="'+disc_type+'"></div>');
		this.obj.append($disc);
		$disc.css({opacity:0}).scale(2).animate({opacity:1,scale:1},500,'easeInQuad',function(){
			if (typeof callback == 'function') callback();
		});
	}
	
	//Remueve un disco
	this.remove_disc = function(disc_type,callback){
		this.obj.find('.d'+disc_type).animate({opacity:0,scale:2},500,'easeOutQuad',function(){
			$(this).remove();
		});
		setTimeout(function(){
			if (typeof callback == 'function') callback();
		},500);
	}
	
	//Encuentra los posibles movimientos a una distancia determinada
	this.find_next = function(len,by_center){
		len = len>>0;
		if (len<0 || len>6) return; //console.error(from+' '+len+' : bad numero de dado');
		
		
		var from = this.current_node_id>>0;
		var hist = {};
		hist[from] = 1;
		var cola = [[from]];
		var level = 1;
		
		var add = function(node_id,nstack){
			var stack = nstack.slice(0);
			for(s in stack) if (stack[s]==node_id) return false;
			stack.push(node_id);
			cola.push(stack);
		}
		
		while(level<len+1){
			for(c in cola){
				if (cola[c].length==level){
					node_id = cola[c][cola[c].length-1];
					links = nodes[node_id].links;
					for(i in links){
						link = links[i];
						if (!(link==51 && !by_center))
							add(link,cola[c]);
					}
				}
			}
			level++;
		}
		
		var result = [];
		for(c in cola){
			if (cola[c].length==len+1){
				result.push(cola[c]);	
			}
		}
		return result;
	}
	
	for(d in discs) this.add_disc(discs[d]);
	this.moveto(this.current_node_id,1);
	
	//Añade al tablero la ficha
	$('#board').append(this.obj);
}

var dice = {
	mintime : 60,
	maxtime : 400,
	defstep : 10,
	step : 0,
	time : 0,
	spin : 1,
	lastv : 0,
	reroll : 2,
	$value : [],
	$obj : [],
	$turn_info : [],
	init : function(){
		dice.$value = $('#dice_value');
		dice.$obj = $('#dice');
		dice.$obj.tap(dice.launch);
		dice.$turn_info = $('#dicebox .turn_info');
		dice.prepare();
	},
	prepare : function(){
		dice.$value[0].className = 'v7';
		dice.reroll=0;
	},
	launch : function(){
		if (dice.reroll==0){
			dice.step=dice.defstep;
			dice.time = dice.mintime;
			dice.reroll = 1;
			dice.roll();
			dice.$obj.scale(.7).animate({scale:1},300);
			sound.play('dice');
		}
		else if (dice.reroll == 1){
			dice.time /= 3;
			dice.step /= 3;
			dice.reroll = 2;
			dice.$obj.scale(.7).animate({scale:1},300);
			sound.play('dice');
		}
	},
	roll : function(){
		setTimeout(function(){
			while( (rnd = dice.rnd())==dice.lastv);
			dice.lastv = rnd;
			dice.spin *= -1;
			dice.$value[0].className = 'v'+rnd;
			dice.$value.css({opacity:0,marginTop:(20*dice.spin)+'px'}).stop().animate({opacity:1,marginTop:'0px'},dice.time);
			
			dice.time+=(dice.step*=1.4);
			
			if (dice.time>dice.maxtime) dice.end();
			else dice.roll();
		},dice.time);
	},
	rnd : function(){
		return (Math.floor(Math.random()*6)+1);
	},
	end : function(){
		dice.reroll=2;
		dice_result = dice.$value.attr('class').substr(1,1)>>0;
		setTimeout(function(){
			game.mark_next_moves(dice_result);
		},900);
	},
	show_turn : function(){
		dice.$obj.addClass('hide');
		dice.$turn_info.css({marginTop:'430px'});
		$('#turn_msg').removeClass('hide');
		setTimeout(function(){
			$('#turn_msg').animate({opacity:0,marginTop:'+=100px'},700,function(){
				$(this).removeAttr('style').addClass('hide');
			});
			dice.$turn_info.animate({marginTop:'0px'},700,function(){
				dice.$obj.removeClass('hide').css({opacity:0}).scale(2).animate({opacity:1,scale:1});
			});
		},1500);
	}
}

var historial = {
	add : function(result){
		var node = chises[game.turn].current_node_id;
		var type = nodes[node].type.substr(1,1)>>0;
		if (node!=51) {	
			if (chises[game.turn].historial[type]==undefined)
				chises[game.turn].historial[type] = [0,0];
			chises[game.turn].historial[type][result]++;
		}
	},
	get_table : function(){
		if (!chises.length) return '<tr><td>No hay estadísticas</td></tr>';
		var str = '<tr class="types"><td>&nbsp;</td><th>&nbsp;</td><td><div class="c1"></div></td><td><div class="c2"></div></td><td><div class="c3"></div></td><td><div class="c4"></div></td><td><div class="c5"></div></td><td>TOTAL</td>';
		var total = {};
		for(c in chises){
			str+='<tr>';
			str+= '<td><div class="show_color color'+chises[c].color+'">';
				discs = chises[c].get_discs();
				for(d in discs)
					str+='<div class="disc d'+discs[d]+'"></div>';
			str+='</div></td>';
			
			str+= '<td class="name">'+chises[c].name+'</td>';
			local = [0,0];
			for(i=1;i<=5;i++){
				up = chises[c].historial[i] ? chises[c].historial[i][1]>>0 : 0;
				down = chises[c].historial[i] ? chises[c].historial[i][0]>>0 : 0;
				
				local[1]+=up;
				local[0]+=down;
				
				if (total[i]==undefined) total[i] = [0,0];
				total[i][1] += up;
				total[i][0] += down;
				
				str+='<td><span class=green>'+up+'</span>/<span class="red">'+down+'</span></td>';			
			}
			str+='<td><span class=green>'+local[1]+'</span>/<span class="red">'+local[0]+'</span></td>';
			str+='</tr>';
		}
		
		str+='<tr><td>&nbsp;</td><td>TOTAL</td>';
		local = [0,0];
		for(i=1;i<=5;i++){
			str+='<td><span class=green>'+total[i][1]+'</span>/<span class="red">'+total[i][0]+'</span></td>';
			
			local[1]+=total[i][1];
			local[0]+=total[i][0];
		}
		str+='<td><span class=green>'+local[1]+'</span>/<span class="red">'+local[0]+'</span></td>';
		str+='</tr>';
		return str;
	}
}

var card = {
	result_gived : true,
	$thumbs : [],
	$trial : [],
	init : function(){
		card.$thumbs = $('#card .sub_menu');
		card.$trial = $('#trial');
		$('#result').tap(function(){
			$(this).scale(.7).animate({scale:1},300);
			if (card.$thumbs.hasClass('hide')){
				card.$thumbs.removeClass('hide').css({opacity:0,bottom:'80px'}).stop().animate({opacity:1,bottom:'121px'},400);
				card.result_gived = false;
			}else{
				card.$thumbs.stop().animate({opacity:0,bottom:'80px'},400,function(){$(this).addClass('hide')});
				card.result_gived = true;
			}
		});
		$('#thumb_up').tap(function(){
			if (!card.result_gived) card.result_gived = true; else return;
			sound.play('success');
			sand.reset();
			historial.add(1);
			$(this).scale(.7).animate({scale:1},300,function(){
				var node = chises[game.turn].current_node_id;
				if (node==51){
					cover.hide(function(){
						alert('¡¡'+chises[game.turn].name+' gana!!');
						cookie.destroy();
						cover.show('end');
					});
				}
				else if (node%10 == 7){
					cover.hide(function(){
						setTimeout(function(){
							chises[game.turn].add_disc( nodes[node].type.substr(1,1) , function(){
								setTimeout(function(){
									cover.show('dicebox');
								},500);
							});
						},500);
					});
				}else{
					cover.hide(function(){
						setTimeout(function(){
							cover.show('dicebox');
						},500);
					});
				}
			});
		});
		$('#thumb_down').tap(function(){
			if (!card.result_gived) card.result_gived = true; else return;
			sound.play('fail');
			sand.reset();
			historial.add(0);
			$(this).scale(.7).animate({scale:1},300,function(){
				var node = chises[game.turn].current_node_id;
				if (node%10 == 7){
					cover.hide(function(){
						setTimeout(function(){
							chises[game.turn].remove_disc( nodes[node].type.substr(1,1) , function(){
								setTimeout(function(){
									game.turn_change();	
								},500);
							});
						},500);
					});
				}else{
					cover.hide(function(){
						setTimeout(function(){
							game.turn_change();	
						},500);
					});
				}
			});
		});
		
		card.$trial.tap(function(){
			$(this).scale(.7).animate({scale:1},300);
			if ($(this).hasClass('unhide')) card.hide();
			else card.show();
		});
		
		card.trial_random();
	},
	
	hide : function(){
		card.$trial.removeClass('unhide');
		$('#next_trial').addClass('hide');
	},
	
	show : function(){
		card.$trial.addClass('unhide');
		$('#next_trial').removeClass('hide');
	},
	
	trial_incs : [],
	
	trial_random : function(type){
		var rnd_sort = function(){
			return Math.round(Math.random())-0.5;
		}
		if ( (type>>0) > 0 ) {
			trials[type].sort(rnd_sort);
		}else
			for(t in trials)
				trials[t] = trials[t].sort(rnd_sort);
	},
	
	trial_load : function(){
		var node = chises[game.turn].current_node_id;
		var type = nodes[node].type.substr(1,1)>>0;
		
		//Ocultaciones varias
		$('.trial_type,.trial_var,#trial_canvas').addClass('hide');
		
		//Marca si es quesito
		$('#trial,.trial_type.c'+type).removeClass('disc_trial hide').addClass( node%10==7 || type==7 ?'disc_trial':'' );
		
		//Muestra el boton de sacar canvas
		if (type==4) $('#trial_canvas').removeClass('hide');
			
		if (type==7){
			//Ultima prueba
			var html = '<table>';
			for(i=1;i<=5;i++){
				trial = card.get_trial(i);
				html += '<tr><td><div class="c'+i+'"></div></td>';
				for(t in trial){
					if (t=='wor') trial[t] = trial[t].replace(/\|/g,' &bull; ');
					//if (t=='sol') trial[t] = trial[t].split("").reverse().join("");
					html += '<td class="'+t+'">'+trial[t]+'</td>';
				}
				html += '</tr>';
					
			}
			html += '</table>';
			$('#trial_table').html(html).removeClass('hide');
			
		}else{
			//Prueba normal
			var trial = card.get_trial(type);
			
			//Imprime la prueba
			for(t in trial){
				$trial_var = $('#trial_'+t).removeClass('hide');
				
				//if (t=='sol') trial[t] = trial[t].split("").reverse().join("");
				
				if (t=='wor'){
					words = trial[t].split('|');
					$trial_var.find('td').each(function(i){
						$(this).html(words[i]);
					});
				}else{
					$trial_var.html(trial[t]);
				}
					
			}
		}
		
		card.hide();
	},
	
	//Retorna la prueba e incrementa el puntero
	get_trial : function(type){
		
		if (card.trial_incs[type]==undefined)
			card.trial_incs[type]=-1;
			
		trial_pos = ++card.trial_incs[type];
		
		if (trial_pos>trials[type].length-1){
			card.trial_random(type);
			card.trial_incs[type]=trial_pos=0;
		}
		
		return trials[type][trial_pos];
	}
}

var sand = {
	time : 0,
	maxtime : 30*1000,
	from : 0,
	interval : 0,
	up_max : 180,
	up_min : 70,
	down_max : 34,
	down_min : 134,
	$up : [],
	$down : [],
	$fall : [],
	
	init : function(){
		sand.$up = $('#sand_up');	
		sand.$down = $('#sand_down');	
		sand.$fall = $('#sand_fall');	
		
		$('#sand_control').tap(function(){
			$(this).scale(.7).animate({scale:1},400);
			var $this = $(this);
			if ($this.hasClass('pause')){
				$this.removeClass('pause').addClass('restart').html('Reiniciar');
				sand.stop();
			}
			else if ($this.hasClass('restart')){
				$this.removeClass('restart').html('Empezar');
				sand.reset();
			}
			else{
				$this.addClass('pause').html('Parar');
				sand.start();
			}
		});
		
		sand.reset();
	},
	
	reset : function(){
		sand.stop();
		sand.$up.css({backgroundPosition:'0 70px'});
		sand.$down.css({backgroundPosition:'-130px 134px'});
		sand.$fall.css({opacity:0,display:'block'});
		$('#sand_control').removeClass('restart pause').html('Empezar');
	},
	start : function(){
		sand.from = sand.now();
		sand.$fall.animate({opacity:1},1000);
		sound.play('timerunning');
		sand.interval = setInterval(function(){
			sand.time = sand.now()-sand.from;
			diff = sand.time/sand.maxtime;
			sand.$up.css({backgroundPosition:'0 '+ ((diff*(sand.up_max-sand.up_min))+sand.up_min) +'px'});
			sand.$down.css({backgroundPosition:'-130px '+ (sand.down_min-(diff*(sand.down_min-sand.down_max))) +'px'});
			sand.$fall.toggleClass('spin');
			if (diff>1) {
				$('#sand_control').tap();
				$('#timeup').removeClass('hide');
				
				sound.pause('timerunning');
				sound.play('buzz');
				
				setTimeout(function(){
					$('#timeup').animate({opacity:0},1000,function(){
						$(this).addClass('hide').removeAttr('style');
					});
					card.show();
				},1500);
				draw.hide()
				sand.stop();
			}
		},10);
	},
	now : function(){
		return (new Date()).getTime();;
	},
	stop : function(){
		sand.$fall.animate({opacity:0},500);
		clearInterval(sand.interval);
		sound.pause('timerunning');
	}
}

var draw = {
	$canvas : [],
	$drawscreen : [],
	context : null,
	paint : false,
	size_set : false,
	touch_move_handler : function(e){
		e.preventDefault();
		return false;
	},
	set_size : function(){
		width = document.body.clientWidth;
		height = document.body.clientHeight;
		draw.$canvas.attr('width',width).attr('height',height);
		draw.context.strokeStyle = "#111";
		draw.context.lineJoin = "round";
		draw.context.lineWidth = 4;
	},
	init : function(){
		draw.$canvas = $('#canvas');
		draw.$drawscreen = $('#drawscreen');
		if (!draw.$canvas[0].getContext) return;
		draw.context = draw.$canvas[0].getContext("2d");
		draw.set_size();
		
		
		draw.$canvas.bind('mousedown touchstart',function(e){				
			draw.paint = true;
			draw.context.beginPath();
		})
		.bind('mousemove touchmove',function(e){
			if(draw.paint){
				if (is_mobile) e = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
				draw.context.lineTo(e.pageX, e.pageY);
				draw.context.stroke();
			}
			return false;
		})
		.bind('mouseup mouseleave touchend',function(e){
			draw.paint = false;
			draw.context.closePath();
		});		
		
		$('#canvas_clear').tap(function(){
			$(this).scale(.7).animate({scale:1},400);
			draw.set_size()
		});
		$('#canvas_hide').tap(function(){
			draw.hide();
		});
		$('#trial_canvas').tap(function(e){
			e.stopPropagation();
			draw.show();	
		});
	
	},
	
	show : function(){
		draw.$drawscreen.removeClass('hide');
		if (is_mobile) $(document).bind('touchmove',draw.touch_move_handler);
	},
	
	hide : function(animate){
		draw.$drawscreen.addClass('hide');
		if (is_mobile) $(document).unbind('touchmove',draw.touch_move_handler);
	}	
	
}

var cover = {
	show : function(page,extra){
		$('#cover').removeClass('trans hide timeup').css({opacity:0}).scale(.7).animate({opacity:1,scale:1},500);
		if (page=='dicebox'){
			if (extra=='turn_change'){
				dice.show_turn();
			}
			dice.prepare();
			$('#cover').addClass('trans');
		}
		if (page=='card'){
			$('#card .sub_menu').addClass('hide');
			if (extra==undefined) card.trial_load();
		}
		if (page=='end'){
			$('#history').html(historial.get_table());
		}
		$('.cover_page').addClass('hide');
		$('#'+page).removeClass('hide');
		if (page=='dicebox' || page=='card') cookie.save();
	},
	hide : function(callback){
		$('#cover').animate({opacity:0,scale:.7},500,function(){
			$(this).addClass('hide');
			if (typeof callback == 'function') callback();
		});
	}
}

//Para iniciar los jugadores
var welcome = {
	init : function(){
		$('.change_color').tap(function(){
			var taken = {};
			var num = 0;
			var actual = $(this).attr('class').match(/\d/)[0]>>0;		
			$('.change_color').each(function(){
				var color = $(this).attr('class').match(/\d/)[0]>>0;
				if (color<6){
					taken[color] = 1;
					num++;
				}
			});
			if (num==5) return;
			var next = actual;
			while(next==actual || taken[next]) if (++next>5) next=1;
			
			$(this).scale(.7).removeClass('color'+actual).addClass('color'+next).stop().animate({scale:1},300,function(){
			});
		});
		
		$('#add_player').tap(function(){
			$('.player.hide:first').removeClass('hide').find('.change_color').tap();
			if (!$('.player.hide').length) $(this).addClass('hide');
		});
		
		$('.delete_player').tap(function(){
			$change_color = $(this).siblings('.change_color');
			actual = $change_color.attr('class').match(/\d/)[0]>>0;
			$change_color.removeClass('color'+actual).addClass('color6');
			$(this).parent().addClass('hide');
			if ($('.player.hide').length) $('#add_player').removeClass('hide');
		});
		
		$('#start_game').tap(function(){
			if (this._animating) return ; this._animating = true;
			$(this).scale(.7).animate({scale:1},300,function(){
				game.chis_select();
				this._animating = false;
			});
		});
		
		$('#reset_game').tap(function(){
			$(this).scale(.7).animate({scale:1},300,function(){
				game.reset(1);
			});
		});
		
		if (cookie.exists()){
			$('#recover').removeClass('hide').tap(function(){
				cookie.load();
			});	
		}
	}
}

var cookie = {
	exists : function(){
		return !!$.cookie('party_setup');
	},
	save : function(){
		$.cookie('party_setup',$.param(game.get_current_setup()));
	},
	load : function(){
		game.init();
		var setup = $.deparam($.cookie('party_setup'));
		game.set_setup(setup);
	},
	destroy : function(){
		$.cookie('party_setup',null);
	}
}

var game = {
	turn : 0,
	next_moves : [],
	init : function(){
		$('#drawscreen,#cover').addClass('hide');
		options.reset();
		$('.chis,.chis_mark').remove();
		window.chises = [];
		game.turn = 0;
		game.next_moves = [];
	},
	reset : function(fancy){
		game.init();
		if (fancy && fancy==1){
			sound.play('fancystart');
			$('#board').css({opacity:0}).scale(.7).animate({scale:1,opacity:1},3000,'easeOutCubic',game.reset);
		
			$('.pentagon').each(function(){
				var left = Math.floor(Math.random()*600)-300;
				var top = Math.floor(Math.random()*600)-300;
				var scale = Math.random()*3;
				$(this).css({marginLeft:'-='+left+'px',marginTop:'-='+top+'px',opacity:Math.random()*0.5}).scale(scale).animate({marginLeft:'+='+left+'px',marginTop:'+='+top+'px',scale:1,opacity:1},3000,'easeOutCubic',function(){
					$(this).removeAttr('style');	
				});
			});
			return;
		}
		sound.play('welcome');
		setTimeout(function(){
			cover.show('welcome');
		},200);
	},
	
	chis_select : function(){
		var start_setup = { turn:0 , stat: 'dicebox' , chises:[] }
		$('.player').not('.hide').each(function(){
			var color = $(this).find('.change_color').attr('class').match(/\d/)[0]>>0;
			var name = $(this).find('input').val();
			start_setup.chises.push({ color:color, name:name, current_node_id:51, discs:[], historial:{} });
		});
		game.set_setup(start_setup);
		chises[0].fix_multiple();
	},
	
	set_setup : function(setup){
		game.turn = setup.turn;
		for(c in setup.chises){
			chises.push(new chis(
				setup.chises[c].color,
				setup.chises[c].name,
				setup.chises[c].current_node_id,
				setup.chises[c].discs,
				setup.chises[c].historial
			));
		}
		
		cover.hide(function(){
			setTimeout(function(){
				if (setup.stat=='dicebox') {
					game.turn_change(1);
				}else{
					dice.show_turn();
					game.turn_set();
					cover.show('card');
				}
			},500);
		});
		
		$('#recover').remove();
	},
	
	turn_set : function(){
		var actual = game.turn-1;
		if (actual<0) actual = chises.length-1;
		
		
		var str = '';
		discs = chises[game.turn].get_discs();
		for(d in discs)
			str+='<div class="disc d'+discs[d]+'"></div>';
		
		$('.show_color').removeClass('color'+chises[actual].color).addClass('color'+chises[game.turn].color).html(str);;
		$('.show_name').html(chises[game.turn].name);
		
	},
	
	turn_change : function(dont_inc){
		if (!dont_inc){
			game.turn++;
			if (game.turn>chises.length-1) game.turn = 0;
		}
		game.turn_set();
		cover.show('dicebox','turn_change');
	},
	
	mark_next_moves : function(result){
		var by_center = chises[game.turn].obj.find('.disc').length==5;
		var next_moves = game.next_moves = chises[game.turn].find_next(result,by_center);
		
		for(n in next_moves){
			node = next_moves[n][next_moves[n].length-1];
			$mark = $('<div class="chis_mark"></div>').data('move',n)
			.css({ marginLeft : (nodes[node].left-50) +'px' , marginTop : (nodes[node].top-50) +'px' });
			$('#board').append($mark);
		}
		$('.chis_mark').tap(function(){
			
			$('.chis_mark').unbind().not(this).animate({opacity:0},300,function(){ $(this).remove(); });
			var $mark = $(this);
			chises[game.turn].gopath(game.next_moves[$(this).data('move')],function(){
				$mark.animate({opacity:0},300,function(){ $(this).remove(); });
				game.next_moves = [];
				setTimeout(game.check_chis,500);
			});
		});
		cover.hide();
	},
	
	check_chis : function(){
		var node = chises[game.turn].current_node_id;
		if (nodes[node].type=='c6'){
			cover.show('dicebox');
		}else{
			cover.show('card');	
		}
	},
	
	get_current_setup : function(){
		var exchises = [];
		for(c in chises)
			exchises.push(chises[c].get_export_form());			
		return {
			turn : game.turn,
			stat : $('#card').hasClass('hide')?'dicebox':'card',
			chises : exchises
		}
	}
}

var sound = {
	elem : {},
	muted : false,
	init : function(){
		$('audio').each(function(){
			sound.elem[$(this).data('name')] = this;
		});
	},
	play : function(name){
		if (sound.muted) return;
		var elem = sound.elem[name];
		if (!elem) return;
		if (elem.currentTime) elem.currentTime=0;
		if (elem.play) elem.play();	
	},
	pause : function(name){
		var elem = sound.elem[name];
		if (!elem) return;
		if (elem.pause) elem.pause();	
	},
	pause_all : function(){
		for(i in sound.elem)
			sound.pause(i);	
	}
}

var options = {
	b_start : -560,
	b_end : -120,	
	init : function(){
		
		$('#see_options').tap(function(){
			var $this = $(this).scale(.7).animate({scale:1},300);
			if ($this.hasClass('back')){
				options.reset();
				options.back_button(1);
			}else{
				if ($this.hasClass('opened')){
					$this.removeClass('opened');
					$('#options').animate({opacity:0,scale:.7},300,function(){
						$(this).addClass('hide');
						if (typeof callback == 'function') callback();
					});
			
				}else{
					$this.addClass('opened');
					$('#options').css({opacity:0}).scale(.7).removeClass('hide').animate({opacity:1,scale:1},500);
				}
			}
		});
		
		if (is_mobile){
			$('.option')
				.bind('touchstart',options.events.start)	
				.bind('touchmove',options.events.move)	
				.bind('touchend touchcancel',options.events.end)	
		}else{
			$('.option')
				.bind('mousedown',options.events.start)	
				.bind('mousemove',options.events.move)	
				.bind('mouseleave mouseup',options.events.end)	
		}
	},
	
	reset : function(){
		$('#cover').removeClass('superhide');
		$('#options .centertable').removeClass('hide');
		$('#options .stats').remove();
		$('#options').addClass('hide');
		options.back_button(1);
	},
	
	back_button : function(inverse){
		if (inverse){
			$('#see_options').removeClass('back opened').find('span').html('opciones');
		}else{
			$('#see_options').addClass('back opened').find('span').html('volver');
		}
	},
	
	$last_cover: [],
	
	action : function(name,$obj){
		if (name!='see_stats') 
			$('#see_options').tap();
		switch(name){
			case 'next_trial' :
				card.trial_load();		
			break;
			case 'change_mute' : 
				if (sound.muted){
					sound.muted=false;
					$obj.html('Quitar sonido');
				}else{
					sound.muted=true;
					$obj.html('Activar sonido');	
					sound.pause_all();
				}
			break;
			case 'see_board' :
				$('#cover').addClass('superhide');
				options.back_button();
			break;
			case 'see_stats' : 
				$('#options').append('<table class="stats">'+historial.get_table()+'</table>');
				$('#options .centertable').addClass('hide');
				options.back_button();
			break;
			case 'reset_option':
				if (confirm('¿Reiniciar partida?')) game.reset(1);
			break;
		}
	},
	
	events : {
		start : function(e){
			e.preventDefault();		
			if (is_mobile) e = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			
			this.startX = e.pageX;
			this._moving = true;
			$(this).stop().css({backgroundPosition:options.b_start+'px center'});
			
			return false;
		},
		move : function(e){
			e.preventDefault();	
			if(this._moving){
				if (is_mobile) e = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
				var offset = options.b_start+((this.startX-e.pageX)*-1);
				this.style.backgroundPosition = offset+'px center';
				if(offset>options.b_end){
					var $obj = $(this);
					var action = $obj.data('action');
					if (is_mobile) $obj.trigger('touchcancel');
					else $obj.mouseup();
					options.action(action,$obj);
				}
			}
			
			return false;
			
		},
		end : function(e){
			if (e) e.preventDefault();		
			this._moving = false;
			$(this).css({backgroundPosition:options.b_start+'px center'});
			
			return false;
		}
	}
	
}

//Document ready
$(function(){

	//Manejo de movil
	window.is_mobile = 'ontouchstart' in document;
	
	//Inicia los nodos del tablero
	window.nodes = [{}];
	for(i=1;i<=51;i++){
		$i = $('#'+i);
		offset = $i.data('pos').split('x');
		links = $i.data('links').split(',');
		for(j in links) links[j] = links[j]>>0;
		nodes.push({
			links : links,
			type : $i.attr('class').match(/c\d/)[0],
			left : offset[0], 
			top : offset[1]
		});
	}
	delete nodes[0];
	
	//Quita el estado de 'cargando'
	$('#board,#loading').toggleClass('hide');
	
	//Inicia los modulos
	sound.init();
	sand.init();
	draw.init();
	dice.init();
	card.init();
	welcome.init();
	options.init();
	game.init();
	
	/**/
	game.reset(1);
	return;
	/**/
	
	game.set_setup({
		turn:1,
		stat:'sand',
		chises : [
			{
				color : 3,
				name : 'Cules',
				current_node_id : 12,
				historial : {3:[2,2],2:[5,2],1:[2,6]},
				discs : [2,3]
			},
			{
				color : 2,
				name : 'Madriles',
				current_node_id : 51,
				historial : {1:[5,2],2:[0,2],4:[2,6]},
				discs : [1,2,3,4,5]
			},
			{
				color : 1,
				name : 'Preguntones',
				current_node_id : 47,
				historial : {3:[5,2],1:[0,2],5:[2,6]},
				discs : [4,5,1,2]
			}
		]
	});
});
