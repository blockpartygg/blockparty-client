import { Dimensions } from 'react-native';
import { TweenLite } from 'gsap';
import THREE from '../../THREE';
import firebase from '../../Firebase';

class WhackABlockScene {
    players = [];
    blocks = [];
    textMeshes = [];
    blockGeometry = new THREE.BoxBufferGeometry();
    cameraRotation = 0;
    cameraRadius = 100;
    touch = new THREE.Vector2();
    intersected;
    dimensions = Dimensions.get('window');
    fontLoader = new THREE.FontLoader();
    font = this.fontLoader.parse(require('../../assets/fonts/helvetiker_regular.typeface.json'));

    constructor(renderer) {
        this.renderer = renderer;

        this.setupScene();
        this.setupCamera();

        firebase.database.ref('players').on('value', snapshot => {
            snapshot.forEach(playerSnapshot => {
                this.players[playerSnapshot.key] = playerSnapshot.val();
            })
        });

        firebase.database.ref('minigame/whackABlock/blocks').on('child_added', snapshot => {
            let block = snapshot.val();
            this.blocks[snapshot.key] = new THREE.Mesh(this.blockGeometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
            this.blocks[snapshot.key].position.x = block.position.x;
            this.blocks[snapshot.key].position.y = block.position.y;
            this.blocks[snapshot.key].position.z = block.position.z;
            this.blocks[snapshot.key].scale.x = 0;
            this.blocks[snapshot.key].scale.y = 0;
            this.blocks[snapshot.key].scale.z = 0;
            this.blocks[snapshot.key].rotation.x = block.rotation.x;
            this.blocks[snapshot.key].rotation.y = block.rotation.y;
            this.blocks[snapshot.key].rotation.z = block.rotation.z;
            this.blocks[snapshot.key].name = snapshot.key;
            let expandDuration = 0.5;
            TweenLite.to(this.blocks[snapshot.key].scale, expandDuration, { x: block.scale.x * 1.5, y: block.scale.y * 1.5, z: block.scale.z * 1.5 });
            TweenLite.to(this.blocks[snapshot.key].scale, expandDuration, { x: block.scale.x, y: block.scale.y, z: block.scale.z, delay: expandDuration });
            this.scene.add(this.blocks[snapshot.key]);
        });

        firebase.database.ref('minigame/whackABlock/blocks').on('child_removed', snapshot => {
            let block = snapshot.val();
            if(block && block.playerId && this.players[block.playerId]) {
                let textGeometry = new THREE.TextGeometry(this.players[block.playerId].name, { font: this.font, size: 5, height: 0 });
                let textMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
                this.textMeshes[snapshot.key] = new THREE.Mesh(textGeometry, textMaterial);
                this.textMeshes[snapshot.key].position.x = block.position.x;
                this.textMeshes[snapshot.key].position.y = block.position.y;
                this.textMeshes[snapshot.key].position.z = block.position.z;
                this.textMeshes[snapshot.key].material.transparent = true;
                this.textMeshes[snapshot.key].material.opacity = 1;
                this.scene.add(this.textMeshes[snapshot.key]);
                let fadeDuration = 2;
                this.textMeshes[snapshot.key].tween = TweenLite.to(this.textMeshes[snapshot.key].material, fadeDuration, { opacity: 0, onComplete: () => { this.scene.remove(this.textMeshes[snapshot.key]); } });
            }

            let explodeDuration = 0.5;
            TweenLite.to(this.blocks[snapshot.key].scale, explodeDuration, { x: 1.5, y: 1.5, z: 1.5 });
            TweenLite.to(this.blocks[snapshot.key].scale, explodeDuration, { x: 0, y: 0, z: 0, delay: explodeDuration, onComplete: () => { this.scene.remove(this.blocks[snapshot.key]); }});
        });
    }

    setupScene() {
        this.scene = new THREE.Scene();
        let sceneColor = new THREE.Color(0x888888);
        this.scene.background = sceneColor;
        this.scene.fog = new THREE.Fog(sceneColor, 1, 1000);

        let directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight1.position.set(0, 0, 1).normalize();
        this.scene.add(directionalLight1);

        let directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight2.position.set(0, 0, -1).normalize();
        this.scene.add(directionalLight2);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.raycaster = new THREE.Raycaster();
    }

    initialize() {
        
    }

    onTouchesBegan(state) {
        this.touch.x = (state.pageX / this.dimensions.width) * 2 - 1;
        this.touch.y = - (state.pageY / this.dimensions.height) * 2 + 1;

        this.raycaster.setFromCamera(this.touch, this.camera);
        let intersects = this.raycaster.intersectObjects(this.scene.children);
        if(intersects.length > 0) {
            let blockId = intersects[0].object.name;
            
            firebase.database.ref('game/commands').push({
                playerId: firebase.uid,
                blockId: blockId
            });

            if(this.intersected !== intersects[0].object) {
                if(this.intersected) {
                    this.intersected.material.emissive.setHex(this.intersected.currentHex);
                }
                this.intersected = intersects[0].object;
                this.intersected.currentHex = this.intersected.material.emissive.getHex();
                this.intersected.material.emissive.setHex(0xff0000);
            }
        } else {
            if(this.intersected) {
                this.intersected.material.emissive.setHex(this.intersected.currentHex);
            }
            this.intersected = null;
        }
    }

    update(delta) {
        this.cameraRotation += 3 * delta;
        this.camera.position.x = this.cameraRadius * Math.sin(THREE.Math.degToRad(this.cameraRotation));
        this.camera.position.y = this.cameraRadius * Math.sin(THREE.Math.degToRad(this.cameraRotation));
        this.camera.position.z = this.cameraRadius * Math.cos(THREE.Math.degToRad(this.cameraRotation));
        this.camera.lookAt(this.scene.position);
        this.camera.updateMatrixWorld();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    shutdown() {
        firebase.database.ref('minigame/whackABlock/blocks').off();

        while(this.scene.children.length > 0) { 
            this.scene.remove(this.scene.children[0]); 
        }
    }
}

export default WhackABlockScene;