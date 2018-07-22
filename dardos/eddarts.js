var $mod,$dig,$pname,$pmark;

var first = 0;
var t = -1;
var game;
var player;
var playern;

$pname = $('#playerinfo h2');
$pmark = $('#playerinfo h3');


if (!console) var console = {log: function(){}}; var c=console;

//Obtiene el valor numerico del tiro
function getVal(p) { return p=='Sing'?25:p=='Bull'?50:p=='Out'?0:( parseInt(/[0-9]{1,2}/.exec(p) ) * ( p.substr(0,1)=='T'?3:p.substr(0,1)=='D'?2:1 ) ) };

var _cd = {
	init : function(){
		_cd.destroy();
		for(i in player)
			$('<div>',{id:i,class:'player',html:'<h2>'+player[i].name+'</h2><strong>'+player[i].mark+'</strong><i>[0]</i><br/>'}).appendTo('#box');
		_cd.changeTurn();
	},
	destroy : function(){
		$('.player').remove();
		$pname.html('');
		$pmark.html('');
		t=-1;
	},
	changeTurn : function(inverse){
		if (t==-1) t=first; else if (inverse) t--; else t++;
		if (t>=playern) t = 0;
		if (t<0) t = playern-1;
		$pname.html(player[t].name);
		$pmark.html(player[t].mark);
		$('.player').removeClass('turn');
		$('#'+t).addClass('turn')
		if (!inverse) $('#'+t).append('<div><b>'+($('#'+t).find('div').get().length+1)+'.</b></div>');
		if (inverse) _cd.back();
		$('#darts img').removeClass('hide');
	},
	doPoint : function(p){
		var $player = $('#'+t);
		var trow = $player.find('div:last').find('span').get().length;
		var val = getVal(p);

		$player.find('div:last').append('<span>'+p+'</span>');

		player[t].mark -= val;
		if ((player[t].mark<0) || (player[t].mark==1) || (player[t].mark==0 && !/^(D)|(Bull)/.exec(p))) {
			$player.find('div:last').find('span').each(function(){
				player[t].mark += getVal($(this).html());
			});	
			$player.find('div:last').addClass('invalid');
			_cd.refreshInfo();
			_cd.changeTurn();
			return false;
		}
		_cd.refreshInfo();
		$('#dart'+trow).addClass('hide');

		if (player[t].mark==0 && /^(D)|(Bull)/.exec(p)) {_game.end(); return false;}

		if (trow==2) _cd.changeTurn();
	},
	refreshInfo : function(){
		var $player = $('#'+t);
		player[t].media = Math.round(100*(game-player[t].mark)/($player.find('span').get().length))/100;
		$player.find('strong').html(player[t].mark);
		$player.find('i').html('['+player[t].media+']');
		$pmark.html(player[t].mark);
	},
	back : function(){
		var $player = $('#'+t);
		var $lastdiv = $player.find('div:last');
		var $lastspan = $player.find('span:last');
		if ($('.player').find('div').get().length==1 && $('.player').find('span').get().length==0) return false;
		if ($lastdiv.find('span').get().length==0){
			$lastdiv.remove();
			_cd.changeTurn(1);
		} else{
			if (!$lastdiv.hasClass('invalid')){
				player[t].mark += getVal($player.find('span:last').html());
				$player.find('span:last').remove();
			}else{
				$lastdiv.removeClass('invalid').find('span').remove();
			}
			_cd.refreshInfo();
		}
	}
}

