// Create player class
class Player {
    constructor(scene, id, position) {
        this.mesh = BABYLON.MeshBuilder.CreateBox(id, {size: 2}, scene);
        this.mesh.position = position;
    }
}
