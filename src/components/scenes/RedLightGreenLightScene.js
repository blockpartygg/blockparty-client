import THREE from '../../THREE';
import firebase from '../../Firebase';
import socketIO from '../../SocketIO';
import { TweenLite } from 'gsap';

class RedLightGreenLightScene {
    constructor(renderer) {
        this.renderer = renderer;
    }

    initialize() {
        this.setupScene();
        this.setupCamera();
        this.setupLighting();
        this.setupGround();
        this.setupFont();
        this.setupPlayerGeometry();
        this.setupPlayer();
        this.setupOtherPlayers();
        this.setupGreenLight();
        this.sendStateInterval = setInterval(this.sendPlayerState, 1000 / 60);
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.sceneGreenColor = new THREE.Color(0x00ff00);
        this.sceneRedColor = new THREE.Color(0xff0000);
        this.scene.background = this.sceneGreenColor;
    }

    setupCamera() {
        this.camera = new THREE.OrthographicCamera(-562, 562, 1218, -1218, -30, 30);
        this.cameraOffset = new THREE.Vector3(-1, 2.8, -2.9);
        this.camera.position.x = this.cameraOffset.x;
        this.camera.position.y = this.cameraOffset.y;
        this.camera.position.z = this.cameraOffset.z;
        this.camera.zoom = 110;
        this.camera.updateProjectionMatrix();
        this.camera.lookAt(this.scene.position);
    }

