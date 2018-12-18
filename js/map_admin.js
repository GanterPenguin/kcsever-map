//Получение элемента canvas для рендера
var canvas = document.getElementById("renderCanvas");

//Блокирование прокрутки страницы при наведении на canvas в Firefox
$("#renderCanvas").bind("DOMMouseScroll", function(e){
	if(e.originalEvent.detail > 0) {
		//scroll down
	}else {
		//scroll up
	}
	//prevent page fom scrolling
	return false;
});

//Блокирование прокрутки страницы при наведении на canvas в IE, Opera, Safari
$("#renderCanvas").bind("mousewheel", function(e){
	if(e.originalEvent.wheelDelta < 0) {
		//scroll down
	}else {
		//scroll up
	}
	//prevent page fom scrolling
	return false;
});


var engine = null;
var scene = null;
var floor = 1;
var ground = null;
var camera = null;
var pickedMeshes = [];

loadScene();
loadMenu();
loadFloor(floor);
loadFromDb(floor);

//scene.debugLayer.show();
var pickResult = scene.pick(scene.pointerX, scene.pointerY);


//Загрузка сцены
function loadScene(){
	engine = new BABYLON.Engine(canvas, true);
	scene = new BABYLON.Scene(engine);
	var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 400, 0), scene);
	light.intensity = 0.75;


	camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 10, 0), scene);
	camera.setTarget(BABYLON.Vector3.Zero());
	camera.speed = 0.02;

	camera.inputs.removeByType("FreeCameraKeyboardMoveInput");
	camera.attachControl(canvas, true);
	camera.direction = new BABYLON.Vector3(Math.cos(camera.angle), 0, Math.sin(camera.angle));


	var FreeCameraKeyboardWalkInput = function () {
		this._keys = [];
		this.keysUp = [87];
		this.keysDown = [83];
		this.keysLeft = [65];
		this.keysRight = [68];
		this.keysShift = [69];
		this.keysAlt = [81];
	};

	FreeCameraKeyboardWalkInput.prototype.attachControl = function (element, noPreventDefault) {
		var _this = this;
		if (!this._onKeyDown) {
			element.tabIndex = 1;
			this._onKeyDown = function (evt) {
				if (_this.keysUp.indexOf(evt.keyCode) !== -1 ||
                        _this.keysDown.indexOf(evt.keyCode) !== -1 ||
                        _this.keysLeft.indexOf(evt.keyCode) !== -1 ||
                        _this.keysRight.indexOf(evt.keyCode) !== -1 ||
                        _this.keysShift.indexOf(evt.keyCode) !== -1 ||
                        _this.keysAlt.indexOf(evt.keyCode) !== -1 ) {
					var index = _this._keys.indexOf(evt.keyCode);
					if (index === -1) {
						_this._keys.push(evt.keyCode);
					}
					if (!noPreventDefault) {
						evt.preventDefault();
					}
				}
			};
			this._onKeyUp = function (evt) {
				if (_this.keysUp.indexOf(evt.keyCode) !== -1 ||
                        _this.keysDown.indexOf(evt.keyCode) !== -1 ||
                        _this.keysLeft.indexOf(evt.keyCode) !== -1 ||
                        _this.keysRight.indexOf(evt.keyCode) !== -1 ||
                        _this.keysShift.indexOf(evt.keyCode) !== -1 ||
                        _this.keysAlt.indexOf(evt.keyCode) !== -1 ) {
					var index = _this._keys.indexOf(evt.keyCode);
					if (index >= 0) {
						_this._keys.splice(index, 1);
					}
					if (!noPreventDefault) {
						evt.preventDefault();
					}
				}
			};
			element.addEventListener("keydown", this._onKeyDown, false);
			element.addEventListener("keyup", this._onKeyUp, false);
			BABYLON.Tools.RegisterTopRootEvents([
				{ name: "blur", handler: this._onLostFocus }
			]);
		}
	};

	FreeCameraKeyboardWalkInput.prototype.detachControl = function (element) {
		if (this._onKeyDown) {
			element.removeEventListener("keydown", this._onKeyDown);
			element.removeEventListener("keyup", this._onKeyUp);
			BABYLON.Tools.UnregisterTopRootEvents([
				{ name: "blur", handler: this._onLostFocus }
			]);
			this._keys = [];
			this._onKeyDown = null;
			this._onKeyUp = null;
		}
	};

	FreeCameraKeyboardWalkInput.prototype.checkInputs = function () {
		if (this._onKeyDown) {
			var camera = this.camera;
			for (var index = 0; index < this._keys.length; index++) {
				var keyCode = this._keys[index];
				var speed = camera.speed;
				if (this.keysLeft.indexOf(keyCode) !== -1) {
					camera.direction.copyFromFloats(-speed, 0, 0);
				}
				else if (this.keysUp.indexOf(keyCode) !== -1) {
					camera.direction.copyFromFloats(0, 0, speed);
				}
				else if (this.keysRight.indexOf(keyCode) !== -1) {
					camera.direction.copyFromFloats(speed, 0, 0);
				}
				else if (this.keysDown.indexOf(keyCode) !== -1) {
					camera.direction.copyFromFloats(0, 0, -speed);
				}

				else if (this.keysShift.indexOf(keyCode) !== -1) {
					camera.direction.copyFromFloats(0, speed, 0);
				}

				else if (this.keysAlt.indexOf(keyCode) !== -1) {
					camera.direction.copyFromFloats(0, -speed, 0);
				}
				if (camera.getScene().useRightHandedSystem) {
					camera.direction.z *= -1;
				}
				camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
				BABYLON.Vector3.TransformNormalToRef(camera.direction, camera._cameraTransformMatrix, camera._transformedDirection);
				camera.cameraDirection.addInPlace(camera._transformedDirection);
			}
		}
	};

	FreeCameraKeyboardWalkInput.prototype._onLostFocus = function (e) {
		this._keys = [];
	};

	FreeCameraKeyboardWalkInput.prototype.getTypeName = function () {
		return "FreeCameraKeyboardWalkInput";
	};

	FreeCameraKeyboardWalkInput.prototype.getSimpleName = function () {
		return "keyboard";
	};

	camera.inputs.add(new FreeCameraKeyboardWalkInput());

	ground = BABYLON.Mesh.CreateGround("ground", 100, 100, 0, scene);

	scene.collisionsEnabled = true;
	camera.checkCollisions = true;
	ground.checkCollisions = true;

	engine.runRenderLoop(function (){scene.render();});
	pickedMeshes = [];
	window.addEventListener("resize", function (){engine.resize();});

	var startingPoint;
	var currentMesh;

	var getGroundPosition = function () {
	// Use a predicate to get position on the ground
		var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == ground; });
		if (pickinfo.hit) {
			return new BABYLON.Vector3(pickinfo.pickedPoint.x, 0, pickinfo.pickedPoint.z);
		}

	 return null;
	};

	var onPointerDown = function (evt) {
		if (evt.button !== 0) {
			return;
		}

		// check if we are under a mesh
		var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh !== ground; });
		if (pickInfo.hit) {
			if (pickInfo.pickedMesh.name.indexOf("Curve") == -1 ) {
				currentMesh = pickInfo.pickedMesh;
				startingPoint = getGroundPosition(evt);

				if (startingPoint) { // we need to disconnect camera from canvas
					setTimeout(function () {
						camera.detachControl(canvas);
					}, 0);
				}
			}
		}
	};

	var onPointerUp = function () {
		if (startingPoint) {
			camera.attachControl(canvas, true);
			startingPoint = null;
			return;
		}
	};

	var onPointerMove = function (evt) {
		if (!startingPoint) {
			return;
		}

		var current = getGroundPosition(evt);

		if (!current) {
			return;
		}

		var diff = current.subtract(startingPoint);
		currentMesh.position.addInPlace(diff);
		startingPoint = current;

	};
	var dngCheckbox = document.getElementById("dragndrop");
	dngCheckbox.checked = false;
	dngCheckbox.onchange = function () {
		if(dngCheckbox.checked){
			canvas.addEventListener("pointerdown", onPointerDown, false);
			canvas.addEventListener("pointerup", onPointerUp, false);
			canvas.addEventListener("pointermove", onPointerMove, false);

			scene.onDispose = function () {
				canvas.removeEventListener("pointerdown", onPointerDown);
				canvas.removeEventListener("pointerup", onPointerUp);
				canvas.removeEventListener("pointermove", onPointerMove);
			};
		}else {
			canvas.removeEventListener("pointerdown", onPointerDown);
			canvas.removeEventListener("pointerup", onPointerUp);
			canvas.removeEventListener("pointermove", onPointerMove);
		}
	};
}

