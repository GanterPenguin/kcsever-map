var canvas = document.getElementById("renderCanvas");
var elem = document.getElementById("elem");

//Firefox
$('#renderCanvas').bind('DOMMouseScroll', function(e){
    //prevent page fom scrolling
    return false;
});
//IE, Opera, Safari
$('#renderCanvas').bind('mousewheel', function(e){
    //prevent page fom scrolling
    return false;
});

var fsButton = document.getElementById("fsButton");
fsButton.onclick = function () {
  var canvas = document.getElementById("main");
  var mapBlock = document.getElementById("mapBlock");
  mapBlock.classList.toggle("col-lg-9");
  mapBlock.classList.toggle("col-lg-12");
  if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.mozRequestFullScreen) {
            canvas.mozRequestFullScreen();
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        this.innerHTML = "Вернуться";
    } else {
        this.innerHTML = "Полноэкранный режим";
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    }
}
$(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange',function(){
  var isFullScreen = document.fullScreen ||
                     document.mozFullScreen ||
                     document.webkitIsFullScreen;
  var fsButton = document.getElementById("fsButton");
  if(isFullScreen){
      fsButton.innerHTML = "Вернуться";
      }else{
      fsButton.innerHTML = "Полноэкранный режим";
      }
});

var engine = null;
var scene = null;
var floor = 1;
var pickedMeshes = [];

loadScene();
loadFloor(floor);
loadMenu();
loadFromDb(floor);
//scene.debugLayer.show();

function loadScene(){
	engine = new BABYLON.Engine(canvas, true);
	scene = new BABYLON.Scene(engine);
	var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 10, 0), scene);
	light.intensity = 0.75;
	light.range = 1;

	var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(0, 0, 0), scene);
	camera.attachControl(canvas, true);
	camera.lowerRadiusLimit = 6;
	camera.upperRadiusLimit = 18;
	camera.useAutoRotationBehavior = true;
  camera.speed = 0.2;

	var ground = BABYLON.Mesh.CreateGround("ground", 50, 50, 0, scene);

	scene.collisionsEnabled = true;

	camera.checkCollisions = true;
	ground.checkCollisions = true;

  var envTexture = new BABYLON.CubeTexture("skybox/", scene);
  scene.createDefaultSkybox(envTexture, true, 1000);
  envTexture.isPickable = false;

	engine.runRenderLoop(function (){scene.render()});
  pickedMeshes = [];
	window.addEventListener("resize", function (){engine.resize()});
}

function loadMenu() {
	var UI = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
	var tooltip = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("tooltip");
	var tooltipRect = new BABYLON.GUI.Rectangle("tooltipRect");
	var tooltipTextBlock = new BABYLON.GUI.TextBlock();
	tooltipRect.background = "black"
	tooltipRect.height = "45px";
	tooltipRect.alpha = 0.5;
	tooltipRect.width = "150px";
	tooltipRect.cornerRadius = 15;
	tooltipRect.thickness = 1;
	tooltipRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
	tooltipRect.top = "50px";
	tooltipRect.left = "0px";
	tooltipTextBlock.color = "white";
	tooltipTextBlock.fontSize = 15;

	if (floor != 3){
		var buttonUp = BABYLON.GUI.Button.CreateImageOnlyButton("but", "img\\up.png");
		buttonUp.width = "50px";
		buttonUp.height = "50px";
		buttonUp.color = "gray";
		buttonUp.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
		buttonUp.top = "100px";
		buttonUp.left = "0px";
		UI.addControl(buttonUp);

		buttonUp.onPointerDownObservable.add(function() {
			floor++;
			scene.dispose();
			engine.dispose();
			loadScene();
			loadMenu();
			loadFloor(floor);
			loadFromDb(floor);
		});

		buttonUp.onPointerEnterObservable.add(function(){
			tooltip.addControl(tooltipRect);
			tooltipTextBlock.text = "Перейти на этаж " + (floor+1);
			tooltipRect.addControl(tooltipTextBlock);
		});

		buttonUp.onPointerOutObservable.add(function(){
			tooltipRect.removeControl(tooltipTextBlock);
			tooltip.removeControl(tooltipRect);
		});
	}

	if (floor != 1){
		var buttonDown = BABYLON.GUI.Button.CreateImageOnlyButton("but", "img\\down.png");
		buttonDown.width = "50px";
		buttonDown.height = "50px";
		buttonDown.color = "gray";
		buttonDown.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
		buttonDown.top = "155px";
		buttonDown.left = "0px";
		UI.addControl(buttonDown);

		buttonDown.onPointerDownObservable.add(function() {
			floor--;
			scene.dispose();
			engine.dispose();
			loadScene();
			loadMenu();
			loadFloor(floor);
			loadFromDb(floor);
		});

		buttonDown.onPointerEnterObservable.add(function(){
			tooltip.addControl(tooltipRect);
			tooltipTextBlock.text = "Перейти на этаж " + (floor-1);
			if(floor == 3){
				tooltipRect.top = "100px";
			}
			tooltipRect.addControl(tooltipTextBlock);
		});

		buttonDown.onPointerOutObservable.add(function(){
			tooltipRect.removeControl(tooltipTextBlock);
			tooltip.removeControl(tooltipRect);
		});
	}

	var floorLabel = new BABYLON.GUI.Rectangle("floorLabel");
	floorLabel.background = "black"
	floorLabel.height = "45px";
	floorLabel.alpha = 0.5;
	floorLabel.width = "150px";
	floorLabel.cornerRadius = 15;
	floorLabel.thickness = 1;
	floorLabel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
	UI.addControl(floorLabel);
	var floorLabelText = new BABYLON.GUI.TextBlock();
	floorLabelText.text = "Этаж " + floor;
	floorLabelText.color = "white";
	floorLabelText.fontSize = 22;
	floorLabel.addControl(floorLabelText);
}

