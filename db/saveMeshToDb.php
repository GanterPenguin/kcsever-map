<?php
	//Файл для обновления данных о помещении
	$flag = $_GET['flag'];
  $name = $_GET['name'];
  $newName = $_GET['newName'];
  $floor = intval($_GET['floor']);
	$scaling_x = floatval($_GET['scaling_x']);
  $scaling_z = floatval($_GET['scaling_z']);
  $position_x = floatval($_GET['position_x']);
  $position_y = floatval($_GET['position_y']);

	require_once($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_before.php");
	global $DB;
	$connection = Bitrix\Main\Application::getConnection();

	switch($flag){
		case 'delete':
			$query = "DELETE FROM interactive_map_rooms WHERE Name='$name'";
		break;

		case 'insert':
			$query = "INSERT INTO interactive_map_rooms (Name, Floor,  scaling_x,	scaling_z, position_x,	position_y)
			VALUES ('$name', $floor, $scaling_x, $scaling_z, $position_x, $position_y)";
		break;

		case 'update':
			$query = "UPDATE interactive_map_rooms SET Name='$newName',
      scaling_x = $scaling_x,	scaling_z = $scaling_z, position_x = $position_x,	position_y = $position_y
			WHERE Name='$name'";
		break;
	}
	$recordset = $connection->queryExecute($query);
	echo $recordset;
?>
