import React from 'react';
import { View } from 'react-native';
import ExpoTHREE from 'expo-three';
import { View as GraphicsView } from 'expo-graphics';
import { FontAwesome } from '@expo/vector-icons';
import firebase from '../../Firebase';
import TouchableView from '../TouchableView';
import analytics from '../../Analytics';

import PregameCountdown from '../states/PregameCountdown';
import PregameTitle from '../states/PregameTitle';
import PregameIntroduction from '../states/PregameIntroduction';
import RoundIntroduction from '../states/RoundIntroduction';
import RoundInstructions from '../states/RoundInstructions';
import MinigameStart from '../states/MinigameStart';
import MinigamePlay from '../states/MinigamePlay';
import MinigameEnd from '../states/MinigameEnd';
import RoundResultsScoreboard from '../states/RoundResultsScoreboard';
import RoundResultsLeaderboard from '../states/RoundResultsLeaderboard';
import PostgameCelebration from '../states/PostgameCelebration';
import PostgameRewards from '../states/PostgameRewards';

import BackgroundScene from '../scenes/BackgroundScene';
import RedLightGreenLightScene from '../scenes/RedLightGreenLightScene';
import BlockBlasterScene from '../scenes/BlockBlasterScene';
import BlockioScene from '../scenes/BlockioScene';
import PostgameRewardsScene from '../scenes/PostgameRewardsScene';

export default class Play extends React.Component {
    static navigationOptions = {
        header: null
    }

    state = {
        player: {},
        players: [],
        state: null,
        endTime: null,
        round: null,
        minigame: null,
        mode: null,
        team: null
    }

    scene = null;
    overlay = null;

    componentDidMount() {
        this.setupAuthListener();
        this.setupDatabaseListeners();

        this.didFocusListener = this.props.navigation.addListener('didFocus', () => {
            analytics.sendScreenView('Play');
        });
    }

    setupAuthListener() {
        this.unsubscribeAuthStateChanged = firebase.auth.onAuthStateChanged(user => {
            if(!user) {
                firebase.signOut(() => {
                    this.props.navigation.navigate('Title');
                });
            } else {
                firebase.database.ref('players/' + user.uid).on('value', snapshot => {
                    let player = snapshot.val();
                    if(!player) {
                        firebase.signOut(() => {
                            this.props.navigation.navigate('Title');
                        });
                    }
                    else {
                        if(!player.name) {
                            firebase.signOut(() => {
                                this.props.navigation.navigate('Title');
                            });
                        }
                        else {
                            this.setState({ player: player });
                        }
                    }
                });
            }
        });
    }

    setupDatabaseListeners() {
        firebase.database.ref('game/state').on('value', snapshot => {
            let state = snapshot.val();
            if(state) {
                this.setState({ state: state });
            }
        });
        firebase.database.ref('game/endTime').on('value', snapshot => {
            let endTime = snapshot.val();
            if(endTime) {
                this.setState({ endTime: endTime });
            }
        });
        firebase.database.ref('game/round').on('value', snapshot => {
            let round = snapshot.val();
            if(round) {
                this.setState({ round: round });
            }
        });
        firebase.database.ref('game/minigame').on('value', snapshot => {
            let minigame = snapshot.val();
            if(minigame) {
                this.setState({ minigame: minigame });
            }
        });
        firebase.database.ref('game/mode').on('value', snapshot => {
            let mode = snapshot.val();
            if(mode) {
                this.setState({ mode: mode });
                if(mode.name === "Free For All") {
                    this.setState({ team: null });
                }
            }
        });
        firebase.database.ref('game/teams/redTeamId').orderByValue().equalTo(firebase.uid).on('value', snapshot => {
            if(snapshot.val()) {
                this.setState({ team: "red" });
            }
        });
        firebase.database.ref('game/teams/blueTeamId').orderByValue().equalTo(firebase.uid).on('value', snapshot => {
            if(snapshot.val()) {
                this.setState({ team: "blue" });
            }
        });
        firebase.database.ref('players').on('value', snapshot => {
            let players = snapshot.val();
            if(players) {
                this.setState({ players: players });
            }
        });
    }

    startPurchase = () => {
        if(this.state.player.currency >= 100) {
            firebase.database.ref('players/' + firebase.uid + '/currency').set(this.state.player.currency - 100);
            let skinId = Math.floor(Math.random() * 5);
            firebase.database.ref('players/' + firebase.uid + '/currentSkin').set(skinId);
            this.postgameRewardsScene.startPurchase();
        }
    }

    onPressBack = () => { 
        firebase.database.ref('players/' + firebase.uid).update({ playing: false });
        analytics.sendEvent('Navigation', 'Navigate', 'Home');
        this.props.navigation.goBack(); 
    }

