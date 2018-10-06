import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import firebase from '../../Firebase';
import analytics from '../../Analytics';

export default class Home extends React.Component {
    static navigationOptions = {
        header: null
    }

    state = {
        uid: null,
        name: '',
        currency: '',
        state: null,
        timeRemaining: '-:--',
        endTime: null,
        round: null,
        minigame: null,
        mode: null,
        messages: [],
    }

    componentDidMount() {
        this.unsubscribeAuthStateChanged = firebase.auth.onAuthStateChanged(user => {
            if(!user) {
                firebase.signOut(() => {
                    this.props.navigation.navigate('Title');
                });
             } else {
                this.setState({ uid: user.uid });
                firebase.database.ref('players').child(user.uid).once('value', snapshot => {
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
                            this.setState({ name: player.name });
                            this.setState({ currency: player.currency });
                        }
                    }
                });
            }
        });

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
            }
        });
        firebase.database.ref('messages').limitToLast(20).on('child_added', snapshot => {
            const { timestamp: numberStamp, text, user } = snapshot.val();
            const { key: _id } = snapshot;
            const timestamp = new Date(numberStamp);
            const message = {
                _id,
                timestamp,
                text,
                user
            };
            this.setState(previousState => ({
                messages: GiftedChat.append && GiftedChat.append(previousState.messages, message),
            }));
        });
        this.updateTimerId = setInterval(this.update, 1000);

        this.didFocusListener = this.props.navigation.addListener('didFocus', () => {
            analytics.sendScreenView('Home');
        });
    }

    update = () => {
        if(this.state.endTime != null) {
            let timeRemaining = new Date(new Date(this.state.endTime).getTime() - Date.now());
            let minutes = timeRemaining.getMinutes();
            let seconds = timeRemaining.getSeconds() < 10 ? '0' + timeRemaining.getSeconds() : timeRemaining.getSeconds();
            let timeRemainingFormatted = `${minutes}:${seconds}`;
            this.setState({ timeRemaining: timeRemainingFormatted });
        }
    }

    onPressSignOut = () => {
        firebase.signOut(() => {
            analytics.sendEvent('Player', 'Sign out');
            analytics.sendEvent('Navigation', 'Navigate', 'Title');
            this.props.navigation.navigate('Title');
        });
    }

    onPressPlay = () => { 
        firebase.database.ref('players/' + firebase.uid).update({ playing: true });
        analytics.sendEvent('Navigation', 'Navigate', 'Play');
        this.props.navigation.navigate('Play'); 
    }

    onSend = messages => {
        for(let i = 0; i < messages.length; i++) {
            const { text, user } = messages[i];
            let timestamp = firebase.timestamp;
            firebase.database.ref('messages').push({ text, user, timestamp });
            analytics.sendEvent('Chat', 'Send message');
        }
    }

    get user() {
        return {
            name: this.state.name,
            _id: this.state.uid
        }
    }

    render() {
        let nameString = "";
        if(this.state.name) {
            let regEx = /[A-Z]/g;
            nameString = this.state.name.match(regEx);
        }

        let stateString;
        switch(this.state.state) {
            case "pregameCountdown":
            case "pregameTitle":
            case "pregameIntroduction":
                stateString = "The party starts soon";
                break;
            case "roundIntroduction":
            case "roundInstructions":
                stateString = "Round " + this.state.round + " starts soon";
                break;
            case "minigameStart":
            case "minigamePlay":
            case "minigameEnd":
                stateString = "Minigame in progress";
                break;
            case "roundResultsScoreboard":
            case "roundResultsLeaderboard":
                stateString = "Round " + this.state.round + " just ended";
                break;
            case "postgameCelebration":
            case "postgameRewards":
                stateString = "The party just ended";
                break;
            default:
                stateString = "?";
                break;
        }

        return(
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={this.onPressSignOut} style={styles.signOutButton}>
                        <Text style={styles.signOutButtonText}>Sign out</Text>
                    </TouchableOpacity>
                    <View style={styles.HomeLabel}>
                        <Text style={styles.HomeLabelText}>Lobby</Text>
                    </View>
                    <View style={styles.playerBadge}>
                        <Text style={styles.playerBadgeName}>{nameString}</Text>
                        <Text style={styles.playerBadgeBits}>{this.state.currency && this.state.currency + ' bits'}</Text>
                    </View>
                </View>
                <View style={styles.gameState}>
                    <Text style={styles.gameStateTimeRemainingText}>{this.state.timeRemaining}</Text>
                    <Text style={styles.gameStateText}>{stateString}</Text>
                    <Text style={styles.gameStateText}>{this.state.minigame && this.state.minigame.name}</Text>
                    <Text style={styles.gameStateText}>{this.state.mode && this.state.mode.name}</Text>
                    <TouchableOpacity onPress={this.onPressPlay} style={styles.playButton}>
                        <Text style={styles.playButtonText}>Play</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.chat}>
                    <GiftedChat messages={this.state.messages} onSend={this.onSend} user={this.user} />
                </View>
            </View>
        )
    }

    componentWillUnmount() {
        this.unsubscribeAuthStateChanged();

        firebase.database.ref('game/state').off();
        firebase.database.ref('game/endTime').off();
        firebase.database.ref('game/round').off();
        firebase.database.ref('game/minigame').off();
        firebase.database.ref('game/mode').off();
        firebase.database.ref('messages').off();

        clearInterval(this.updateTimerId);

        this.didFocusListener.remove();
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#570C76"
    },
    header: {
        marginTop: 50,
        height: 75,
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
    signOutButton: { 
        position: "absolute",
        left: 0,
        top: 0,
        width: 125,
        height: 50,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white", 
        borderWidth: 5, 
        borderColor: "#DBD9DB",
        zIndex: 20,
    },
    signOutButtonText: { 
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center", 
        color: "#570C76" 
    },
    HomeLabel: {
        height: "100%",
        marginTop: 50,
        marginRight: 10,
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#EE3AAF",
        borderWidth: 5,
        borderColor: "#B4287D"
    },
    HomeLabelText: {
        padding: 15,
        fontSize: 24,
        fontWeight: "bold",
        color: "white"
    },
    playerBadge: {
        width: 75,
        height: 75,
        marginTop: 50,
        backgroundColor: "white",
        borderWidth: 5,
        borderColor: "#DBD9DB",
        justifyContent: "center",
        alignItems: "center"
    },
    playerBadgeName: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "left", 
        color: "#570C76"
    },
    gameState: {
        marginTop: 20,
    },
    gameStateTimeRemainingText: {
        fontSize: 64,
        fontWeight: "bold",
        textAlign: "left",
        color: "white"
    },
    gameStateText: { 
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "left",
        color: "white",
    },
    playButton: {
        margin: 10,
        justifyContent: "center",
        backgroundColor: "#EE3AAF",
        borderWidth: 5,
        borderColor: "#B4287D"
    },
    playButtonText: {
        padding: 10,
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        color: "white"
    },
    chat: {
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 20,
        flex: 1,
    }
});