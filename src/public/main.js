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

  // Add player controls
  scene.onBeforeRenderObservable.add(() => {
    if (inputMap["w"]) player.mesh.position.z -= 1;
    if (inputMap["s"]) player.mesh.position.z += 1;
    if (inputMap["a"]) player.mesh.position.x += 1;
    if (inputMap["d"]) player.mesh.position.x -= 1;

    socket.emit("playerPosition", { x: player.mesh.position.x, y: player.mesh.position.y, z: player.mesh.position.z });
  });

  // On new player join
  socket.on("playerConnected", (data) => {
    if (!players[data.id]) {
      let newPlayer = new Player(scene, data.id, new BABYLON.Vector3(data.x, data.y, data.z));
      players[data.id] = newPlayer;
    }
  });

  // Update players position
  socket.on("updatePlayerPosition", (data) => {
    if (players[data.id]) {
      players[data.id].mesh.position.x = data.x;
      players[data.id].mesh.position.z = data.z;
    }
  });

  // Remove player when disconnected
  socket.on("playerLeft", (id) => {
    if (players[id]) {
      players[id].mesh.dispose();
      delete players[id];
    }
  });

  // Emit all player positions on join
  socket.on("emitAllPlayerPositions", (allPlayers) => {
    for (let id in allPlayers) {
      if (id !== socket.id) {
        let newPlayer = new Player(scene, id, new BABYLON.Vector3(allPlayers[id].x, allPlayers[id].y, allPlayers[id].z));
        players[id] = newPlayer;
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
