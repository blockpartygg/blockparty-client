import { Dimensions } from 'react-native';
import THREE from '../../THREE';
import firebase from '../../Firebase';

class BlockioScene {
    constructor(renderer) {
        this.renderer = renderer;
    }

    initialize() {
        this.dimensions = Dimensions.get('window');
        this.touch = new THREE.Vector2();
        this.setupScene();
        this.setupCamera();
        this.setupLighting();
        this.setupGround();
        this.setupFont();
        this.setupAvatarGeometry();
        this.setupPlayer();
        this.setupOtherPlayers();
        this.setupFood();
        this.sendStateInterval = setInterval(this.sendPlayerState, 1000 / 60);
    }

    setupScene() {
        this.scene = new THREE.Scene();
        let sceneColor = new THREE.Color(0xf0f0f0);
        this.scene.background = sceneColor;
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.cameraOffset = new THREE.Vector3(0, -5, 5);
        this.camera.position.x = this.cameraOffset.x;
        this.camera.position.y = this.cameraOffset.y;
        this.camera.position.z = this.cameraOffset.z;
        this.camera.lookAt(this.scene.position);
        this.camera.rotation.z = 0;
    }

    setupLighting() {
        let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 0, 1).normalize();
        this.scene.add(directionalLight);
    }

    setupGround() {
        const groundGeometry = new THREE.Geometry();
        for(let y = -5; y <= 5; y += 1) {
            groundGeometry.vertices.push(
                new THREE.Vector3(-5, y, 0),
                new THREE.Vector3(5, y, 0)
            );
        }
        for(let x = -5; x <= 5; x += 1) {
            groundGeometry.vertices.push(
                new THREE.Vector3(x, -5, 0),
                new THREE.Vector3(x, 5, 0)
            );
        }
        const groundMaterial = new THREE.MeshBasicMaterial({ color: "black" });
        this.groundMesh = new THREE.LineSegments(groundGeometry, groundMaterial);
        this.groundMesh.position.z = -1;
        this.scene.add(this.groundMesh);
    }

    setupFont() {
        const fontLoader = new THREE.FontLoader();
        this.font = fontLoader.parse(require('../../assets/fonts/helvetiker_regular.typeface.json'));
    }

    setupAvatarGeometry() {
        this.avatarGeometry = [
            new THREE.BoxBufferGeometry(),
            new THREE.SphereBufferGeometry(0.5),
            new THREE.ConeBufferGeometry(0.5),
            new THREE.CylinderBufferGeometry(0.5, 0.5),
            new THREE.DodecahedronBufferGeometry(0.5)
        ];
    }

    setupPlayer() {
        this.player = {
            positionX: 0,
            positionY: 0,
            velocityX: 0,
            velocityY: 0,
            accelerationX: 0,
            accelerationY: 0,
            speed: 20,
        }
        this.player.positionX = Math.random() * 10 - 5;
        this.player.positionY = Math.random() * 10 - 5;
        this.player.velocityX = 0;
        this.player.velocityY = 0;

        this.playerGroup = new THREE.Group();
        this.playerGroup.position.x = this.player.positionX;
        this.playerGroup.position.y = this.player.positionY;
        this.scene.add(this.playerGroup);

        firebase.database.ref('players/' + firebase.uid).on('value', snapshot => {
            let player = snapshot.val();

            if(this.playerMesh) {
                this.playerGroup.remove(this.playerMesh);
            }
            let avatarGeometry = this.avatarGeometry[player.currentSkin || 0];
            const color = 0x0000ff;
            const avatarMaterial = new THREE.MeshLambertMaterial({ color: color, overdraw: 0.5 });
            this.avatarMesh = new THREE.Mesh(avatarGeometry, avatarMaterial);
            this.playerGroup.add(this.avatarMesh);

            if(this.nameMesh) {
                this.playerGroup.remove(this.nameMesh);
            }
            let name = player.name;
            const nameGeometry = new THREE.TextGeometry(name, { font: this.font, size: 0.5, height: 0 });
            const nameMaterial = new THREE.MeshPhongMaterial({ color: color, overdraw: 0.5 });
            this.nameMesh = new THREE.Mesh(nameGeometry, nameMaterial);
            this.nameMesh.position.x = 0;
            this.nameMesh.position.y = 1.5;
            this.playerGroup.add(this.nameMesh);
        });
    }

    setupOtherPlayers() {
        this.otherPlayers = [];

        firebase.database.ref('players').orderByChild('playing').equalTo(true).on('value', snapshot => {
            snapshot.forEach(playerSnapshot => {
                if(playerSnapshot.key === firebase.uid) {
                    return;
                }

                let player = playerSnapshot.val();
                if(player) {
                    if(!this.otherPlayers[playerSnapshot.key]) {
                        this.otherPlayers[playerSnapshot.key] = {};
                    } else {
                        this.scene.remove(this.otherPlayers[playerSnapshot.key].group);
                    }
                    this.otherPlayers[playerSnapshot.key].group = new THREE.Group();
                    this.scene.add(this.otherPlayers[playerSnapshot.key].group);

                    this.otherPlayers[playerSnapshot.key].name = player.name;
                    const avatarGeometry = this.avatarGeometry[player.currentSkin || 0];
                    const color = Math.random() * 0xffffff;
                    const avatarMaterial = new THREE.MeshLambertMaterial({ color: color, overdraw: 0.5 });
                    this.otherPlayers[playerSnapshot.key].mesh = new THREE.Mesh(avatarGeometry, avatarMaterial);
                    this.otherPlayers[playerSnapshot.key].group.add(this.otherPlayers[playerSnapshot.key].mesh);

                    const textGeometry = new THREE.TextGeometry(this.otherPlayers[playerSnapshot.key].name, { font: this.font, size: 0.5, height: 0 });
                    const textMaterial = new THREE.MeshLambertMaterial({ color: color });
                    this.otherPlayers[playerSnapshot.key].text = new THREE.Mesh(textGeometry, textMaterial);
                    this.otherPlayers[playerSnapshot.key].text.position.x = 0;
                    this.otherPlayers[playerSnapshot.key].text.position.y = 1.5;
                    this.otherPlayers[playerSnapshot.key].group.add(this.otherPlayers[playerSnapshot.key].text);
                }
            });
        });

        firebase.database.ref('minigame/blockio/players').on('value', snapshot => {
            snapshot.forEach(player => {
                if(player.key === firebase.uid) {
                    return;
                }
                if(player.val()) {
                    if(!this.otherPlayers[player.key]) {
                        this.otherPlayers[player.key] = {};
                    }
                    this.otherPlayers[player.key].positionX = player.val().positionX;
                    this.otherPlayers[player.key].positionY = player.val().positionY;
                    this.otherPlayers[player.key].group.position.x = this.otherPlayers[player.key].positionX;
                    this.otherPlayers[player.key].group.position.y = this.otherPlayers[player.key].positionY;
                }
            });
        });
    }

    setupFood() {
        this.food = [];
        this.foodGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        firebase.database.ref('minigame/blockio/food').on('child_added', snapshot => {
            let food = snapshot.val();
            this.food[snapshot.key] = new THREE.Mesh(this.foodGeometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
            this.food[snapshot.key].position.x = food.position.x;
            this.food[snapshot.key].position.y = food.position.y;
            this.food[snapshot.key].name = snapshot.key;
            this.scene.add(this.food[snapshot.key]);
        });
        firebase.database.ref('minigame/blockio/food').on('child_removed', snapshot => {
            this.scene.remove(this.food[snapshot.key]);
        });
    }

    sendPlayerState = () => {
        if(firebase.isAuthed) {
            firebase.database.ref('minigame/blockio/players/' + firebase.uid).set(this.player);
        }
    }

    onTouchesBegan(state) {
        this.touch.x = (state.pageX / this.dimensions.width) * 2 - 1;
        this.touch.y = - (state.pageY / this.dimensions.height) * 2 + 1;
        this.movePlayer();
    }
    
    onTouchesMoved(state) {
        this.touch.x = (state.pageX / this.dimensions.width) * 2 - 1;
        this.touch.y = - (state.pageY / this.dimensions.height) * 2 + 1;
        this.movePlayer();
    }

    onTouchesEnded(state) {
        this.touch.x = 0;
        this.touch.y = 0;
        this.movePlayer();
    }

    movePlayer() {
        this.player.accelerationX = this.touch.x;
        this.player.accelerationY = this.touch.y;
    }

    update(delta) {
        this.player.velocityX += this.player.accelerationX * this.player.speed * delta;
        this.player.velocityY += this.player.accelerationY * this.player.speed * delta;
        this.player.accelerationX = 0;
        this.player.accelerationY = 0;
        this.player.velocityX *= 0.95;
        this.player.velocityY *= 0.95;
        this.player.positionX += this.player.velocityX * delta;
        this.player.positionY += this.player.velocityY * delta;
        if(this.player.positionX <= -5) {
            this.player.positionX = -5;
        }
        if(this.player.positionX >= 5) {
            this.player.positionX = 5;
        }
        if(this.player.positionY <= -5) {
            this.player.positionY = -5;
        }
        if(this.player.positionY >= 5) {
            this.player.positionY = 5;
        }

        for(var key in this.food) {
            let food = this.food[key];
            let deltaX = this.player.positionX - food.position.x;
            let deltaY = this.player.positionY - food.position.y;
            let distance = deltaX * deltaX + deltaY * deltaY;
            if(distance < 1) {
                let foodId = food.name;
                firebase.database.ref('game/commands').push({
                    playerId: firebase.uid,
                    foodId: foodId
                });
            }
        }

        if(this.playerGroup) {
            this.playerGroup.position.x = this.player.positionX;
            this.playerGroup.position.y = this.player.positionY;
        }

        this.camera.position.x = this.player.positionX;
        this.camera.position.y = this.player.positionY - 5;
        this.camera.position.z = 5;
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    shutdown() {
        firebase.database.ref('minigame/blockio/players').off();
        firebase.database.ref('minigame/blockio/food').off();

        clearInterval(this.sendStateInterval);

        while(this.scene.children.length > 0) { 
            this.scene.remove(this.scene.children[0]); 
        }
    }
}

export default BlockioScene;