function loadFloor(floor){
	switch (floor)  {
		default:
		case 1:
			var floorName = "1.babylon";
		break;
		case 2:
			floorName = "2.babylon";
		break;
		case 3:
			floorName = "3.babylon";
		break;
		}
	var assetsManager = new BABYLON.AssetsManager(scene);
	var meshTask = assetsManager.addMeshTask("task", "", "src/", floorName);
	meshTask.onError = function (task, message, exception) {
		console.log(message);
	}
	assetsManager.load();
}

function makeOverOut (mesh) {
	mesh.actionManager = new BABYLON.ActionManager(scene);
	mesh.actionManager.registerAction(
		new BABYLON.ExecuteCodeAction(
			BABYLON.ActionManager.OnPointerOverTrigger,
				function(){
						mesh.material.alpha = 0.7;
						var roomName = mesh.name;
						document.getElementById("roomName").innerHTML=roomName;
				}
		)
	);
	mesh.actionManager.registerAction(
		new BABYLON.ExecuteCodeAction(
			BABYLON.ActionManager.OnPointerOutTrigger,
				function(){
					if (pickedMeshes.length){
						if (mesh.name != pickedMeshes[pickedMeshes.length-1].name){
							mesh.material.alpha = 0.3;
							var roomName = mesh.name;
							document.getElementById("roomName").innerHTML=roomName;
						}
					} else {
						mesh.material.alpha = 0.3;
						var roomName = mesh.name;
						document.getElementById("roomName").innerHTML=roomName;
					}
			}
		));
}