    render() {
        if(!this.state) {
            return null;
        }

        let overlay = this.setupOverlay();

        return(
            <View pointerEvents="box-none" style={{ flex: 1 }}>              
                <TouchableView onTouchesBegan={this.onTouchesBegan} onTouchesMoved={this.onTouchesMoved} onTouchesEnded={this.onTouchesEnded} style={{ flex: 1, overflow: "hidden" }}>
                    <GraphicsView ref={ref => (global.gameRef = this.ref = ref)} key="game" onContextCreate={this.onContextCreate} onRender={this.onRender} onResize={this.onResize} />
                </TouchableView>
                <View style={{ position: "absolute", left: 5, top: 30 }}>
                    <FontAwesome.Button onPress={this.onPressBack} name="chevron-left" color="white" backgroundColor="transparent" />
                </View>  
                {overlay}
            </View>
        )
    }

    setupOverlay() {
        let overlay;
        switch(this.state.state) {
            case "pregameCountdown":
                overlay = <PregameCountdown endTime={this.state.endTime} />
                break;
            case "pregameTitle":
                overlay = <PregameTitle />
                break;
            case "pregameIntroduction":
                overlay = <PregameIntroduction />
                break;
            case "roundIntroduction":
                overlay = <RoundIntroduction round={this.state.round} minigame={this.state.minigame} mode={this.state.mode} />
                break;
            case "roundInstructions":
                overlay = <RoundInstructions round={this.state.round} minigame={this.state.minigame} mode={this.state.mode} team={this.state.team} />
                break;
            case "minigameStart":
                overlay = <MinigameStart />
                break;
            case "minigamePlay": 
                overlay = <MinigamePlay endTime={this.state.endTime} />
                break;
            case "minigameEnd":
                overlay = <MinigameEnd />
                break;
            case "roundResultsScoreboard":
                overlay = <RoundResultsScoreboard players={this.state.players} round={this.state.round} />
                break;
            case "roundResultsLeaderboard":
                overlay = <RoundResultsLeaderboard players={this.state.players} round={this.state.round} />
                break;
            case "postgameCelebration":
                overlay = <PostgameCelebration />
                break;
            case "postgameRewards":
                overlay = <PostgameRewards startPurchase={this.startPurchase} />
                break;
            default:
                overlay = null;
                break;
        }
        return overlay;
    }

    onContextCreate = async (props) => {
        await this.onContextCreateAsync(props);
    }

    onContextCreateAsync = async ({ gl, width, height, scale: pixelRatio }) => {
        this.renderer = new ExpoTHREE.Renderer({ gl, width, height, pixelRatio });
        this.backgroundScene = new BackgroundScene(this.renderer);
        this.postgameRewardsScene = new PostgameRewardsScene(this.renderer);
        this.redLightGreenLightScene = new RedLightGreenLightScene(this.renderer, this.state);
        this.blockBlasterScene = new BlockBlasterScene(this.renderer);
        this.blockioScene = new BlockioScene(this.renderer);
    }

    onResize = () => {

    }

    onRender = (delta) => {
        this.setupScene();

        if(this.scene) {
            this.scene.update(delta);
            this.scene.render();
        }
    }

    setupScene() {
        if(this.state.minigame) {
            switch(this.state.minigame.name) {
                case "Red Light Green Light":
                    this.minigameScene = this.redLightGreenLightScene;
                    break;
                case "Block Blaster":
                    this.minigameScene = this.blockBlasterScene;
                    break;
                case "Block.io":
                    this.minigameScene = this.blockioScene;
                    break;
                default:
                    this.minigameScene = null;
                    break;
            }
        }

        switch(this.state.state) {
            case "pregameCountdown":
            case "pregameTitle":
            case "pregameIntroduction":
            case "roundIntroduction":
            case "roundInstructions":
                this.setScene(this.backgroundScene);
                break;
            case "minigameStart":
            case "minigamePlay":
            case "minigameEnd":
                this.setScene(this.minigameScene);
                break;
            case "roundResultsScoreboard":
            case "roundResultsLeaderboard":
            case "postgameCelebration":
                this.setScene(this.backgroundScene);
                break;
            case "postgameRewards":
                this.setScene(this.postgameRewardsScene);
                break;
            default:
                break;
        }
    }

    setScene(scene) {
        if(this.scene !== scene) {
            if(this.scene) {
                this.scene.shutdown();
            }
            this.scene = scene;
            this.scene.initialize();
        }
    }

    onTouchesBegan = state => {
        if(this.state.state === "minigamePlay") {
            this.scene.onTouchesBegan(state);
        }
    }

    onTouchesMoved = state => {
        if(this.state.state === "minigamePlay") {
            if(this.scene.onTouchesMoved) {
                this.scene.onTouchesMoved(state);
            }
        }
    }

    onTouchesEnded = state => {
        if(this.state.state === "minigamePlay") {
            if(this.scene.onTouchesEnded) {
                this.scene.onTouchesEnded(state);
            }
        }
    }

    componentWillUnmount() {
        console.log('unmounting play');
        this.unsubscribeAuthStateChanged();
        firebase.database.ref('game/state').off();
        firebase.database.ref('game/endTime').off();
        firebase.database.ref('game/round').off();
        firebase.database.ref('game/minigame').off();
        firebase.database.ref('game/mode').off();
        firebase.database.ref('game/teams/redTeamId').off();
        firebase.database.ref('game/teams/blueTeamId').off();
        firebase.database.ref('players').off();
        firebase.database.ref('players/' + firebase.uid + '/currency').off();

        this.didFocusListener.remove();
    }
}