<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");
$APPLICATION->SetTitle("Интерактивная карта");
?>
<link rel="stylesheet" type="text/css" href="css\style.css" >
<script src="js\babylon.js"></script>
<div class = "mainBlock" id = "main">

	<div id = "mapBlock" class="col-lg-9 ">
		<div id = "elem" allowfullscreen>
			<div class = "system">
				<button id="fsButton">Полноэкранный режим</button>
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
            <h2 class="Form__label">Интерактивная карта культурного центра "Северный"</h2>
            <hr>
            <div class="FormInfo">
                <p>Интерактивная карта культурного центра "Северный" - предоставляет возможность просматривать трехмерные схемы учреждения, 
				узнавать расположение коллективов, получать ссылки на информацию, фото и видео коллективов.</p>
				<p>Для управления камерой используется левая кнопка мыши. Нажмите на любую область интерактивной карты и потяните курсор в сторону</p>
				<p>Для перехода по этажам культурного центра используйте кнопки с озображением стрелок, указывающих вверх и вниз</p>
				<p>По нажатию левой кнопкой мыши на одной из подсвеченных областей карты, в правом меню отобразятся коллективы привязанные к данному 
				кабинету и далее вы сможете по нажатию левой кнопкой мыши на один из коллективов отобразить ссылки на информацию, фото и видео контент.</p>
				<p>Так же по нажатию кнопки "Полноэкранный режим" приложение переключится в полноэкранный режим просмотра. 
				
            </div>
        </form>
    </div>


<script src="js\map.js"></script>
</div> <!--mainBlock-->
<?require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");?>