//Загрузка трехмерных моделей КЦ
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
	};
	assetsManager.load();
}

//Создание пользовательнского интерфейса в canvas
function loadMenu() {
	var menu = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("menu");

	if (floor != 3){
		var buttonUp = BABYLON.GUI.Button.CreateImageOnlyButton("but", "img/up.png");
		buttonUp.width = "50px";
		buttonUp.height = "50px";
		buttonUp.color = "gray";
		buttonUp.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
		buttonUp.top = "100px";
		buttonUp.left = "0px";
		menu.addControl(buttonUp);

		buttonUp.onPointerDownObservable.add(function() {
			floor++;
			scene.dispose();
			engine.dispose();
			loadScene();
			loadMenu();
			loadFloor(floor);
			loadFromDb(floor);
			deselectMesh();
		});
	}

	if (floor != 1){
		var buttonDown = BABYLON.GUI.Button.CreateImageOnlyButton("but", "img/down.png");
		buttonDown.width = "50px";
		buttonDown.height = "50px";
		buttonDown.color = "gray";
		buttonDown.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
		buttonDown.top = "155px";
		buttonDown.left = "0px";
		menu.addControl(buttonDown);

		buttonDown.onPointerDownObservable.add(function() {
			floor--;
			scene.dispose();
			engine.dispose();
			loadScene();
			loadMenu();
			loadFloor(floor);
			loadFromDb(floor);
			deselectMesh();
		});
	}

	var text = new BABYLON.GUI.Rectangle("label");
	text.background = "black";
	text.height = "45px";
	text.alpha = 0.5;
	text.width = "150px";
	text.cornerRadius = 15;
	text.thickness = 1;
	text.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
	menu.addControl(text);
	var TextBlock = new BABYLON.GUI.TextBlock();
	TextBlock.text = "Этаж " + floor;
	TextBlock.color = "white";
	TextBlock.fontSize = 22;
	text.addControl(TextBlock);
}

