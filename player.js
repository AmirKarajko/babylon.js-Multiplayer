// Create player class
class Player {
    constructor(scene, position) {
        this.mesh = BABYLON.MeshBuilder.CreateBox("box", {size: 2}, scene);
        this.mesh.position = position;
    }
}