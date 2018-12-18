<?php
	require_once($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_before.php");
	global $DB;
	$connection = Bitrix\Main\Application::getConnection();
	$sqlHelper = $connection->getSqlHelper();
	$str = $_GET['str'];
	$sql = "
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
	//echo $str;
	$recordset = $connection->query($sql);
	while($row = $recordset->fetch()){
		//echo $sql;
		$result_array [] = $row;				
	}
	echo $strJson = \Bitrix\Main\Web\Json::encode($result_array);
	
	/* require 'connect.php';	
	$link = mysqli_connect($host, $user, $password)
		or die('�� ������� �����������: ' . mysql_error());
	mysql_select_db($db) or die('�� ������� ������� ���� ������');

	$query = "
	SELECT interactive_map_rooms.idRooms,
	interactive_map_rooms.Name,
	interactive_map_collectives.NameColl,
	interactive_map_collectives.info_href,
	interactive_map_collectives.photo_href,
	interactive_map_collectives.video_href
	FROM interactive_map_collectives,
	interactive_map_rooms
	WHERE interactive_map_collectives.Rooms_idRooms = interactive_map_rooms.idRooms
	AND interactive_map_rooms.Name = '".$str."'";
	
	mysql_query("set names cp1251");
	$result = mysql_query($query) or die('������ �� ������: ' . mysql_error());

	while ($row = mysql_fetch_array($result, MYSQL_ASSOC)) {
		$result_array [] = array(
			"idRooms" => $row["idRooms"],
			"roomsName" => iconv("cp1251", "UTF-8", $row["Name"]),
			"collsName" => iconv("cp1251", "UTF-8", $row["NameColl"]),
			"info_href" => $row["info_href"],
			"photo_href" => $row["photo_href"],
			"video_href" => $row["video_href"],
		);
	}
	
	print_r (json_encode($result_array));
	//echo $query;
	mysql_free_result($result);

	mysql_close($link); */
?>