//Добавление подсветки помещений
function makeOverOut (mesh) {
	mesh.actionManager = new BABYLON.ActionManager(scene);
	mesh.actionManager.registerAction(
		new BABYLON.ExecuteCodeAction(
			BABYLON.ActionManager.OnPointerOverTrigger,
			function(){
				mesh.material.alpha = 0.7;
				var roomName = mesh.name;
				document.getElementById("hint").innerHTML=roomName;
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
						document.getElementById("hint").innerHTML=roomName;
					}
				} else {
					mesh.material.alpha = 0.3;
					var roomName = mesh.name;
					document.getElementById("hint").innerHTML=roomName;
				}
			}
		));
}


canvas.addEventListener("click", function () {
	pickResult = scene.pick(scene.pointerX, scene.pointerY);
	if(pickResult != null && pickResult.pickedMesh){
		if (pickResult.pickedMesh.name.indexOf("Curve") == -1 && pickResult.pickedMesh.name != "ground") {
			pickedMeshes.push(pickResult.pickedMesh);
			pickResult.pickedMesh.material.alpha = 0.7;
			scene.meshes.forEach(function (m) {
				if(pickedMeshes.length){
					if (m.name.indexOf("Curve") == -1 && m.name != "ground"
              && m.name != pickedMeshes[pickedMeshes.length-1].name
					) {
						m.material.alpha = 0.3;
					}
				}
			});

			var roomName = pickResult.pickedMesh.name;
			document.getElementById("collsHead").innerHTML=roomName;
			document.getElementById("roomsHead").innerHTML=roomName;
			
			pickMesh(roomName);
			showRoomsInEditor(roomName);
		}
	}
});

