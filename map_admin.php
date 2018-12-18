<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");
$APPLICATION->SetTitle("������ ����������������� ������������� �����");
?>
<link href="css\styleAdm.css" type="text/css" rel="stylesheet">
<script src="js\babylon.js"></script>
<div class="mainBlock">
	<h4 id="hint" align="center"></h4>
	<div class="map col-md-9" id="elem">
	<canvas class="canvas" id="renderCanvas" width="825" height="413" tabindex="1" style=""></canvas>
	</div>
	<div class="cabs col-md-3">
		<h4 id="roomsHead"></h4>
		<select id="elementsList">
		</select>
		<div class="buttons">
 <button onclick="deselectMesh()">�������� �����</button> <input type="checkbox" id="dragndrop"> <label for="dragndrop">�������� Drag&amp;Drop</label>
		</div>
		<div class="roomsContainer">
			<div class="editArea">
				<form class="inputs" novalidate="">
 <label for="inputRoomName">��������</label> <input type="text" id="inputRoomName" onchange="morphMesh()"> <label for="inputRoomScalingX">������</label> <input type="number" id="inputRoomScalingX" onchange="morphMesh()" step="0.05"> <label for="inputRoomScalingZ">������</label> <input type="number" id="inputRoomScalingZ" onchange="morphMesh()" step="0.05"> <label for="inputRoomPostitionX">��������� �� ��� �</label> <input type="number" id="inputRoomPostitionX" onchange="morphMesh()" step="0.05" min="-50" max="50"> <label for="inputRoomPostitionY">��������� �� ��� �</label> <input type="number" id="inputRoomPostitionY" onchange="morphMesh()" step="0.05" min="-50" max="50">
				</form>
			</div>
			<div class="buttons">
 <button onclick="addMesh()">�������� �������</button> <button onclick="deleteMesh()">������� �������</button> <button onclick="saveToDb()">��������� ���������</button>
			</div>
		</div>
	</div>
	<div class="collectives col-md-12">
		<h3 class="col-xs-12" id="collsHead"></h3>
		<div class="col-xs-12 flex-head">
			<div class="col-xs-10 flex-sub-head">
				<div class="head-item">
					 ��������
				</div>
				<div class="head-item">
					 ������ �� ����������
				</div>
				<div class="head-item">
					 ������ �� ����
				</div>
				<div class="head-item">
					 ������ �� �����
				</div>
			</div>
		</div>
		<div id="menu" class="colls">
		</div>
	</div>
	 <script src="js\sweetalert.min.js"></script> <script src="js\map_admin.js"></script>
</div><?require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");?>