var _crik = {
	init : function(){c.log('init cricket');
		for(i in player)
			$('<div>',{id:i,class:'player',html:'<h2>'+player[i].name+'</h2><strong>'+player[i].mark+'</strong><i>[0]</i><ul class="cricket"><li class="15c">15</li><li class="16c">16</li><li class="17c">17</li><li class="18c">18</li><li class="19c">19</li><li class="20c">20</li><li class="25c">25</li></ul><ul class="history"></ul>'}).appendTo('#box');
		$('.player li').append('<em></em><em></em><em></em>');
		_crik.changeTurn();

	},
	destroy : function(){c.log('destroy cricket');
		$('.player').remove();
		$pname.html('');
		$pmark.html('');
		t=-1;	
	},
	doPoint : function(p){c.log('point cricket',p);
		var $player = $('#'+t);
		var trow = $player.find('div:last').find('span').get().length;
		var val = getVal(p);

		$player.find('div:last').append('<span>'+p+'</span>');

		if (/(15)|(16)|(17)|(18)|(19)|(20)|(Bull)|(Sing)/.test(p)){
			var num = (p=='Bull' || p=='Sing')?25:parseInt(/[0-9]+/.exec(p));
			var mod = (p.substr(0,1)=='D' || p=='Bull')?2:p.substr(0,1)=='T'?3:1;
			var tcr = $player.find('.'+num+'c'),tnum;
			for (var i=0;i<mod;i++){
				tnum = tcr.find('.pass').get().length;
				if (tnum<3) tcr.find('em').not('em.pass').eq(-1).addClass('pass').addClassFx('passed',500,'easeInBounce');
				else if ($('.'+num+'c .pass').get().length<3*playern) player[t].mark+=num;
			}
		}

		_crik.refreshInfo();
		$('#dart'+trow).addClass('hided').addClassFx('minop',500,'easeOutBounce');

		var win=0;
		$('.player[id!=#'+t+']').each(function(i){
			if (player[t].mark>player[i].mark) win++;
		});	
		if ($player.find('.pass').get().length==21 && win==playern-1) {_game.end(); return false;}

		if (trow==2) _crik.changeTurn();		

	},
	changeTurn : function(inverse){c.log('cambio turno cricket',inverse);
		

		if (t==-1) t=first; else if (inverse) t--; else t++;
		if (t>=playern) t = 0;
		if (t<0) t = playern-1;

		$pname.html(player[t].name);
		$pmark.html(player[t].mark);

		$('.player').removeClass('turn');
		$('#'+t).addClass('turn').find('.history').append('<div><b>'+($('#'+t).find('div').get().length+1)+'.</b></div>').scrollTop(9999);

		
		$('#darts img').stop().removeClass('hided').removeClassFx('minop',500,'easeInBounce');
	},
	refreshInfo : function(){c.log('refresh');
		var $player = $('#'+t);
		var total=0,suma=0;
		$player.find('div').each(function(){
			$(this).find('span').each(function(){
				var p = $(this).html();
				if (/(15)|(16)|(17)|(18)|(19)|(20)|(Bull)|(Sing)/.test(p)){
					var mod = (p.substr(0,1)=='D' || p=='Bull')?2:p.substr(0,1)=='T'?3:1;
					suma+=mod;
				}
			});
			total++;
		});
		player[t].media=Math.round(100*suma/total)/100;
		$player.find('strong').html(player[t].mark);
		$player.find('i').html('['+player[t].media+']');
		$pmark.html(player[t].mark);
	},
	back : function(){c.log('back cricket');

	}
}

var _game = {
	start : function(){
		var info=''; for (i in player) info+=player[i].name+';'; $.post('stats.php',{type:'start',info:info+game}); //STATS
		_mark.init();
		$('#restart').click(function(){
			_config.init();
		}).removeClass('hide');
		if (game!='Cricket') _cd.init();
		else _crik.init();
	},
	end : function(){
		_mark.destroy();
		$('#box').removeClass('b1 b2 b3 b4');
		checkContent();
		var info='';for (i in player) info+=player[i].name+'|'+player[i].media+'|'+player[i].mark+';';$.post('stats.php',{type:'end',info:info+game}); //STATS
		alert(player[t].name+' WINS!');
	},
	doPoint : function(p){
		if (game!='Cricket') _cd.doPoint(p);
		else _crik.doPoint(p);
	},
	back : function(){
		if (game!='Cricket') _cd.back();
		else _crik.back();
	},
	destroy : function(){
		_cd.destroy();
		_crik.destroy();
		$('#restart').addClass('hide').unbind();
	}
}