//Отображение редактора коллективов
function pickMesh (str) {
	var menu = document.getElementById("menu");
	menu.innerHTML = "";
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
				for(var i = 0; i < response.length; i++){
					var parentElem = document.getElementById("menu");
					var containerDiv = document.createElement("div");
					containerDiv.className = "club";
					parentElem.appendChild(containerDiv);

					var divColLg1 = document.createElement("div");
					divColLg1.className = "col-lg-1 nopadding";
					var parentElem = document.getElementById("menu");
					containerDiv.appendChild(divColLg1);

					var div = document.createElement("div");
					div.className = "club col-lg-10";
					div.id = "club"+i;
					var parentElem = document.getElementById("menu");
					containerDiv.appendChild(div);
					var parentElemDiv = document.getElementById("club" + i);
					var delButton = document.createElement("button");
					delButton.innerHTML = "<i class='fa fa-trash'></i>";
					delButton.style.width="100%";
					delButton.style.fontSize = "22px";
					delButton.onclick = deleteRow;
					divColLg1.appendChild(delButton);

					var inpt = document.createElement("input");
					inpt.type = "text";
					inpt.id = "inputId";
					inpt.value = response[i].idCollectives;
					inpt.type="hidden";
					parentElemDiv.appendChild(inpt);

					var inpt = document.createElement("input");
					inpt.type = "text";
					inpt.id = "inputCollsName";
					inpt.value = response[i].NameColl;
					parentElemDiv.appendChild(inpt);

					var inpt = document.createElement("input");
					inpt.type = "text";
					inpt.id = "inputInfo_href";
					inpt.value = response[i].info_href;
					parentElemDiv.appendChild(inpt);

					var inpt = document.createElement("input");
					inpt.type = "text";
					inpt.id = "inputPhoto_href";
					inpt.value = response[i].photo_href;
					parentElemDiv.appendChild(inpt);

					var inpt = document.createElement("input");
					inpt.type = "text";
					inpt.id = "inputVideo_href";
					inpt.value = response[i].Video_href;
					parentElemDiv.appendChild(inpt);

					var divColLg1 = document.createElement("div");
					divColLg1.className = "col-lg-1 nopadding";
					var parentElem = document.getElementById("menu");
					containerDiv.appendChild(divColLg1);

					var saveButton = document.createElement("button");
					saveButton.innerHTML = "&#10003";
					saveButton.style.width="100%";
					saveButton.style.fontSize = "22px";
					divColLg1.appendChild(saveButton);
					saveButton.onclick = saveChanges;


				}
			}
			var parentElem = document.getElementById("menu");
			var addButton = document.createElement("button");
			addButton.innerHTML = "Добавить";
			addButton.id = "addButton";
			parentElem.appendChild(addButton);
			addButton.onclick = addRowCollective;
		}


	};
	xmlhttp.open("GET","db/loadCollectivesFromDb.php?str=" + str + "&ver=" + Math.random(),true);
	xmlhttp.send();
}

