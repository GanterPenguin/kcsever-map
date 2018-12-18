<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");
$APPLICATION->SetTitle("������������� �����");
?>
<link rel="stylesheet" type="text/css" href="css\style.css" >
<script src="js\babylon.js"></script>
<div class = "mainBlock" id = "main">

	<div id = "mapBlock" class="col-lg-9 ">
		<div id = "elem" allowfullscreen>
			<div class = "system">
				<button id="fsButton">������������� �����</button>
				<a href = "#login" class="link" id = "myBtn"><i class="fa fa-question-circle"></i></a>
			</div>
			<div>
				<h4 id = "roomName" align =  "center"></h4>
				<canvas class = "canvas" id="renderCanvas" ></canvas>
			</div>
		</div>
	</div>

	<div class="col-lg-3">
			 <h3 id = "selectedRoom"></h3>
			 
			 <div id = "menu">

			</div>
	</div>

	<div class="overlay"></div>
	<div class="popup">
        <form class="Form" id="form" method="post" action="#login">
            <i class="close_window fa fa-times"></i>
            <h2 class="Form__label">������������� ����� ����������� ������ "��������"</h2>
            <hr>
            <div class="FormInfo">
                <p>������������� ����� ����������� ������ "��������" - ������������� ����������� ������������� ���������� ����� ����������, 
				�������� ������������ �����������, �������� ������ �� ����������, ���� � ����� �����������.</p>
				<p>��� ���������� ������� ������������ ����� ������ ����. ������� �� ����� ������� ������������� ����� � �������� ������ � �������</p>
				<p>��� �������� �� ������ ����������� ������ ����������� ������ � ������������ �������, ����������� ����� � ����</p>
				<p>�� ������� ����� ������� ���� �� ����� �� ������������ �������� �����, � ������ ���� ����������� ���������� ����������� � ������� 
				�������� � ����� �� ������� �� ������� ����� ������� ���� �� ���� �� ����������� ���������� ������ �� ����������, ���� � ����� �������.</p>
				<p>��� �� �� ������� ������ "������������� �����" ���������� ������������ � ������������� ����� ���������. 
				
            </div>
        </form>
    </div>


<script src="js\map.js"></script>
</div> <!--mainBlock-->
<?require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");?>