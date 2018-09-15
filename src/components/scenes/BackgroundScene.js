import THREE from '../../THREE';

class BackgroundScene {
    constructor(renderer) {
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x570C76);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 10;

        this.blocks = [];
        for(let i = 0; i < 100; i++) {
            let size = Math.random();
            let blockGeometry = new THREE.BoxGeometry(size, size, size);
            let color = Math.random() * 0xeeeeee;
            let blockMaterial = new THREE.MeshBasicMaterial({ color: color, wireframe: true });
            this.blocks[i] = {};
            this.blocks[i].mesh = new THREE.Mesh(blockGeometry, blockMaterial);
            this.blocks[i].mesh.position.x = Math.random() * 50 - 25;
            this.blocks[i].mesh.position.y = Math.random() * 50 - 25;
            this.blocks[i].mesh.rotation.x = Math.random() * 2 * Math.PI;
            this.blocks[i].mesh.rotation.y = Math.random() * 2 * Math.PI;
            this.scene.add(this.blocks[i].mesh);
        }
    }

    onTouchesBegan(state) {
        
    }

    update() {
        for(let i = 0; i < 100; i++) {
            this.blocks[i].mesh.position.x += 0.01;
            if(this.blocks[i].mesh.position.x > 25) {
                this.blocks[i].mesh.position.x = -25;
            }
            this.blocks[i].mesh.position.y += 0.01;
            if(this.blocks[i].mesh.position.y > 25) {
                this.blocks[i].mesh.position.y = -25;
            }
            this.blocks[i].mesh.rotation.x += 0.01;
            this.blocks[i].mesh.rotation.y += 0.01;
        }
    }

    render() {
        if(this.renderer) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    shutdown() {
        while(this.scene.children.length > 0) { 
            this.scene.remove(this.scene.children[0]); 
        }
    }
}

export default BackgroundScene;