//Добавление пустой строки в редактор коллективов
function addRowCollective() {

	var parentElem = document.getElementById("menu");
	var containerDiv = document.createElement("div");
	containerDiv.className = "club";
	parentElem.insertBefore(containerDiv, addButton);

	var divColLg1 = document.createElement("div");
	divColLg1.className = "col-lg-1 nopadding";
	var parentElem = document.getElementById("menu");
	containerDiv.appendChild(divColLg1);

	var div = document.createElement("div");
	div.className = "club col-lg-10";
	div.id = "club";
	var parentElem = document.getElementById("menu");
	containerDiv.appendChild(div);
	var parentElemDiv = document.getElementById("club");
	var delButton = document.createElement("button");
	delButton.innerHTML = "<i class='fa fa-trash'></i>";
	delButton.style.width="100%";
	delButton.style.fontSize = "22px";
	delButton.onclick = deleteRow;
	divColLg1.appendChild(delButton);

	var inpt = document.createElement("input");
	inpt.type = "text";
	inpt.id = "inputId";
	inpt.type="hidden";
	div.appendChild(inpt);

	var inpt = document.createElement("input");
	inpt.type = "text";
	inpt.id = "inputCollsName";
	div.appendChild(inpt);

	var inpt = document.createElement("input");
	inpt.type = "text";
	inpt.id = "inputInfo_href";
	div.appendChild(inpt);

	var inpt = document.createElement("input");
	inpt.type = "text";
	inpt.id = "inputPhoto_href";
	div.appendChild(inpt);

	var inpt = document.createElement("input");
	inpt.type = "text";
	inpt.id = "inputVideo_href";
	div.appendChild(inpt);

	var divColLg1 = document.createElement("div");
	divColLg1.className = "col-lg-1 nopadding";
	var parentElem = document.getElementById("menu");
	containerDiv.appendChild(divColLg1);

	var saveButton = document.createElement("button");
	saveButton.innerHTML = "&#10003";
	saveButton.style.width="100%";
	saveButton.style.fontSize = "22px";
	divColLg1.appendChild(saveButton);
	saveButton.onclick = saveChanges;
}

//Сохранение изменений коллективов
function saveChanges(){
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	} else { // code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	var sibs = getSiblings(this.parentElement);
	var div = sibs[1];
	for (var i = 0; i < div.children.length; i++){
		if(div.children[i].matches("input#inputId")){
			var inputId = div.children[i].value;
		}
		if(div.children[i].matches("input#inputCollsName")){
			var inputCollsName = div.children[i].value;
		}
		if(div.children[i].matches("input#inputInfo_href")){
			var inputInfo_href = div.children[i].value;
		}
		if(div.children[i].matches("input#inputPhoto_href")){
			var inputPhoto_href = div.children[i].value;
		}
		if(div.children[i].matches("input#inputVideo_href")){
			var inputVideo_href = div.children[i].value;
		}
	}
	xmlhttp.onreadystatechange=function() {
		if (this.readyState==4 && this.status==200) {
			if(!this.responseText){
				swal("Успешно!", "Изменения сохранены.", "success");
				meshName = document.getElementById("roomsHead").innerHTML;
				var mesh = scene.getMeshByName(meshName);
				mesh.material.diffuseColor = BABYLON.Color3.Blue();
			}else{
				swal("Ошибка!", this.responseText, "error");
			}
		}else{
			swal("Ошибка!", "Изменения не были сохранены.", "error");
		}
	};

	if(inputId){
		var flag = "update";
	}else{
		var flag = "insert";
	}
	var room = document.getElementById("collsHead");
	xmlhttp.open("GET","db/update.php?flag=" + flag + "&id=" + inputId + "&str=" +
        room.innerHTML + "&collName=" + inputCollsName + "&Info_href=" + inputInfo_href +
        "&Photo_href=" + inputPhoto_href + "&Video_href=" + inputVideo_href,true);
	xmlhttp.send();
}

//Функция получения дочерних элементов DOM объекта
var getSiblings = function (elem) {
	var siblings = [];
	var sibling = elem.parentNode.firstChild;
	for (; sibling; sibling = sibling.nextSibling) {
		if (sibling.nodeType !== 1 || sibling === elem) continue;
		siblings.push(sibling);
	}
	return siblings;
};

