import { Asset } from 'expo';
import firebase from '../../Firebase';
import { TweenLite } from 'gsap';
import THREE from '../../THREE';
import ExpoTHREE from 'expo-three';
require('three/examples/js/loaders/OBJLoader');
require('three/examples/js/loaders/MTLLoader');

class PostgameRewardsScene {
    constructor(renderer) {
        this.renderer = renderer;
    }

    initialize() {
        this.setupScene();
        this.setupCamera();
        this.setupLights();
        this.setupBackground();
        this.setupAvatarGeometry();
        this.setupFont();
        this.setupPlayer();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x570C76);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera.position.z = 5;
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
            const blockGeometry = new THREE.BoxBufferGeometry();
            const color = Math.random() * 0xffffff;
            const blockMaterial = new THREE.MeshBasicMaterial({ color: color, wireframe: true });
            this.blocks[i] = {};
            this.blocks[i].mesh = new THREE.Mesh(blockGeometry, blockMaterial);
            this.blocks[i].mesh.position.x = Math.random() * 50 - 25;
            this.blocks[i].mesh.position.y = Math.random() * 50 - 25;
            this.blocks[i].mesh.position.z = -Math.random() * 25;
            const scale = Math.random();
            this.blocks[i].mesh.scale.x = scale;
            this.blocks[i].mesh.scale.y = scale;
            this.blocks[i].mesh.scale.z = scale;
            this.blocks[i].mesh.rotation.x = Math.random() * 2 * Math.PI;
            this.blocks[i].mesh.rotation.y = Math.random() * 2 * Math.PI;
            this.blocks[i].mesh.rotation.z = Math.random() * 2 * Math.PI;
            this.scene.add(this.blocks[i].mesh);
        }
    }

    setupAvatarGeometry() {
        this.avatarGeometry = [
            new THREE.BoxGeometry(),
            new THREE.SphereGeometry(0.5),
            new THREE.ConeGeometry(0.5),
            new THREE.CylinderBufferGeometry(0.5, 0.5),
            new THREE.DodecahedronGeometry(0.5)
        ];
    }

    setupFont() {
        const fontLoader = new THREE.FontLoader();
        this.font = fontLoader.parse(require('../../assets/fonts/helvetiker_regular.typeface.json'));
    }

    setupPlayer() {
        this.playerGroup = new THREE.Group();
        this.scene.add(this.playerGroup);

        firebase.database.ref('players/' + firebase.uid).on('value', snapshot => {
            let player = snapshot.val();

            // setup player avatar mesh
            if(this.playerAvatarMesh) {
                this.playerGroup.remove(this.playerAvatarMesh);
            }
            // const avatarGeometry = this.avatarGeometry[player.currentSkin || 0];
            // const avatarMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, overdraw: 0.5 });
            // this.playerAvatarMesh = new THREE.Mesh(avatarGeometry, avatarMaterial);
            // this.playerGroup.add(this.playerAvatarMesh);

            this.loadModelAsync();

            // setup player name mesh
            if(this.playerNameMesh) {
                this.playerGroup.remove(this.playerNameMesh);
            }
            const nameGeometry = new THREE.TextGeometry(player.name, { font: this.font, size: 0.5, height: 0 });
            const nameMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
            this.playerNameMesh = new THREE.Mesh(nameGeometry, nameMaterial);
            nameGeometry.computeBoundingBox();
            this.playerNameMesh.position.x = -nameGeometry.boundingBox.max.x / 2;
            this.playerNameMesh.position.y = 1.5;
            this.playerGroup.add(this.playerNameMesh);
        });
    }

    loadModelAsync = async () => {
        this.playerAvatarMesh = await ExpoTHREE.loadAsync(require('../../assets/models/BlockPartyAvatar.obj'));
        this.playerAvatarMesh.scale.x = 0.02;
        this.playerAvatarMesh.scale.y = 0.02;
        this.playerAvatarMesh.scale.z = 0.02;
        this.playerAvatarMesh.rotation.x = Math.PI / 6;
        this.playerAvatarMesh.rotation.y = Math.PI / 6 + 3 * Math.PI / 2;
        this.playerGroup.add(this.playerAvatarMesh);
    }

    onTouchesBegan(state) {}

    startPurchase() {
        TweenLite.to(this.playerAvatarMesh.rotation, 1, { y: 4 * Math.PI, onComplete: () => { 
            this.playerAvatarMesh.rotation.x = Math.PI / 6;
            this.playerAvatarMesh.rotation.y = Math.PI / 6;
        }});
        TweenLite.to(this.playerAvatarMesh.scale, 1, { x: 0, y: 0, z: 0 });
        TweenLite.to(this.playerAvatarMesh.scale, 3, { x: 1, y: 1, z: 1, delay: 2 });
        TweenLite.to(this.playerAvatarMesh.rotation, 3, { y: 4 * Math.PI + Math.PI / 6, onCompelte: () => {
            this.playerAvatarMesh.rotation.x = Math.PI / 6;
            this.playerAvatarMesh.rotation.y = Math.PI / 6;
        }});
    }

    update() {
        this.updateBackground();
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

    shutdown() {
        firebase.database.ref('players/' + firebase.uid).off();
    }
}

export default PostgameRewardsScene;