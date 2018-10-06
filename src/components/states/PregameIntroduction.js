import React from 'react';
import { Animated, Text } from 'react-native';

export default class PregameIntroduction extends React.Component {
    state = {
        opacityAnimation: new Animated.Value(0)
    }

    componentDidMount() {
        analytics.sendEvent('Game State', 'Start', 'Pregame Introduction');
        Animated.timing(this.state.opacityAnimation, { toValue: 1, duration: 1000 }).start();
    }

    render() {
        return(
            <Animated.View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, justifyContent: "center", alignItems: "center", opacity: this.state.opacityAnimation }} pointerEvents="none">
                <Text style={{ fontSize: 32, textAlign: "center", color: "white" }}>Welcome to Block Party! Let's go over how to play.{'\n'}</Text>
                <Text style={{ fontSize: 32, textAlign: "center", color: "white" }}>You'll be competing against the world in five rounds of minigames.{'\n'}</Text>
                <Text style={{ fontSize: 32, textAlign: "center", color: "white" }}>The player who collects the most points on the leaderboard after five rounds wins. Good luck!</Text>
            </Animated.View>
        )
    }
}