//Удаление строки\коллектива в редакторе коллективов
function deleteRow(){
	var sibs = getSiblings(this.parentElement);
	var div = sibs[0];
	for (var i = 0; i < div.children.length; i++){
		if(div.children[i].matches("input#inputId")){
			var inputId = div.children[i].value;
		}
		if(div.children[i].matches("input#inputCollsName")){
			var inputCollsName = div.children[i].value;
		}
		if(div.children[i].matches("input#inputInfo_href")){
			var inputInfo_href = div.children[i].value;
		}
		if(div.children[i].matches("input#inputPhoto_href")){
			var inputPhoto_href = div.children[i].value;
		}
	}

	if(inputId || inputCollsName || inputInfo_href || inputPhoto_href){
		swal({
			title: "Вы уверенны что хотите удалить эту строку?",
			text: "После удаления данные будет нельзя восстановить!",
			icon: "warning",
			buttons: ["Отмена", "Удалить"],
			dangerMode: true,
		})
		.then((willDelete) => {
			if (willDelete) {							
				if (window.XMLHttpRequest) {
					// code for IE7+, Firefox, Chrome, Opera, Safari
					xmlhttp=new XMLHttpRequest();
				} else { // code for IE6, IE5
					xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
				}
				xmlhttp.onreadystatechange=function() {
					if (this.readyState==4 && this.status==200) {
						if(!this.responseText){
							swal("Строка удалена успешно!", {icon: "success",});
						} else {
							if(inputId){
								swal("Ошибка!", "Ошибка удаления. "+this.responseText, "error");
							}
						}
					}
				};
				var room = document.getElementById("collsHead");
				xmlhttp.open("GET","db/update.php?flag=delete" + "&id=" + inputId +
				"&str=" + room.innerHTML + "&collName=" + inputCollsName +
				"&Info_href=" + inputInfo_href + "&Photo_href=" +
				inputPhoto_href,true);
	
				xmlhttp.send();
				var colDiv = this.parentElement;
				colDiv.parentElement.remove();		
			}
		});
	} else {
		var colDiv = this.parentElement;
		colDiv.parentElement.remove();
	}
	
}

//Загрузка помещений из БД
function loadFromDb(floor){
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
			select = document.getElementById("elementsList");
			select.innerHTML = "";
			for(var i = 0; i < response.length; i++){			
				var option = new Option(response[i].Name, response[i].Name);
				option.id = response[i].Name;
				select.appendChild(option);

				var mat = new BABYLON.StandardMaterial("mat"+i, scene);
				mat.diffuseColor = BABYLON.Color3.Blue();
				mat.alpha = 0.3;
				var mesh = BABYLON.Mesh.CreateBox(response[i].Name, 1, scene);
				mesh.scaling.x = parseFloat(response[i].scaling_x);
				mesh.scaling.z = parseFloat(response[i].scaling_z);
				mesh.scaling.y = 0.3;
				
				mesh.position.x = parseFloat(response[i].position_x);
				mesh.position.y = 0.1;
				mesh.position.z = parseFloat(response[i].position_y);
				mesh.material = mat;
				
				makeOverOut(mesh);				
			}
			select.selectedIndex = -1;
		}
	};
	xmlhttp.open("GET","db/loadRoomsFromDb.php?floor=" + floor + "&ver=" + Math.random(),true);
	xmlhttp.send();
}

//Изменение размеров и положения помещения
function morphMesh (){
	var name = document.getElementById("inputRoomName").value;
	var scaling_x = parseFloat(document.getElementById("inputRoomScalingX").value);
	var scaling_z = parseFloat(document.getElementById("inputRoomScalingZ").value);
	var position_x = parseFloat(document.getElementById("inputRoomPostitionX").value);
	var position_y = parseFloat(document.getElementById("inputRoomPostitionY").value);
	meshName = document.getElementById("roomsHead").innerHTML;
	if(meshName){
		var mesh = scene.getMeshByName(meshName);
		mesh.position = new BABYLON.Vector3 (position_x, mesh.position.y, position_y);
		mesh.scaling.x = scaling_x;
		mesh.scaling.z = scaling_z;
		mesh.scaling.y = 0.3;
		mesh.material.diffuseColor = BABYLON.Color3.Purple();
	}
}

