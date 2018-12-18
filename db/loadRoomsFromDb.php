<?php 	
	require_once($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_before.php");
	global $DB;
	$connection = Bitrix\Main\Application::getConnection();
	$sqlHelper = $connection->getSqlHelper();
	$datiesToday = time();
	$daties = date($DB->DateFormatToPHP(CLang::GetDateFormat("SHORT")), $datiesToday);
	//echo $daties;
	$floor = intval($_GET['floor']);
	$sql = 'SELECT * FROM interactive_map_rooms WHERE Floor = '.$floor;	
	$recordset = $connection->query($sql);
	while($row = $recordset->fetch()){
		//echo $strJson = \Bitrix\Main\Web\Json::encode($row);
		$result_array [] = $row;				
	}
	echo $strJson = \Bitrix\Main\Web\Json::encode($result_array);
	/* require 'connect.php';	
	$link = mysqli_connect($host, $user, $password)
		or die('˜˜ ˜˜˜˜˜˜˜ ˜˜˜˜˜˜˜˜˜˜˜: '.mysqli_error());
	mysqli_select_db($db) or die('˜˜ ˜˜˜˜˜˜˜ ˜˜˜˜˜˜˜ ˜˜˜˜ ˜˜˜˜˜˜');
	$query = 'SELECT * FROM interactive_map_rooms WHERE Floor = '.$floor;
	$result = mysqli_query($query) or die('˜˜˜˜˜˜ ˜˜ ˜˜˜˜˜˜: '.mysqli_error());
	
	while ($row = mysqli_fetch_array($result, MYSQL_ASSOC)) {
		$result_array [] = array( 
					"idRooms" => $row["idRooms"],
					"Name" => $row["Name"],
					"scaling_x" => $row["scaling_x"],
					"scaling_z" => $row["scaling_z"], 
					"scaling_y" => $row["scaling_y"], 
					"position_x" => $row["position_x"], 
					"position_z" => $row["position_z"], 
					"position_y" => $row["position_y"],					
		);
	}
	//echo $floor;
	echo json_encode($result_array);
	
	mysql_free_result($result);

	mysql_close($link); */
?>