    setupLighting() {
        let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 0, -1).normalize();
        this.scene.add(directionalLight);
    }

    setupGround() {
        const groundGeometry = new THREE.Geometry();
        for(let x = -500; x <= 500; x += 1) {
            groundGeometry.vertices.push(
                new THREE.Vector3(x, 0, -500),
                new THREE.Vector3(x, 0, 500)
            );
        }
        for(let z = -500; z <= 500; z += 1) {
            groundGeometry.vertices.push(
                new THREE.Vector3(-500, 0, z),
                new THREE.Vector3(500, 0, z)
            );
        }
        const groundMaterial = new THREE.MeshBasicMaterial({ color: "white" });
        this.groundMesh = new THREE.LineSegments(groundGeometry, groundMaterial);
        this.groundMesh.position.y = -1;
        this.scene.add(this.groundMesh);
    }

    setupFont() {
        const fontLoader = new THREE.FontLoader();
        this.font = fontLoader.parse(require('../../assets/fonts/helvetiker_regular.typeface.json'));
    }

    setupPlayerGeometry() {
        this.playerGeometry = [
            new THREE.BoxBufferGeometry(),
            new THREE.SphereBufferGeometry(0.5),
            new THREE.ConeBufferGeometry(0.5),
            new THREE.CylinderBufferGeometry(0.5, 0.5),
            new THREE.DodecahedronBufferGeometry(0.5)
        ];
    }

    setupPlayer() {
        this.player = {
            positionZ: 0,
            moving: false,
        }
        this.playerGroup = new THREE.Group();
        this.scene.add(this.playerGroup);

        firebase.database.ref('players/' + firebase.uid).on('value', snapshot => {
            let player = snapshot.val();
            
            if(this.playerMesh) {
                this.playerGroup.remove(this.playerMesh);
            }
            const playerGeometry = this.playerGeometry[player.currentSkin || 0];
            const playerMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff, overdraw: 0.5 });
            this.playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
            this.playerGroup.add(this.playerMesh);

            if(this.textMesh) {
                this.playerGroup.remove(this.textMesh);
            }
            let playerName = player.name;
            const textGeometry = new THREE.TextGeometry(playerName, { font: this.font, size: 0.5, height: 0 });
            const textMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
            this.textMesh = new THREE.Mesh(textGeometry, textMaterial);
            this.textMesh.position.x = 0;
            this.textMesh.position.y = 1.5;
            this.textMesh.rotation.y = Math.PI;
            this.playerGroup.add(this.textMesh);
        });

        this.playerGroup.position.z = this.player.positionZ;
    }

    setupOtherPlayers() {
        this.otherPlayers = [];

        firebase.database.ref('players').orderByChild('playing').equalTo(true).on('value', snapshot => {
            let x = Math.floor(snapshot.numChildren() / 2) - snapshot.numChildren();
            snapshot.forEach(playerSnapshot => {
                if(playerSnapshot.key === firebase.uid) {
                    return;
                }

                let player = playerSnapshot.val();
                if(player) {
                    const material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xeeeeee, overdraw: 0.5 });
                    if(!this.otherPlayers[playerSnapshot.key]) {
                        this.otherPlayers[playerSnapshot.key] = {};
                    } else {
                        this.scene.remove(this.otherPlayers[playerSnapshot.key].mesh);
                    }
                    this.otherPlayers[playerSnapshot.key].name = player.name;
                    let otherPlayerGeometry;
                    if(player.currentSkin) {
                        otherPlayerGeometry = this.playerGeometry[player.currentSkin];
                    } else {
                        otherPlayerGeometry = this.playerGeometry[0];
                    }
                    this.otherPlayers[playerSnapshot.key].group = new THREE.Group();
                    this.otherPlayers[playerSnapshot.key].mesh = new THREE.Mesh(otherPlayerGeometry, material);

                    if(x === 0) {
                        x++;
                    }
                    this.otherPlayers[playerSnapshot.key].group.position.x = x++;
                    this.otherPlayers[playerSnapshot.key].group.add(this.otherPlayers[playerSnapshot.key].mesh);

                    const textGeometry = new THREE.TextGeometry(this.otherPlayers[playerSnapshot.key].name, { font: this.font, size: 0.5, height: 0 });
                    const textMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
                    this.otherPlayers[playerSnapshot.key].text = new THREE.Mesh(textGeometry, textMaterial);
                    this.otherPlayers[playerSnapshot.key].text.position.x = 0;
                    this.otherPlayers[playerSnapshot.key].text.position.y = 1.5;
                    this.otherPlayers[playerSnapshot.key].text.rotation.y = Math.PI;
                    this.otherPlayers[playerSnapshot.key].group.add(this.otherPlayers[playerSnapshot.key].text);

                    this.scene.add(this.otherPlayers[playerSnapshot.key].group);
                }
            });
        });

        socketIO.socket.on('minigames/redLightGreenLight/player', (playerId, player) => {
            if(playerId === firebase.uid) {
                return;
            }
            if(!this.otherPlayers[playerId]) {
                this.otherPlayers[playerId] = {};
            }
            this.otherPlayers[playerId].initialPositionZ = this.otherPlayers[playerId].positionZ;
            this.otherPlayers[playerId].targetPositionZ = player.positionZ;
            if(!this.otherPlayers[playerId].moving && this.otherPlayers[playerId].initialPositionZ !== this.otherPlayers[playerId].targetPositionZ) {
                this.otherPlayers[playerId].moving = true;
                let deltaPositionZ = this.otherPlayers[playerId].targetPositionZ - this.otherPlayers[playerId].initialPositionZ;
                let moveDuration = 0.1;
                if(this.otherPlayers[playerId].group) {
                    TweenLite.to(this.otherPlayers[playerId].group.position, moveDuration, { y: 1, z: this.otherPlayers[playerId].initialPositionZ + deltaPositionZ * 0.75 });
                    TweenLite.to(this.otherPlayers[playerId].group.scale, moveDuration, { y: 1.2, z: 1 });
                    TweenLite.to(this.otherPlayers[playerId].group.scale, moveDuration, { y: 0.8, z: 1, delay: moveDuration });
                    TweenLite.to(this.otherPlayers[playerId].group.scale, moveDuration, { y: 1, z: 1, ease: Bounce.easeOut, delay: moveDuration * 2 });
                    TweenLite.to(this.otherPlayers[playerId].group.position, moveDuration, { y: 0, z: this.otherPlayers[playerId].targetPositionZ, ease: Power4.easeOut, delay: moveDuration * 1.51, onComplete: () => { this.otherPlayers[playerId].positionZ = player.positionZ; this.otherPlayers[playerId].moving = false; } });
                }
                this.otherPlayers[playerId].initialPositionZ = this.otherPlayers[playerId].targetPositionZ;
            }
        });
    }

    setupGreenLight() {
        this.greenLight = true;

        socketIO.socket.on('minigames/redLightGreenLight/greenLight', greenLight => {
            this.greenLight = greenLight;
        });
    }

    sendPlayerState = () => {
        if(firebase.isAuthed) {
            socketIO.socket.emit('minigames/redLightGreenLight/player', firebase.uid, this.player);
        }
    }

    onTouchesBegan(state) {
        TweenLite.to(this.playerGroup.scale, 0.2, { x: 1.2, y: 0.75, z: 1 });
    }

    onTouchesEnded() {
        if(!this.player.moving) {
            this.player.moving = true;
            this.initialPositionZ = this.player.positionZ;
            if(this.greenLight) {
                this.targetPositionZ = this.player.positionZ + 1;
            }
            else {
                this.targetPositionZ = this.player.positionZ - 2;
            }
            
            let deltaPositionZ = this.targetPositionZ - this.initialPositionZ;
            let moveDuration = 0.1;
            TweenLite.to(this.playerGroup.position, moveDuration, { x: 0, y: 1, z: this.initialPositionZ + deltaPositionZ * 0.75 });
            TweenLite.to(this.playerGroup.scale, moveDuration, { x: 1, y: 1.2, z: 1 });
            TweenLite.to(this.playerGroup.scale, moveDuration, { x: 1, y: 0.8, z: 1, delay: moveDuration });
            TweenLite.to(this.playerGroup.scale, moveDuration, { x: 1, y: 1, z: 1, ease: Bounce.easeOut, delay: moveDuration * 2 });
            TweenLite.to(this.playerGroup.position, moveDuration, { x: 0, y: 0, z: this.targetPositionZ, ease: Power4.easeOut, delay: moveDuration * 1.51, onComplete: this.doneMoving });
            this.initialPositionZ = this.targetPositionZ;
        }
    }

    doneMoving = () => {
        this.player.moving = false;
        this.player.positionZ = this.targetPositionZ;
    }

    update(delta) {
        if(this.camera) {
            this.camera.position.x = this.cameraOffset.x;
            this.camera.position.y = this.cameraOffset.y;
            this.camera.position.z = this.playerGroup.position.z + this.cameraOffset.z;
        }
        
        if(this.scene) {
            if(this.greenLight) {
                this.scene.background = this.sceneGreenColor;
            }
            else {
                this.scene.background = this.sceneRedColor;
            }
        }
    }

    render() {
        if(this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    shutdown() {
        firebase.database.ref('players/' + firebase.uid).off();
        firebase.database.ref('players').off();

        clearInterval(this.sendStateInterval);

        this.cleanupScene();
        this.cleanupCamera();
    }

    cleanupScene()  {
        if(this.scene) {
            while(this.scene.children.length > 0) { 
                this.scene.remove(this.scene.children[0]); 
            }
            this.scene = null;
        }
        this.sceneGreenColor = null;
        this.sceneRedColor = null;
    }

    cleanupCamera() {
        this.camera = null;
        this.cameraOffset = null;
    }
}

export default RedLightGreenLightScene;