//Добавление помещения
function addMesh (){
	var name = document.getElementById("inputRoomName").value;
	if(scene.getMeshByName(name) == null){
		var scaling_x = parseFloat(document.getElementById("inputRoomScalingX").value);
		var scaling_z = parseFloat(document.getElementById("inputRoomScalingZ").value);
		var position_x = parseFloat(document.getElementById("inputRoomPostitionX").value);
		var position_y = parseFloat(document.getElementById("inputRoomPostitionY").value);
		if(name && scaling_x && scaling_z && position_x && position_y){
			var mat = new BABYLON.StandardMaterial("mat", scene);
			mat.diffuseColor = BABYLON.Color3.Blue();
			mat.alpha = 0.3;
			var mesh = BABYLON.MeshBuilder.CreateBox(name, {height: 1, width: 1, depth: 0}, scene, true);
			mesh.material = mat;

			mesh.position.x = position_x;
			mesh.position.z = position_y;
			mesh.position.y = 0.1;

			mesh.scaling.x = scaling_x;
			mesh.scaling.z = scaling_z;
			mesh.scaling.y = 0.3;
			makeOverOut(mesh);
			document.getElementById("roomsHead").innerHTML = name;

			select = document.getElementById("elementsList");
			var option = new Option(name, name, false, true);
			option.id = name;
			select.appendChild(option);

			if (window.XMLHttpRequest) {
				// code for IE7+, Firefox, Chrome, Opera, Safari
				xmlhttp=new XMLHttpRequest();
			} else { // code for IE6, IE5
				xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			xmlhttp.onreadystatechange=function() {
				if (this.readyState==4 && this.status==200) {
					var response = this.responseText;
					if(!response){
						swal("Помещение добавлено!", "", "success");
					}else{
						swal("Ошибка добавления!",response, "error");
					}
				}
			};

			var flag = "insert";

			meshName = document.getElementById("roomsHead").innerHTML;
			var mesh = scene.getMeshByName(meshName);

			var name = mesh.name;
			var newName = document.getElementById("inputRoomName").value;
			var scaling_x = document.getElementById("inputRoomScalingX").value;
			var scaling_z = document.getElementById("inputRoomScalingZ").value;
			var position_x = document.getElementById("inputRoomPostitionX").value;
			var position_y = document.getElementById("inputRoomPostitionY").value;

			xmlhttp.open("GET","db/saveMeshToDb.php?flag=" + flag + "&name=" + name +  "&newName=" + newName +
			"&floor=" + floor + "&scaling_x=" + scaling_x +"&scaling_z=" + scaling_z +
			"&position_x=" + position_x + "&position_y=" + position_y, true);
			xmlhttp.send();
		}else{
			swal("Ошибка", "Необходимо заполнить все поля.", "error");
		}

	}else{
		swal("Ошибка", "Помещение с таким названием уже есть.", "error");
	}
}

//Удаление помещения
function deleteMesh() {
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	} else { // code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function() {
		if (this.readyState==4 && this.status==200) {
			var response = this.responseText;
			if(!response){
				swal("Помещение удалено!", "", "success");
				var mesh = scene.getMeshByName(meshName);
				mesh.dispose();
				document.getElementById("roomsHead").innerHTML= "";
				document.getElementById("collsHead").innerHTML= "";
				document.getElementById("menu").innerHTML= "";
				
				document.getElementById("inputRoomName").value= "";
				document.getElementById("inputRoomScalingX").value= "";
				document.getElementById("inputRoomScalingZ").value= "";
				document.getElementById("inputRoomPostitionX").value= "";
				document.getElementById("inputRoomPostitionY").value= "";
								
				select = document.getElementById("elementsList");
				select.options.namedItem(meshName).remove();
				select.selectedIndex = -1;
				
			}else{
				swal("Ошибка удаления!", response, "error");
			}
		}
	};

	var flag = "delete";
	var name = document.getElementById("inputRoomName").value;
	
	

	meshName = document.getElementById("roomsHead").innerHTML;
	if(meshName){		
		xmlhttp.open("GET","db/saveMeshToDb.php?flag=" + flag + "&name=" + name,true);
		xmlhttp.send();
	}
}

//Отображения положения и размеров помещения в редакторе
function showRoomsInEditor(name){
	var roomName = document.getElementById("inputRoomName");
	var scaling_x = document.getElementById("inputRoomScalingX");
	var scaling_z = document.getElementById("inputRoomScalingZ");

	var position_x = document.getElementById("inputRoomPostitionX");
	var position_y = document.getElementById("inputRoomPostitionY");

	meshName = name;
	var mesh = scene.getMeshByName(meshName);

	roomName.value = mesh.name;
	scaling_x.value = mesh.scaling.x;
	scaling_z.value = mesh.scaling.z;

	position_x.value = mesh.position.x;
	position_y.value = mesh.position.z;

	select = document.getElementById("elementsList");
	select.options.namedItem(meshName).selected = true;
}

