import THREE from '../../THREE';

class PostgameRewardsScene {
    constructor(renderer) {
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.x = 1;
        this.camera.position.y = 1;
        this.camera.position.z = 3;
        this.camera.lookAt(new THREE.Vector3());

        const ambientLight = new THREE.AmbientLight( 0x404040 );
        this.scene.add(ambientLight);

        let directionalLight1 = new THREE.DirectionalLight( 0xffffff );
        directionalLight1.position.x = 0.5;
        directionalLight1.position.y = 0.5;
        directionalLight1.position.z = 0.5;
        this.scene.add(directionalLight1);

        let directionalLight2 = new THREE.DirectionalLight( 0x808080 );
        directionalLight2.position.x = -0.5;
        directionalLight2.position.y = 0.5;
        directionalLight2.position.z = 0.5;
        this.scene.add(directionalLight2);

        let avatarGeometry = new THREE.BoxGeometry();
        let avatarMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, overdraw: 0.5 });
        this.avatarMesh = new THREE.Mesh(avatarGeometry, avatarMaterial);
        this.scene.add(this.avatarMesh);
    }

    onTouchesBegan(state) {
        
    }

    update() {
        
    }

    render() {
        if(this.renderer) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

export default PostgameRewardsScene;