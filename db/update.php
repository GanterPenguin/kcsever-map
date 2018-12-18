<?php
	//Файл для обновления данных о коллективах
	$flag = $_GET['flag'];
	$id = $_GET['id'];
	$str = $_GET['str'];
	$name = $_GET['collName'];
	$inputInfo_href = $_GET['Info_href'];
	$inputPhoto_href = $_GET['Photo_href'];
	$inputVideo_href = $_GET['Video_href'];
	require_once($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_before.php");
	global $DB;
	$connection = Bitrix\Main\Application::getConnection();
	
	switch($flag){
		case 'delete':
			$query = "DELETE FROM interactive_map_collectives WHERE idCollectives=".$id;
		break;

		case 'insert':
			$query = "INSERT INTO interactive_map_collectives (NameColl, Rooms_idRooms, info_href, photo_href, Video_href)
			VALUES ('".$name."',(SELECT idRooms FROM interactive_map_rooms WHERE Name = '".$str."'), '".$inputInfo_href."', '".$inputPhoto_href."', '".$inputVideo_href."')";
		break;

		case 'update':
			$query = "UPDATE interactive_map_collectives SET NameColl='".$name."', info_href ='".$inputInfo_href."', photo_href='".$inputPhoto_href."', Video_href='".$inputVideo_href."'
			WHERE idCollectives=".$id;
		break;
	}
	$recordset = $connection->queryExecute($query);
	// while($row = $recordset->fetch()){
	// 	$result_array [] = $row;				
	// }
	//$res = $DB->Query($query, false);
	echo $recordset;
?>
