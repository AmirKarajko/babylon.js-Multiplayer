window.onload = function () {
  // Connects client to server
  const socket = io();

  // Create the Babylon.js engine and scene
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);

  // Create a camera
  const camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 4, 10, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  // Create a light
  const light = new BABYLON.HemisphericLight("light1", BABYLON.Vector3.Up(), scene);

  // Create a player
  let player = new Player(scene, 0, new BABYLON.Vector3(0, 0, 0));
  let players = {};

  // Input
  let inputMap = {};
  scene.actionManager = new BABYLON.ActionManager(scene);
  scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (e) => { inputMap[e.sourceEvent.key] = true; }));
  scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (e) => { inputMap[e.sourceEvent.key] = false; }));

  // Create virtual joystick
  let leftJoystick = null;
  if (/Mobi|Android|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
    leftJoystick = new BABYLON.VirtualJoystick(true);
  }

  // Adds a function to run before each render
  scene.onBeforeRenderObservable.add(() => {
    // Define player speed
    const playerSpeed = (engine.getDeltaTime() / 1000) * 10;

    // Add virtual joystick controls
    if (leftJoystick !== null) {
      if (leftJoystick.pressed) {
        const deltaY = leftJoystick.deltaPosition.y * playerSpeed;
        const deltaX = leftJoystick.deltaPosition.x * playerSpeed;
        player.mesh.position.z -= deltaY;
        player.mesh.position.x -= deltaX;
      }
    }
    
    // Add player controls
    if (inputMap["w"]) player.mesh.position.z -= playerSpeed;
    if (inputMap["s"]) player.mesh.position.z += playerSpeed;
    if (inputMap["a"]) player.mesh.position.x += playerSpeed;
    if (inputMap["d"]) player.mesh.position.x -= playerSpeed;

    socket.emit("playerPosition", { x: player.mesh.position.x, y: player.mesh.position.y, z: player.mesh.position.z });
  });

  // Create a player
  const createPlayer = (id, x, y, z) => {
    players[id] = new Player(scene, id, new BABYLON.Vector3(x, y, z));
  };

  // On new player join
  socket.on("playerConnected", (data) => createPlayer(data.id, data.x, data.y, data.z));

  // Update players position
  socket.on("updatePlayerPosition", (data) => {
    players[data.id].mesh.position.set(data.x, data.y, data.z);
  });

  // Remove player when disconnected
  socket.on("playerLeft", (id) => {
    players[id].mesh.dispose();
    delete players[id];
  });

  // Emit all player positions on join
  socket.on("emitAllPlayersPosition", (allPlayers) => {
    for (let id in allPlayers) {
      if (id !== socket.id) {
        createPlayer(id, allPlayers[id].x, allPlayers[id].y, allPlayers[id].z);
      }
    }
  });

  // Run the render loop
  engine.runRenderLoop(function () {
    scene.render();
  });

  // Resize the engine when the window is resized
  window.addEventListener("resize", function () {
    engine.resize();
  });
};
