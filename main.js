window.onload = function () {
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
    let player = new Player(scene, new BABYLON.Vector3(0, 0, 0));

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
