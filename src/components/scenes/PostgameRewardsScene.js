import { TweenLite } from 'gsap';
import THREE from '../../THREE';
import '../../TeapotBufferGeometry';

class PostgameRewardsScene {
    avatar = {
        tween: null,
        scaleValue: 1,
        scaleValue2: 0
    }

    constructor(renderer) {
        this.renderer = renderer;
        this.setupScene();
        this.setupCamera();
        this.setupLights();
        this.setupBackground();

        const blockGeometry = new THREE.BoxGeometry();
        const sphereGeometry = new THREE.SphereGeometry(0.5);
        let avatarGeometry = blockGeometry;
        let avatarMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, overdraw: 0.5 });
        this.avatarMesh = new THREE.Mesh(avatarGeometry, avatarMaterial);
        this.scene.add(this.avatarMesh);

        let avatarGeometry2 = new THREE.TeapotBufferGeometry(0.5);
        let avatarMaterial2 = new THREE.MeshLambertMaterial({ color: 0xffffff, overdraw: 0.5 });
        this.avatarMesh2 = new THREE.Mesh(avatarGeometry2, avatarMaterial2);
        this.avatarMesh2.scale.x = 0;
        this.avatarMesh2.scale.y = 0;
        this.avatarMesh2.scale.z = 0;
        this.scene.add(this.avatarMesh2);

        // firebase.database().ref('players/' + firebase.auth().currentUser.uid + '/currentSkin').on('value', snapshot => {
        //     let currentSkin = snapshot.val();
        //     if(currentSkin !== null) {
        //         switch(currentSkin) {
        //             case 0:
        //                 avatarGeometry = blockGeometry;
        //                 break;
        //             case 1:
        //                 avatarGeometry = sphereGeometry;
        //                 break;
        //             default: 
        //                 avatarGeometry = blockGeometry;
        //                 break;
        //         }
        //     }
        //     else {
        //         avatarGeometry = blockGeometry;
        //     }
        //     const avatarMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff, overdraw: 0.5 });
        //     this.scene.remove(this.avatarMesh);
        //     this.avatarMesh = new THREE.Mesh(avatarGeometry, avatarMaterial);
        //     this.scene.add(this.avatarMesh);
        // });
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x570C76);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.x = 1;
        this.camera.position.y = 1;
        this.camera.position.z = 3;
        this.camera.lookAt(new THREE.Vector3());
    }

    setupLights() {
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
    }

    setupBackground() {
        this.blocks = [];
        for(let i = 0; i < 100; i++) {
            let size = Math.random() * 3;
            let blockGeometry = new THREE.BoxGeometry(size, size, size);
            let color = Math.random() * 0xeeeeee;
            let blockMaterial = new THREE.MeshBasicMaterial({ color: color, wireframe: true });
            this.blocks[i] = {};
            this.blocks[i].mesh = new THREE.Mesh(blockGeometry, blockMaterial);
            this.blocks[i].mesh.position.x = Math.random() * 50 - 25;
            this.blocks[i].mesh.position.y = Math.random() * 50 - 25;
            this.blocks[i].mesh.position.z = -7;
            this.blocks[i].mesh.rotation.x = Math.random() * 2 * Math.PI;
            this.blocks[i].mesh.rotation.y = Math.random() * 2 * Math.PI;
            this.scene.add(this.blocks[i].mesh);
        }
    }

    onTouchesBegan(state) {
        
    }

    startPurchase() {
        TweenLite.to(this.avatar, 2, { scaleValue: 0 });
        TweenLite.to(this.avatar, 2, { scaleValue2: 1, delay: 3 });
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

        this.avatarMesh.scale.x = this.avatar.scaleValue;
        this.avatarMesh.scale.y = this.avatar.scaleValue;
        this.avatarMesh.scale.z = this.avatar.scaleValue;

        this.avatarMesh2.scale.x = this.avatar.scaleValue2;
        this.avatarMesh2.scale.y = this.avatar.scaleValue2;
        this.avatarMesh2.scale.z = this.avatar.scaleValue2;
    }

    render() {
        if(this.renderer) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

export default PostgameRewardsScene;