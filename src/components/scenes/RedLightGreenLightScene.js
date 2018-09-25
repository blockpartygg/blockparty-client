import THREE from '../../THREE';
import firebase from '../../Firebase';

class RedLightGreenLightScene {
    player = {
        positionZ: 0,
        velocityZ: 0,
        tapAccelerationZ: 5,
    }
    
    greenLight = true;
    otherPlayers = [];
    otherPlayerCount = 10;

    constructor(renderer) {
        this.renderer = renderer;

        this.setupScene();
        this.setupCamera();
        this.setupGround();
        
        const blockGeometry = new THREE.BoxGeometry();
        const sphereGeometry = new THREE.SphereGeometry(0.5);
        
        let playerGeometry = blockGeometry;
        const playerMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff, overdraw: 0.5 });
        this.playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
        this.scene.add(this.playerMesh);

        let x = Math.floor(this.otherPlayerCount / 2) - this.otherPlayerCount;
        for(let player = 0; player < this.otherPlayerCount; player++) {
            const material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xeeeeee, overdraw: 0.5 });
            this.otherPlayers[player] = {};
            this.otherPlayers[player].mesh = new THREE.Mesh(blockGeometry, material);
            
            if(x === 0) {
                x++;
            }

            this.otherPlayers[player].mesh.position.x = x++;
            this.scene.add(this.otherPlayers[player].mesh);
        }

        firebase.database().ref('players/' + firebase.auth().currentUser.uid + '/currentSkin').on('value', snapshot => {
            let currentSkin = snapshot.val();
            if(currentSkin !== null) {
                switch(currentSkin) {
                    case 0:
                        playerGeometry = blockGeometry;
                        break;
                    case 1:
                        playerGeometry = sphereGeometry;
                        break;
                    default: 
                        playerGeometry = blockGeometry;
                        break;
                }
            }
            else {
                playerGeometry = blockGeometry;
            }
            const playerMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff, overdraw: 0.5 });
            this.scene.remove(this.playerMesh);
            this.playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
            this.scene.add(this.playerMesh);
        });

        firebase.database().ref('minigame/redLightGreenLight/players').on('value', snapshot => {
            let index = 0;
            snapshot.forEach(player => {
                if(player.key === firebase.auth().currentUser.uid) {
                    return;
                }
                if(this.otherPlayers[index] && player.val()) {
                    this.otherPlayers[index].positionZ = player.val().positionZ;
                    this.otherPlayers[index].velocityZ = player.val().velocityZ;
                    index++;
                }
            });
        });
        firebase.database().ref('minigame/redLightGreenLight/greenLight').on('value', snapshot => {
            let greenLight = snapshot.val();
            this.greenLight = greenLight;
        })

        this.sendStateInterval = setInterval(() => { this.sendPlayerState(); }, 1000 / 60);

        this.initialize();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.sceneGreenColor = new THREE.Color(0x00ff00);
        this.sceneGreenFog = new THREE.Fog(this.sceneGreenColor, 1, 100);
        this.sceneRedColor = new THREE.Color(0xff0000);
        this.sceneRedFog = new THREE.Fog(this.sceneRedColor, 1, 100);
        this.scene.background = this.sceneGreenColor;
        this.scene.fog = this.sceneGreenFog;
        
        let hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);
        this.scene.add(hemisphereLight);

        let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 0, -1).normalize();
        this.scene.add(directionalLight);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.cameraOffset = new THREE.Vector3(0, 1, -5);
        this.camera.position.x = this.cameraOffset.x;
        this.camera.position.y = this.cameraOffset.y;
        this.camera.position.z = this.cameraOffset.z;
        this.camera.lookAt(new THREE.Vector3());
        this.camera.rotation.z = Math.PI;
    }

    setupGround() {
        const groundGeometry = new THREE.PlaneBufferGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x333333, overdraw: 0.5 });
        this.groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        this.groundMesh.position.y = -0.5;
        this.groundMesh.rotation.x = -Math.PI / 2;
        this.scene.add(this.groundMesh);

        const lineGeometry = new THREE.Geometry();
        for(let z = 0; z <= 1000; z += 10) {
            lineGeometry.vertices.push(
                new THREE.Vector3(-500, 0, z),
                new THREE.Vector3(500, 0, z)
            );
        }
        const lineMaterial = new THREE.MeshBasicMaterial({ color: "white" });
        this.lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
        this.lineMesh.position.y = -0.5;
        this.scene.add(this.lineMesh);
    }

    initialize() {
        this.player.positionZ = 0;
        this.player.velocityZ = 0;
        this.playerMesh.position.z = this.player.positionZ;
        
        this.camera.position.x = this.cameraOffset.x;
        this.camera.position.y = this.cameraOffset.y;
        this.camera.position.z = this.player.positionZ + this.cameraOffset.z;

        this.otherPlayers.forEach(player => {
            player.positionZ = 0;
            player.velocityZ = 0;
            player.mesh.position.z = player.positionZ;
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
            this.player.velocityZ = this.player.tapAccelerationZ;
        }
        else {
            this.player.velocityZ = -2 * this.player.tapAccelerationZ;
        }
    }

    update(delta) {
        this.player.velocityZ *= 0.95;
        this.player.positionZ += this.player.velocityZ * delta;
        if(this.player.positionZ <= 0) {
            this.player.positionZ = 0;
        }
        this.playerMesh.position.z = this.player.positionZ;
        this.camera.position.x = this.cameraOffset.x;
        this.camera.position.y = this.cameraOffset.y;
        this.camera.position.z = this.player.positionZ + this.cameraOffset.z;

        this.otherPlayers.forEach(player => {
            player.mesh.position.z = player.positionZ;
        });

        if(this.greenLight) {
            this.scene.background = this.sceneGreenColor;
            this.scene.fog = this.sceneGreenFog;
        }
        else {
            this.scene.background = this.sceneRedColor;
            this.scene.fog = this.sceneRedFog;
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