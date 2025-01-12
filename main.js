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
  
    // Run the render loop
    engine.runRenderLoop(function () {
      scene.render();
    });
  
    // Resize the engine when the window is resized
    window.addEventListener("resize", function () {
      engine.resize();
    });
  };
