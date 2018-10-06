import React from 'react';
import { View, Text, Animated } from 'react-native';

export default class MinigameStart extends React.Component {
    state = {
        translateAnimation: new Animated.Value(-1000),
        opacityAnimation: new Animated.Value(1)
    }

    componentDidMount() {
        analytics.sendEvent('Game State', 'Start', 'Minigame Start');
        Animated.sequence([
            Animated.timing(this.state.translateAnimation, { toValue: 0, duration: 500 }),
            Animated.delay(3000),
            Animated.timing(this.state.opacityAnimation, { toValue: 0, duration: 500 })
        ]).start();
    }

    render() {
        return(
            <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, justifyContent: "center", alignItems: "center" }} pointerEvents="none">
                <Text style={{ position: "absolute", top: 40, left: "auto", fontSize: 48, textAlign: "center" }}>30</Text>
                <Animated.Text selectable={false} style={{ fontSize: 96, textAlign: "center", opacity: this.state.opacityAnimation, transform: [{ translateX: this.state.translateAnimation }] }}>Ready...</Animated.Text>
            </View>
        )
    }
}