canvas.addEventListener("click", function () {
	pickResult = scene.pick(scene.pointerX, scene.pointerY);
	var selectedRoom;
		if (pickResult.pickedMesh
		&& pickResult.pickedMesh.name.indexOf("Curve") == -1
		&& pickResult.pickedMesh.name != "ground"
		&& pickResult.pickedMesh.name != "hdrSkyBox"
		&& pickResult.pickedMesh.name != "plane1") {
			pickedMeshes.push(pickResult.pickedMesh);
			pickResult.pickedMesh.material.alpha = 0.7;
			pickResult.pickedMesh.material.diffuseColor = BABYLON.Color3.Blue();
			selectedRoom = pickResult.pickedMesh.name;
			document.getElementById("selectedRoom").innerHTML=selectedRoom;

			scene.meshes.forEach(function (m) {
				if(pickedMeshes.length){
					if (m.name.indexOf("Curve") == -1 && m.name != "ground" && m.name != "hdrSkyBox" && m.name != "plane1" && m.name != pickedMeshes[pickedMeshes.length-1].name) {
						var mat = new BABYLON.StandardMaterial("mat", scene);
						mat.diffuseColor = BABYLON.Color3.Blue();
						mat.alpha = 0.3;
						m.material = mat;
					}
					pickedMeshes.forEach(function (pm){
						if(pm.name == m.name && m.name != "plane1" && m.name != pickedMeshes[pickedMeshes.length-1].name){
							var mat = new BABYLON.StandardMaterial("mat", scene);
							mat.diffuseColor = BABYLON.Color3.Purple();
							mat.alpha = 0.3;
							m.material = mat;
						}
					});
				}
			});
		}

		if(selectedRoom){
			var menu = document.getElementById("menu");
			menu.innerHTML = "";
			var collsLabel = document.getElementById("collsLabel");
			//if (selectedRoom == "Музей" || selectedRoom == "Главное Фойе" || selectedRoom == "Женское Фойе" || selectedRoom == "Мужское Фойе" || selectedRoom == "Зрительный зал" || selectedRoom == "Сцена" || selectedRoom == "Администрация"){
			//	collsLabel.style.display = "hidden";
			//} else {
			//	collsLabel.style.display = "inline";
			//}
		if (window.XMLHttpRequest) {
					// code for IE7+, Firefox, Chrome, Opera, Safari
					xmlhttp=new XMLHttpRequest();
		} else { // code for IE6, IE5
					xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.onreadystatechange=function() {
			if (this.readyState==4 && this.status==200) {
				var response = this.responseText;
								response = JSON.parse(response);
								if(response){
									for(let i in response) {
									let item = response[i];
									let newBtn = $('<button>')
										.addClass('menubtn button')
										.data('info', (item['info_href'] ? item['info_href'] : ''))
										.data('photo', (item['photo_href'] ? item['photo_href'] : ''))
										.data('video', (item['Video_href'] ? item['Video_href'] : ''))
										.text(item.NameColl);
										$('<div/>').addClass('club').append(newBtn).appendTo('#menu');
									}
							}
			}
	}
		xmlhttp.open("GET","db/loadCollectivesFromDb.php?&str=" + selectedRoom,true);
		xmlhttp.send();
	}
});

$(document).on('click', '.menubtn', function(){
		let _parent = $(this).parent();

		let _info = $(this).data('info');
		let _photo = $(this).data('photo');
		let _video = $(this).data('video');

		$('.link', _parent.parent()).remove();

		if(_info) {
			_parent.append('<a class="link" href="' + _info + '" target="_blank" title="Перейти на страницу с информацией"><i class="fa fa-info-circle"></i></a>');
		}

		if(_photo) {
			_parent.append('<a class="link" href="' + _photo + '" target="_blank" title="Перейти к фотографиям"><i class="fa fa-camera-retro"></i></a>');
		}

		if(_video) {
			_parent.append('<a class="link" href="' + _video + '" target="_blank" title="Перейти к видео"><i class="fa fa-file-movie-o"></a>');
		}

});

function loadFromDb(floor){
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	} else { // code for IE6, IE5
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function() {
			if (this.readyState==4 && this.status==200) {
						var response = this.response;
						response = JSON.parse(response);
						for(var i = 0; i < response.length; i++){
										var mat = new BABYLON.StandardMaterial("mat"+i, scene);
										mat.diffuseColor = BABYLON.Color3.Blue();
										mat.alpha = 0.3;
										var rect = BABYLON.MeshBuilder.CreateBox(response[i].Name, {height: 1, width: 1, depth: 0}, scene);
										rect.scaling.x = response[i].scaling_x;
										rect.scaling.z = response[i].scaling_z;
										rect.scaling.y = response[i].scaling_y;
										rect.position = new BABYLON.Vector3(response[i].position_x, response[i].position_z, response[i].position_y);
										rect.material = mat;
										makeOverOut(rect);

						}
			}
	}
	xmlhttp.open("GET","db/loadRoomsFromDb.php?floor=" + floor,true);
	xmlhttp.send();
}

$('.popup .close_window, .overlay').click(function (){
	$('.popup, .overlay').css({'opacity':'0', 'visibility':'hidden'});
});
$('a[href="#login"]').click(function (e){
	e.preventDefault();
	$('.popup, .overlay').css({'opacity':'1', 'visibility':'visible'});
});
