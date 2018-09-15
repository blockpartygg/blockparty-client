import React from 'react';
import { Animated, Text } from 'react-native';

export default class PregameIntroduction extends React.Component {
    state = {
        opacityAnimation: new Animated.Value(0)
    }

    componentWillMount() {
        Animated.timing(this.state.opacityAnimation, { toValue: 1, duration: 1000 }).start();
    }

    render() {
        return(
            <Animated.View style={{ flex: 1, justifyContent: "center", alignItems: "center", opacity: this.state.opacityAnimation }}>
                <Text style={{ fontSize: 16, textAlign: "center" }}>Welcome to Block Party, the massively multiplayer minigame party in your pocket. I'm your host, Blocky McBlockerson, and I'm here to guide you through all the action. {'\n'}{'\n'}We're playing through 5 rounds where we'll randomly select a minigame and mode of play. Read the instructions on how to play and then get ready for the game to start. Each minigame will last 60 seconds. Score as many points as possible in that time to earn your place on that round's scoreboard. Then based on how you do, you'll earn points on the leaderboard, which will update after each round. {'\n'}{'\n'}Finish the game on top of the leaderboard to earn yourself a cool 1,000 BP$ which you can spend to deck out your avatar. Just for playing, you'll also earn some BP$, experience points to level up and unlock new ways to play, and global rank points to let you compete on the worldwide ladder. {'\n'}{'\n'}But enough about that. Let's get into the game with...</Text>
            </Animated.View>
        )
    }
}