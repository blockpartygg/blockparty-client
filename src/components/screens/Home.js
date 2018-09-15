import React from "react";
import { View, Button, Text, StyleSheet } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import firebase from '../../Firebase';

export default class Home extends React.Component {
    state = {
        uid: null,
        name: null,
        state: null,
        endTime: null,
        round: null,
        minigame: null,
        mode: null,
        messages: [],
    }

    componentWillMount() {
        firebase.auth().onAuthStateChanged(user => {
            if(!user) {
                this.props.history.replace('/');
            } else {
                this.setState({ uid: user.uid });
                firebase.database().ref('players/' + user.uid).once('value', snapshot => {
                    let player = snapshot.val();
                    if(!player) {
                        this.props.history.replace('/');
                    }
                    else {
                        if(!player.name) {
                            this.props.history.replace('/');
                        }
                        else {
                            this.setState({ name: player.name });
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
        firebase.database().ref('messages').limitToLast(20).on('child_added', snapshot => {
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
    }

    onSend = messages => {
        for(let i = 0; i < messages.length; i++) {
            const { text, user } = messages[i];
            let timestamp = firebase.database.ServerValue.TIMESTAMP;
            firebase.database().ref('messages').push({ text, user, timestamp });
        }
    }

    get user() {
        return {
            name: this.state.name,
            _id: this.state.uid
        }
    }

    render() {
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
                console.log(`invalid game state: ${this.state.state}`);
                break;
        }

        return(
            <View style={styles.container}>
                <View style={styles.header}>
                    <Button title="Sign out" onPress={() => { this.props.history.goBack(); }} style={styles.signOutButton} />
                    <View style={styles.gameState}>
                        <Text style={styles.gameStateText}>{stateString}</Text>
                        <Button title="Play" onPress={() => { this.props.history.push('/play'); }} style={{ flex: 1 }} />
                    </View>
                    <View style={styles.playerBadge}>
                        <Text style={styles.playerBadgeName}>{this.state.name}</Text>
                    </View>
                </View>
                <View style={styles.chat}>
                    <GiftedChat messages={this.state.messages} onSend={this.onSend} user={this.user} />
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        position: "absolute", 
        left: 0,
        right: 0,
        top: 0, 
        height: 100,
        paddingTop: 40,
        backgroundColor: "blue",
        flexDirection: 'row',
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10
    },
    signOutButton: {
        position: 'absolute',
        left: 0,
        paddingLeft: 10,
        flex: 1
    },
    gameState: {
        flex: 1,
        marginLeft: 10,
        marginRight: 70,
    },
    gameStateText: { 
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
    },
    playerBadge: {
        position: 'absolute',
        right: 0,
        top: 40,
        marginRight: 10,
        width: 50,
        height: 50,
        backgroundColor: "white",
        borderRadius: 5,
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    playerBadgeName: {
        
    },
    chat: {
        flex: 1,
        backgroundColor: "#570C76"
    }
});