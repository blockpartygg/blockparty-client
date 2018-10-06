import firebase from '../../Firebase';
import { TweenLite } from 'gsap';
import THREE from '../../THREE';
import '../../TeapotBufferGeometry';

class PostgameRewardsScene {
    avatar = {
        currentScaleValue: 1,
        nextScaleValue: 0.1
    }

    constructor(renderer) {
        this.renderer = renderer;
        this.setupScene();
        this.setupCamera();
        this.setupLights();
        this.setupBackground();

        const geometries = [
            new THREE.BoxGeometry(),
            new THREE.SphereGeometry(0.5),
            new THREE.ConeGeometry(0.5),
            new THREE.CylinderBufferGeometry(0.5, 0.5),
            new THREE.DodecahedronGeometry(0.5)
        ];

        let currentAvatarGeometry = geometries[0];
        let avatarMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, overdraw: 0.5 });
        this.currentAvatarMesh = new THREE.Mesh(currentAvatarGeometry, avatarMaterial);
        this.scene.add(this.currentAvatarMesh);

        let nextAvatarGeometry = geometries[0];
        this.nextAvatarMesh = new THREE.Mesh(nextAvatarGeometry, avatarMaterial);
        this.scene.add(this.nextAvatarMesh);

        this.initialize();

        firebase.database.ref('players/' + firebase.uid + '/currentSkin').once('value', snapshot => {
            let currentSkin = snapshot.val();
            if(currentSkin !== null) {
                currentAvatarGeometry = geometries[currentSkin];
                this.scene.remove(this.currentAvatarMesh);
                this.currentAvatarMesh = new THREE.Mesh(currentAvatarGeometry, avatarMaterial);
                this.scene.add(this.currentAvatarMesh);
            }
        });

        firebase.database.ref('players/' + firebase.uid + '/currentSkin').on('value', snapshot => {
            let currentSkin = snapshot.val();
            if(currentSkin !== null) {
                nextAvatarGeometry = geometries[currentSkin];
            }
            else {
                nextAvatarGeometry = geometries[0];
            }
            this.scene.remove(this.nextAvatarMesh);
            this.nextAvatarMesh = new THREE.Mesh(nextAvatarGeometry, avatarMaterial);
            this.scene.add(this.nextAvatarMesh);
        });
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
            let color = Math.random() * 0xffffff;
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

    initialize() {
        this.avatar.scaleValue = 1;
        this.avatar.scaleValue2 = 0;
        this.currentAvatarMesh.scale.x = 1;
        this.currentAvatarMesh.scale.y = 1;
        this.currentAvatarMesh.scale.z = 1;
        this.nextAvatarMesh.scale.x = 0.1;
        this.nextAvatarMesh.scale.y = 0.1;
        this.nextAvatarMesh.scale.z = 0.1;
    }

    onTouchesBegan(state) {
        
    }

    startPurchase() {
        this.avatar.currentScaleValue = 1;
        this.avatar.nextScaleValue = 0;
        this.currentAvatarMesh.scale.x = 1;
        this.currentAvatarMesh.scale.y = 1;
        this.currentAvatarMesh.scale.z = 1;
        this.nextAvatarMesh.scale.x = 0.1;
        this.nextAvatarMesh.scale.y = 0.1;
        this.nextAvatarMesh.scale.z = 0.1;
        TweenLite.to(this.avatar, 2, { currentScaleValue: 0.1 });
        TweenLite.to(this.avatar, 2, { nextScaleValue: 1, delay: 3 });
    }

    update() {
        this.updateBackground();

        this.currentAvatarMesh.scale.x = this.avatar.currentScaleValue;
        this.currentAvatarMesh.scale.y = this.avatar.currentScaleValue;
        this.currentAvatarMesh.scale.z = this.avatar.currentScaleValue;

        this.nextAvatarMesh.scale.x = this.avatar.nextScaleValue;
        this.nextAvatarMesh.scale.y = this.avatar.nextScaleValue;
        this.nextAvatarMesh.scale.z = this.avatar.nextScaleValue;
    }

    updateBackground() {
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

    shutdown() {}
}

export default PostgameRewardsScene;