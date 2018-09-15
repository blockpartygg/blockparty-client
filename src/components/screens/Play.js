import React from 'react';
import { View, Button } from 'react-native';
import ExpoTHREE from 'expo-three';
import { View as GraphicsView } from 'expo-graphics';
import firebase from '../../Firebase';
import TouchableView from '../TouchableView';

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
import PostgameRewardsWithRouter from '../states/PostgameRewards';

import BackgroundScene from '../scenes/BackgroundScene';
import RedLightGreenLightScene from '../scenes/RedLightGreenLightScene';
import WhackABlockScene from '../scenes/WhackABlockScene';
import PostgameRewardsScene from '../scenes/PostgameRewardsScene';

export default class Play extends React.Component {
    state = {
        state: null,
        endTime: null,
        round: null,
        minigame: null,
        mode: null,
    }

    scene = null;
    overlay = null;

    componentWillMount() {
        firebase.auth().onAuthStateChanged(user => {
            if(!user) {
                this.props.history.replace('/');
            } else {
                firebase.database().ref('players/' + user.uid).once('value', snapshot => {
                    let player = snapshot.val();
                    if(!player) {
                        this.props.history.replace('/');
                    }
                    else {
                        if(!player.name) {
                            this.props.history.replace('/');
                        }
                    }
                });
            }
        });

        firebase.database().ref('game/state').on('value', snapshot => {
            let state = snapshot.val();
            if(state) {
                this.setState({ state: state });
            }
        });
        firebase.database().ref('game/endTime').on('value', snapshot => {
            let endTime = snapshot.val();
            if(endTime) {
                this.setState({ endTime: endTime });
            }
        });
        firebase.database().ref('game/round').on('value', snapshot => {
            let round = snapshot.val();
            if(round) {
                this.setState({ round: round });
            }
        });
        firebase.database().ref('game/minigame').on('value', snapshot => {
            let minigame = snapshot.val();
            if(minigame) {
                this.setState({ minigame: minigame });
            }
        });
        firebase.database().ref('game/mode').on('value', snapshot => {
            let mode = snapshot.val();
            if(mode) {
                this.setState({ mode: mode });
            }
        });
    }

    render() {
        if(!this.state) {
            return null;
        }

        let overlay = this.setupOverlay();

        return(
            <View pointerEvents="box-none" style={{ flex: 1 }}>              
                <TouchableView onTouchesBegan={this.onTouchesBegan} style={{ flex: 1, overflow: "hidden" }}>
                    <GraphicsView ref={ref => (global.gameRef = this.ref = ref)} key="game" onContextCreate={this.onContextCreate} onRender={this.onRender} onResize={this.onResize} />
                </TouchableView>
                <View style={{ position: "absolute", left: 5, top: 30 }}>
                    <Button title="Back" onPress={() => { this.props.history.goBack(); }} />
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
                overlay = <RoundInstructions round={this.state.round} minigame={this.state.minigame} mode={this.state.mode} />
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
                overlay = <RoundResultsScoreboard round={this.state.round} />
                break;
            case "roundResultsLeaderboard":
                overlay = <RoundResultsLeaderboard round={this.state.round} />
                break;
            case "postgameCelebration":
                overlay = <PostgameCelebration />
                break;
            case "postgameRewards":
                overlay = <PostgameRewardsWithRouter />
                break;
            default:
                console.log(`invalid game state: ${this.state.state}`);
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
        this.redLightGreenLightScene = new RedLightGreenLightScene(this.renderer);
        this.whackABlockScene = new WhackABlockScene(this.renderer);
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
                    this.minigameScene = this.whackABlockScene;
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
                this.scene = this.backgroundScene;
                break;
            case "minigameStart":
            case "minigamePlay":
            case "minigameEnd":
                this.scene = this.minigameScene;
                break;
            case "roundResultsScoreboard":
            case "roundResultsLeaderboard":
            case "postgameCelebration":
                this.scene = this.backgroundScene;
                break;
            case "postgameRewards":
                this.scene = this.postgameRewardsScene;
                break;
            default:
                break;
        }
    }

    onTouchesBegan = state => {
        if(this.state.state === "minigamePlay") {
            this.scene.onTouchesBegan(state);
        }
    }

    componentWillUnmount() {
        firebase.database().ref('game/state').off();
        firebase.database().ref('game/endTime').off();
        firebase.database().ref('game/round').off();
        firebase.database().ref('game/minigame').off();
        firebase.database().ref('game/mode').off();
    }
}