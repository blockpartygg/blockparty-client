import { Dimensions } from 'react-native';
import THREE from '../../THREE';
import firebase from '../../Firebase';
import socketIO from '../../SocketIO';

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
        // this.setupOtherPlayers();
        // this.setupFood();
        this.joinGame();
        this.sendStateInterval = setInterval(this.sendPlayerState, 1000 / 60);
    }

    setupScene() {
        this.scene = new THREE.Scene();
        const sceneColor = new THREE.Color(0xf0f0f0);
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
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
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
            position: {
                x: Math.random() * 10 - 5,
                y: Math.random() * 10 - 5,
            },
            velocity: {
                x: 0,
                y: 0,
            },
            acceleration: {
                x: 0,
                y: 0,
            },
            speed: 20,
        }

        this.playerGroup = new THREE.Group();
        this.playerGroup.position.x = this.player.position.x;
        this.playerGroup.position.y = this.player.position.y;
        this.scene.add(this.playerGroup);

        firebase.database.ref('players/' + firebase.uid).on('value', snapshot => {
            const player = snapshot.val();

            // setup player avatar mesh
            if(this.playerAvatarMesh) {
                this.playerGroup.remove(this.playerAvatarMesh);
            }
            const avatarGeometry = this.avatarGeometry[player.currentSkin || 0];
            const avatarMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff, overdraw: 0.5 });
            this.playerAvatarMesh = new THREE.Mesh(avatarGeometry, avatarMaterial);
            this.playerGroup.add(this.playerAvatarMesh);

            // setup player name mesh
            if(this.playerNameMesh) {
                this.playerGroup.remove(this.playerNameMesh);
            }
            const nameGeometry = new THREE.TextGeometry(player.name, { font: this.font, size: 0.5, height: 0 });
            const nameMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff, overdraw: 0.5 });
            this.playerNameMesh = new THREE.Mesh(nameGeometry, nameMaterial);
            nameGeometry.computeBoundingBox();
            this.playerNameMesh.position.x = -nameGeometry.boundingBox.max.x / 2;
            this.playerNameMesh.position.y = 1.5;
            this.playerGroup.add(this.playerNameMesh);
        });
    }

    setupOtherPlayers() {
        this.otherPlayers = [];

        firebase.database.ref('players').orderByChild('playing').equalTo(true).on('value', snapshot => {
            snapshot.forEach(playerSnapshot => {
                if(playerSnapshot.key === firebase.uid) {
                    return;
                }

                const player = playerSnapshot.val();
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

        socketIO.socket.on('minigames/blockio/setPlayer', (playerId, player) => {
            if(playerId === firebase.uid) {
                return;
            }
            if(!this.otherPlayers[playerId]) {
                this.otherPlayers[playerId] = {};
            }
            this.otherPlayers[playerId].positionX = player.positionX;
            this.otherPlayers[playerId].positionY = player.positionY;
            if(this.otherPlayers[playerId].group) {
                this.otherPlayers[playerId].group.position.x = this.otherPlayers[playerId].positionX;
                this.otherPlayers[playerId].group.position.y = this.otherPlayers[playerId].positionY;
            }
        });
    }

    setupFood() {
        this.food = [];
        this.foodGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

        socketIO.socket.emit('minigames/blockio/getFood', food => {
            console.log('got food');
            console.log(food);
            const foodIds = Object.keys(food);
            foodIds.forEach(foodId => {
                const newFood = food[foodId];
                this.food[foodId] = new THREE.Mesh(this.foodGeometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
                this.food[foodId].active = newFood.active;
                this.food[foodId].position.x = newFood.position.x;
                this.food[foodId].position.y = newFood.position.y;
                this.food[foodId].name = foodId;
                this.scene.add(this.food[foodId]);
            });
        });

        socketIO.socket.on('minigames/blockio/addFood', (foodId, food) => {
            console.log('adding food ' + foodId);
            this.food[foodId] = new THREE.Mesh(this.foodGeometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
            this.food[foodId].active = food.active;
            this.food[foodId].position.x = food.position.x;
            this.food[foodId].position.y = food.position.y;
            this.food[foodId].name = foodId;
            this.scene.add(this.food[foodId]);
        });
        
        socketIO.socket.on('minigames/blockio/removeFood', (foodId) => {
            console.log('removing food ' + foodId);
            this.scene.remove(this.food[foodId]);
            this.food[foodId] = null;
        });
    }

    joinGame() {
        socketIO.socket.emit('minigames/blockio/joinGame');
    }

    sendPlayerState = () => {
        if(firebase.isAuthed) {
            socketIO.socket.emit('minigames/blockio/setPlayer', firebase.uid, this.player);
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
        this.player.acceleration.x = this.touch.x;
        this.player.acceleration.y = this.touch.y;
    }

    update(delta) {
        this.player.velocity.x += this.player.acceleration.x * this.player.speed * delta;
        this.player.velocity.y += this.player.acceleration.y * this.player.speed * delta;
        this.player.velocity.x *= 0.95;
        this.player.velocity.y *= 0.95;
        this.player.acceleration.x = 0;
        this.player.acceleration.y = 0;
        this.player.position.x += this.player.velocity.x * delta;
        this.player.position.y += this.player.velocity.y * delta;
        if(this.player.position.x <= -5) {
            this.player.position.x = -5;
        }
        if(this.player.position.x >= 5) {
            this.player.position.x = 5;
        }
        if(this.player.position.y <= -5) {
            this.player.position.y = -5;
        }
        if(this.player.position.y >= 5) {
            this.player.position.y = 5;
        }

        const foodIds = Object.keys(this.food);
        foodIds.forEach(foodId => {
            const food = this.food[foodId];
            if(food) {
                let deltaX = this.player.position.x - food.position.x;
                let deltaY = this.player.position.y - food.position.y;
                let distance = deltaX * deltaX + deltaY * deltaY;
                if(distance < 1 && food.active) {
                    this.food[foodId].active = false;
                    socketIO.socket.emit('minigames/blockio/eatFood', foodId, firebase.uid);
                }
            }
        });

        if(this.playerGroup) {
            this.playerGroup.position.x = this.player.position.x;
            this.playerGroup.position.y = this.player.position.y;
        }

        this.camera.position.x = this.player.position.x + this.cameraOffset.x;
        this.camera.position.y = this.player.position.y + this.cameraOffset.y;
        this.camera.position.z = this.player.position.z + this.cameraOffset.z;
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    shutdown() {
        firebase.database.ref('players/' + firebase.uid).off();

        clearInterval(this.sendStateInterval);

        while(this.scene.children.length > 0) { 
            this.scene.remove(this.scene.children[0]); 
        }
    }
}

export default BlockioScene;