//Отмена выбора помещения
function deselectMesh() {
	document.getElementById("inputRoomName").value = "";
	document.getElementById("inputRoomScalingX").value = "";
	document.getElementById("inputRoomScalingZ").value = "";

	document.getElementById("inputRoomPostitionX").value = "";
	document.getElementById("inputRoomPostitionY").value = "";
	document.getElementById("roomsHead").innerHTML = "";
	document.getElementById("collsHead").innerHTML = "";

	document.getElementById("menu").innerHTML = "";

	select = document.getElementById("elementsList");
	select.selectedIndex = -1;
	if(pickedMeshes[pickedMeshes.length-1])
		pickedMeshes[pickedMeshes.length-1].material.alpha = 0.3;
}

//Сохранение изменений помещения
function saveToDb(){
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	} else { // code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function() {
		if (this.readyState==4 && this.status==200) {
			var response = this.responseText;
			console.log(response);
			if(!response){
				swal("Изменения сохранены успешно!", "", "success");
				var name = document.getElementById("inputRoomName").value;
				var scaling_x = document.getElementById("inputRoomScalingX").value;
				var scaling_z = document.getElementById("inputRoomScalingZ").value;
				var scaling_y = document.getElementById("inputRoomScalingY").value;
				var position_x = document.getElementById("inputRoomPostitionX").value;
				var position_y = document.getElementById("inputRoomPostitionY").value;
				meshName = document.getElementById("roomsHead").innerHTML;

				var mesh = scene.getMeshByName(meshName);
				mesh.position.x = parseFloat(position_x);
				mesh.position.y = 0.1;
				mesh.position.z = parseFloat(position_y);
				mesh.scaling.x =  parseFloat(scaling_x);
				mesh.scaling.z = parseFloat(scaling_z);
				mesh.scaling.y = parseFloat(scaling_y);
				mesh.name = name;
				document.getElementById("roomsHead").innerHTML = name;
			} else{
				swal("Ошибка сохранения изменений!", response, "error");
			}
		}
	};
	meshName = document.getElementById("roomsHead").innerHTML;
	var mesh = scene.getMeshByName(meshName);
	mesh.material.diffuseColor = BABYLON.Color3.Blue();

	var name = mesh.name;
	var newName = document.getElementById("inputRoomName").value;
	var scaling_x = document.getElementById("inputRoomScalingX").value;
	var scaling_z = document.getElementById("inputRoomScalingZ").value;
	var position_x = document.getElementById("inputRoomPostitionX").value;
	var position_y = document.getElementById("inputRoomPostitionY").value;

	var flag = "update";

	xmlhttp.open("GET","db/saveMeshToDb.php?flag=" + flag + "&name=" + name +  "&newName=" + newName +
       "&floor=" + floor + "&scaling_x=" + scaling_x +"&scaling_z=" + scaling_z +
       "&position_x=" + position_x + "&position_y=" + position_y,true);
	xmlhttp.send();

}

//Функция выбора помещений с помощью выпадающего списка
var select = document.getElementById("elementsList");
select.addEventListener("change", function(){
	var selected = this.selectedIndex;
	var name = this.options[selected].value;
	
	pickResult = scene.getMeshByName(name);
	pickedMeshes.push(pickResult);
	pickResult.material.alpha = 0.7;
	scene.meshes.forEach(function (m) {
		if(pickedMeshes.length){
			if (m.name.indexOf("Curve") == -1 && m.name != "ground"
		&& m.name != pickedMeshes[pickedMeshes.length-1].name
			) {
				m.material.alpha = 0.3;
			}
		}
	});

	pickMesh(name);
	showRoomsInEditor(name);
	document.getElementById("collsHead").innerHTML=name;
	document.getElementById("roomsHead").innerHTML=name;
});