var _mark = {

	point : function(dig,mod,a){
		var point = mod.substr(0,1)+dig;
		if (!a) _mark.clean();
		if (point!='Sing' && point!='Bull' && point!='Out' && !/^[TD]?(1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20)$/.test(point)) return false;
		_game.doPoint(point);
	},

	clean : function(){
		$mod.html('');
		$dig.html('');
	},

	init : function(){
		_mark.destroy();
		$('#info,#dartboard').removeClass('hide');
		$('#back').click(function(){
			_game.back();
		});
		$mod = $('#mod');
		$dig = $('#dig');
		_mark.clean();
	
		$('area').mousemove(function(e){
			var val = $(this).attr('alt');
			var mod = /[tdb]/.exec(val) || '';
			var dig = /[0-9]+/.exec(val).toString();
			$mod.text(mod=='t'?'Doble':mod=='d'?'Triple':'');
			$dig.text(dig=='25'?'Sing':dig=='50'?'Bull':dig=='0'?'Out':dig);
		}).click(function(e){
			_mark.point($dig.text(),$mod.text(),1);
			e.preventDefault();
		})
	
		$('map').mouseout(this.clean);
	
		$(window).keydown(function(e){
			var checkDig = function(){
				$dig.text(function(i,dig){ 
					if (dig=='Sing' || dig=='Bull' || dig=='Out') return '';
					else return dig;
				});
			};
			var key = e.keyCode;
			if (key==84) {$mod.text('Triple'); checkDig();}
			if (key==68) {$mod.text('Doble'); checkDig();}
			if (key==66) {$dig.text('Bull');$mod.text('');}
			if (key==83) {$dig.text('Sing');$mod.text('');}
			if (key==79) {$dig.text('Out');$mod.text('');}
			if ((key>=48 && key<=57) || (key>=96 && key<=105))
				$dig.text(function(i,dig){
					key=key-(key<=57?48:96);
					if (!/^(1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20)$/.test(dig+key)) return key==0?'':key; else 
					return dig+key;
				});
	
			if (key==13 || key==32) _mark.point($dig.text(),$mod.text());
			if (key==46) _game.back();
		});
	},
	destroy : function(){
		$('#info,#dartboard').addClass('hide');
		$('area,map,#back').unbind();
		$(window).unbind();
	}
}

var _config = {
	init :function(){
		_game.destroy();
		_mark.destroy();
		_config.destroy();

		$('#box').removeClass('b1 b2 b3 b4');
		$('#cover,#configbox').removeClass('hide');

		$('input:button').click(function(){
			game = $('select').val();
			var i = 0;
			player=new Array();
			$('input:text').each(function(){
				if ($(this).val()!='') {
					player[i]={
						name : 	$(this).val(),
						media : 0,
						mark : 	parseInt(game) || 0
					}
					i++;
				}
			});
			if (player.length>0) _config.play();
		});
		checkContent();
	},
	play : function(){
		$('#box').addClass('b'+player.length);
		playern = player.length;
		checkContent();
		_config.destroy();
		_game.start();
	},
	destroy : function(){
		$('input:button').unbind();
		$('#cover,#configbox').addClass('hide');
	}
}

function checkContent(){
	var width = (window.innerWidth-$('#box').width())/2,
		height = (window.innerHeight-560)/2;
	if (width<0) width=0;
	if (height<0) height=0;
	$('#box').css({top:height+'px',left:width+'px'});
}

$(function(){

	$('#box').css({opacity:0,display:'block'}).animate({opacity:1},400);
	_config.init();

	checkContent();
	window.onresize = checkContent;
});
