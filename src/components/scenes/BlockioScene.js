import { Dimensions } from 'react-native';
import THREE from '../../THREE';
import firebase from '../../Firebase';

class BlockioScene {
    player = {
        positionX: 0,
        positionY: 0,
        velocityX: 0,
        velocityY: 0,
        accelerationX: 0,
        accelerationY: 0,
        speed: 20,
    }
    
    otherPlayers = [];
    otherPlayerCount = 100;

    food = [];

    dimensions = Dimensions.get('window');
    touch = new THREE.Vector2();

    constructor(renderer) {
        this.renderer = renderer;
        
        this.setupScene();

        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.camera.position.x = 0;
        this.camera.position.y = -5;
        this.camera.position.z = 5;
        this.camera.lookAt(new THREE.Vector3());
        this.camera.rotation.z = 0;

        const backgroundGeometry = new THREE.Geometry();
        for(let y = -50; y <= 50; y += 10) {
            backgroundGeometry.vertices.push(
                new THREE.Vector3(-50, y, 0),
                new THREE.Vector3(50, y, 0)
            );
        }
        for(let x = -50; x <= 50; x += 10) {
            backgroundGeometry.vertices.push(
                new THREE.Vector3(x, -50, 0),
                new THREE.Vector3(x, 50, 0)
            );
        }
        const backgroundMaterial = new THREE.MeshBasicMaterial({ color: "black" });
        this.backgroundMesh = new THREE.LineSegments(backgroundGeometry, backgroundMaterial);
        this.scene.add(this.backgroundMesh);
        
        const playerGeometry = new THREE.BoxGeometry();
        const playerMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff, overdraw: 0.5 });
        this.playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
        this.scene.add(this.playerMesh);

        for(let player = 0; player < this.otherPlayerCount; player++) {
            const material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xeeeeee, overdraw: 0.5 });
            this.otherPlayers[player] = {};
            this.otherPlayers[player].mesh = new THREE.Mesh(playerGeometry, material);
            this.scene.add(this.otherPlayers[player].mesh);
        }

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

        firebase.database.ref('minigame/blockio/players').on('value', snapshot => {
            let index = 0;
            snapshot.forEach(player => {
                if(player.key === firebase.uid) {
                    return;
                }
                if(this.otherPlayers[index] && player.val()) {
                    this.otherPlayers[index].positionX = player.val().positionX;
                    this.otherPlayers[index].positionY = player.val().positionY;
                    index++;
                }
            });
        });

        this.sendStateInterval = setInterval(() => { this.sendPlayerState(); }, 16);

        this.initialize();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        let sceneColor = new THREE.Color(0xf0f0f0);
        this.scene.background = sceneColor;
        this.scene.fog = new THREE.Fog(sceneColor, 1, 500);

        let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 0, 1).normalize();
        this.scene.add(directionalLight);
    }

    initialize() {
        this.player.positionX = Math.random() * 100 - 50;
        this.player.positionY = Math.random() * 100 - 50;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.playerMesh.position.x = this.player.positionX;
        this.playerMesh.position.y = this.player.positionY;
        
        this.camera.position.x = this.player.positionX;
        this.camera.position.y = this.player.positionY - 5;
        this.camera.position.z = 5;

        this.otherPlayers.forEach(player => {
            player.positionY = 0;
            player.velocityY = 0;
            player.mesh.position.x = player.positionX;
            player.mesh.position.y = player.positionY;
        });
    }

    sendPlayerState() {
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
        if(this.player.positionX <= -50) {
            this.player.positionX = -50;
        }
        if(this.player.positionX >= 50) {
            this.player.positionX = 50;
        }
        if(this.player.positionY <= -50) {
            this.player.positionY = -50;
        }
        if(this.player.positionY >= 50) {
            this.player.positionY = 50;
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

        this.playerMesh.position.x = this.player.positionX;
        this.playerMesh.position.y = this.player.positionY;
        this.camera.position.x = this.player.positionX;
        this.camera.position.y = this.player.positionY - 5;
        this.camera.position.z = 5;

        this.otherPlayers.forEach(player => {
            player.mesh.position.x = player.positionX;
            player.mesh.position.y = player.positionY;
        });
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