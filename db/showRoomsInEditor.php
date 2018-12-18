<?php
	$floor = intval($_GET['floor']);
	$name = mysql_real_escape_string($_GET['name']);

	require 'connect.php';	
	$link = mysql_connect($host, $user, $password)
		or die('Не удалось соединиться: ' . mysql_error());
	mysql_select_db($db) or die('Не удалось выбрать базу данных');
	$query = 'SELECT * FROM interactive_map_rooms WHERE Floor = '.$floor." AND Name ='".$name."'";
	mysql_query("set names cp1251");
	$result = mysql_query($query) or die('Запрос не удался: ' . mysql_error());

	while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		$result_array [] = array(
					"idRooms" => $row["idRooms"],
					"Name" => iconv("cp1251", "UTF-8", $row["Name"]),
					"scaling_x" => $row["scaling_x"],
					"scaling_z" => $row["scaling_z"],
					"scaling_y" => $row["scaling_y"],
					"position_x" => $row["position_x"],
					"position_z" => $row["position_z"],
					"position_y" => $row["position_y"],
		);
	}

	echo json_encode($result_array);
	//echo $result;
	mysql_free_result($result);

	mysql_close($link);
?>
