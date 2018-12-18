<?php
	// файл не используется оставил, чтобы сохранить код на всякий случай
	$str = mysql_real_escape_string($_GET['str']);
	
	require 'connect.php';	
	$link = mysql_connect($host, $user, $password)
		or die('Не удалось соединиться: ' . mysql_error());
	mysql_select_db($db) or die('Не удалось выбрать базу данных');

	$query = "
	SELECT interactive_map_rooms.idRooms,
	interactive_map_rooms.Name,
	interactive_map_collectives.idCollectives,
	interactive_map_collectives.NameColl,
	interactive_map_collectives.info_href,
	interactive_map_collectives.photo_href,
	interactive_map_collectives.Video_href
	FROM interactive_map_collectives,
	interactive_map_rooms
	WHERE interactive_map_collectives.Rooms_idRooms = interactive_map_rooms.idRooms
	AND interactive_map_rooms.Name = '".$str."'";

	mysql_query("set names cp1251");
	$result = mysql_query($query) or die('Запрос не удался: ' . mysql_error());

	while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		$result_array [] = array(
			"idCollectives" => $row["idCollectives"],
			"idRooms" => $row["idRooms"],
			"roomsName" => iconv("cp1251", "UTF-8", $row["Name"]),
			"collsName" => iconv("cp1251", "UTF-8", $row["NameColl"]),
			"info_href" => iconv("cp1251", "UTF-8", $row["info_href"]),
			"photo_href" => iconv("cp1251", "UTF-8", $row["photo_href"]),
			"Video_href" => iconv("cp1251", "UTF-8", $row["Video_href"]),
		);
	}

	print_r (json_encode($result_array));
	//echo $query;
	mysql_free_result($result);

	mysql_close($link);
?>
