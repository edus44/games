<?
function connect(){
	$dbhost='localhost';
	$dbusername='_user_';
	$dbuserpass='_pass_';
	$dbname='trials';	
	mysql_connect ($dbhost, $dbusername, $dbuserpass);
	mysql_select_db($dbname) or die("<h2>Error conectando con la base de datos</h2>");
}


if (isset($_GET['generate'])){
	connect();
	echo '<pre>';
	
	$trials = array();
	
	$results = mysql_query("SELECT type,sol,ask,wor FROM party");
	while($r = mysql_fetch_assoc($results)){
		$type = $r['type'];
		unset($r['type']);
		
		
		//SOLUCION
		if ($r['sol']){
			$r['sol'] = mb_strtoupper($r['sol'],'utf-8');
		}else unset($r['sol']);
		
		//PREGUNTA
		if ($r['ask']){
			$r['ask'] = '¿'.ucfirst($r['ask']).'?';
		}else unset($r['ask']);
		
		//TABUS
		if ($r['wor']){
			$wor = explode('|',$r['wor']);
			unset($wor[4]);
			foreach($wor as $k=>$w) $wor[$k] = ucfirst($w);
			$r['wor'] = implode('|',$wor);
		}else unset($r['wor']);
		
		foreach($r as $k=>$v) $r[$k] = stripslashes($v);
		
		$trials[$type][] = $r;
	}
	print_r($trials);
	$str = 'var trials = '.json_encode($trials).';';
	file_put_contents('trials/trials.js',$str);
	die();	
}


if (count($_POST)){
	connect();

	$ip = mysql_real_escape_string($_SERVER['REMOTE_ADDR']);
	$id = mysql_result(mysql_query("SELECT MAX(id)+1 FROM party"),0);
	if (!$id) $id=1;

	foreach($_POST as $type=>$vars){
		$type = mysql_real_escape_string($type);
		$str = '';
		foreach($vars as $var=>$value){
			$var = mysql_real_escape_string($var);
			$value = mysql_real_escape_string($value);
			$str .= "$var='$value',";
		}
		mysql_query("INSERT INTO party SET $str type='$type', ip='$ip', id='$id' \n");
	}
	die();
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>_
<meta_ http-equiv="Content-Type" content="text/html; charset=utf-8" />_
<titl_e>Añadidor de trials de Party</title>
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
<style type="text/css">
body{
	background-color:#eee;
}
#card{
	padding:10px;
	background-color:#FFF;
	margin:auto;
	width:500px;
	border:6px solid #922;
	border-radius:8px;
}
	#card div{
		padding:10px;
		border-bottom:1px solid #ddd;
		height:90px;
		background-position:left -90px;
		background-repeat:no-repeat;
		padding-left:120px;
	}
	#card div.c1{background-image:url(img/c1.png);}
	#card div.c2{background-image:url(img/c2.png);}
	#card div.c3{background-image:url(img/c3.png);}
	#card div.c4{background-image:url(img/c4.png);}
	#card div.c5{background-image:url(img/c5.png);}
	#card div:after{
		content:"";
		clear:both;
		height:0;
		display:block;
	}
	#card div input{
		background-color:#f4f4f4;
		border:1px solid #ddd;
		font-size:16px;
		width:360px;
		padding:6px;
		color:#222;
		display:block;
		float:left;
		margin-top:10px;
		border-radius:2px;
	}
	#card div input:focus{
		background-color:#f0f0f0;
		border:1px solid #3cc;
	}
	#card div input.wor{
		width:73px;
		margin-right:5px;
		font-size:12px;
	}
	#card div input.ask{
		width:342px;
		padding:6px 15px;
		font-size:14px;
		background:url(img/trials_input.png) center;	
	}
	#submit{
		display:block;
		cursor:pointer;
		background-color:#eee;
		font-size:18px;
		padding:10px 30px;
		margin:20px auto 10px auto;
		border:2px solid #e0e0e0;
		border-radius:3px;
		color:#666666;
		font-weight:bold;
	}
	#submit:hover{
		background-color:#ddd;
		border:2px solid #d0d0d0;
	}
</style>
<script type="text/javascript">
function reset(){
	$('#card div input').val('').filter(':first').focus();
}
$(function(){
	reset();
	$('form').submit(function(){
		var arr = {};
		var incomplete = false;
		$('#card div').each(function(){
			var t = $(this).data('type');
			arr[t] = {};
			$(this).find('input').each(function(){
				if (incomplete) return;
				var val =  $(this).val();
				if (!val.replace(/\s/g,'')) {
					incomplete = true;
					$(this).focus();
				}
				var cell = $(this).data('cell');
				if (cell=='wor'){
					if (arr[t][cell]==undefined) arr[t][cell]='';
					arr[t][cell] += val+'|';
				}else
					arr[t][cell] = val;
			});
		});
		if (!incomplete){
			$('#submit').val('Añadiendo...');
			$.post('trials.php',arr,function(){
				$('#submit').val('Añadido correctamente');
				setTimeout(function(){
					$('#submit').val('Añadir');
				},2000);
			});
			reset();
		}
		return false;
	});	
});
</script>
</head>

<body>
<div id="card">
	<form>
		<div class="c3" data-type="3">
			<input type="text" data-cell="sol" />
		</div>
		<div class="c2" data-type="2">
			<input type="text" data-cell="sol" />
		</div>
		<div class="c5" data-type="5">
			<input type="text" class="ask" data-cell="ask" />
			<input type="text" data-cell="sol" />
		</div>
		<div class="c4" data-type="4">
			<input type="text" data-cell="sol" />
		</div>
		<div class="c1" data-type="1">
			<input type="text" data-cell="sol" />
			<input type="text" class="wor" data-cell="wor" />
			<input type="text" class="wor" data-cell="wor" />
			<input type="text" class="wor" data-cell="wor" />
			<input type="text" class="wor" data-cell="wor" />
		</div>
		<input type="submit" id="submit" value="Añadir" />
	</form>
</div>

</body>
</html>