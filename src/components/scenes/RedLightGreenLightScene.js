import THREE from '../../THREE';
import firebase from '../../Firebase';

class RedLightGreenLightScene {
    player = {
        positionY: 0,
        velocityY: 0,
        tapAccelerationY: 5,
    }
    
    greenLight = true;
    otherPlayers = [];
    otherPlayerCount = 10;

    constructor(renderer) {
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.camera.position.x = 0;
        this.camera.position.y = -5;
        this.camera.position.z = 5;
        this.camera.lookAt(new THREE.Vector3());
        this.camera.rotation.z = 0;

        const backgroundGeometry = new THREE.Geometry();
        for(let y = 0; y <= 1000; y += 10) {
            backgroundGeometry.vertices.push(
                new THREE.Vector3(-1000, y, 0),
                new THREE.Vector3(1000, y, 0)
            );
        }
        const backgroundMaterial = new THREE.MeshBasicMaterial({ color: "black" });
        this.backgroundMesh = new THREE.LineSegments(backgroundGeometry, backgroundMaterial);
        this.scene.add(this.backgroundMesh);

        const ambientLight = new THREE.AmbientLight( 0x404040 );
        this.scene.add(ambientLight);

        let directionalLight1 = new THREE.DirectionalLight( 0xffffff );
        directionalLight1.position.x = Math.random() - 0.5;
        directionalLight1.position.y = Math.random() - 0.5;
        directionalLight1.position.z = Math.random() - 0.5;
        this.scene.add(directionalLight1);

        let directionalLight2 = new THREE.DirectionalLight( 0x808080 );
        directionalLight2.position.x = Math.random() - 0.5;
        directionalLight2.position.y = Math.random() - 0.5;
        directionalLight2.position.z = Math.random() - 0.5;
        this.scene.add(directionalLight2);
        
        const playerGeometry = new THREE.BoxGeometry();
        const playerMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff, overdraw: 0.5 });
        this.playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
        this.scene.add(this.playerMesh);

        let x = Math.floor(this.otherPlayerCount / 2) - this.otherPlayerCount;
        for(let player = 0; player < this.otherPlayerCount; player++) {
            const material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xeeeeee, overdraw: 0.5 });
            this.otherPlayers[player] = {};
            this.otherPlayers[player].mesh = new THREE.Mesh(playerGeometry, material);
            
            if(x === 0) {
                x++;
            }

            this.otherPlayers[player].mesh.position.x = x++;
            this.scene.add(this.otherPlayers[player].mesh);
        }

        firebase.database().ref('minigame/redLightGreenLight/players').on('value', snapshot => {
            let index = 0;
            snapshot.forEach(player => {
                if(player.key === firebase.auth().currentUser.uid) {
                    return;
                }
                if(this.otherPlayers[index] && player.val()) {
                    this.otherPlayers[index].positionY = player.val().positionY;
                    this.otherPlayers[index].velocityY = player.val().velocityY;
                    index++;
                }
            });
        });
        firebase.database().ref('minigame/redLightGreenLight/greenLight').on('value', snapshot => {
            let greenLight = snapshot.val();
            this.greenLight = greenLight;
        })

        this.sendStateInterval = setInterval(() => { this.sendPlayerState(); }, 16);

        this.initialize();
    }

    initialize() {
        this.player.positionY = 0;
        this.player.velocityY = 0;
        this.playerMesh.position.y = this.player.positionY;
        
        this.camera.position.x = 0;
        this.camera.position.y = this.player.positionY - 5;
        this.camera.position.z = 5;

        this.otherPlayers.forEach(player => {
            player.positionY = 0;
            player.velocityY = 0;
            player.mesh.position.y = player.positionY;
        });

        this.greenLight = true;
        this.scene.background = new THREE.Color(0xffffff);
    }

    sendPlayerState() {
        if(firebase.auth().currentUser) {
            firebase.database().ref('minigame/redLightGreenLight/players/' + firebase.auth().currentUser.uid).set(this.player);
        }
        else {
            this.props.history.replace('/');
        }
    }

    onTouchesBegan(state) {
        this.tap();
    }

    tap() {
        if(this.greenLight) {
            this.player.velocityY = this.player.tapAccelerationY;
        }
        else {
            this.player.velocityY = -2 * this.player.tapAccelerationY;
        }
    }

    update(delta) {
        this.player.velocityY *= 0.95;
        this.player.positionY += this.player.velocityY * delta;
        if(this.player.positionY <= 0) {
            this.player.positionY = 0;
        }
        this.playerMesh.position.y = this.player.positionY;
        this.camera.position.x = 0;
        this.camera.position.y = this.player.positionY - 5;
        this.camera.position.z = 5;

        this.otherPlayers.forEach(player => {
            player.mesh.position.y = player.positionY;
        });

        if(this.greenLight) {
            this.scene.background = new THREE.Color(0xffffff);
        }
        else {
            this.scene.background = new THREE.Color(0xff0000);
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    shutdown() {
        firebase.database().ref('minigame/redLightGreenLight/players').off();

        clearInterval(this.sendStateInterval);

        while(this.scene.children.length > 0) { 
            this.scene.remove(this.scene.children[0]); 
        }
    }
}

export default RedLightGreenLightScene;