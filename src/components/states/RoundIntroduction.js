import React from 'react';
import { Animated, Text } from 'react-native';

export default class RoundIntroduction extends React.Component {
    state = {
        scaleAnimation: new Animated.Value(0)
    }

    componentWillMount() {
        Animated.timing(this.state.scaleAnimation, { toValue: 1, duration: 3000 }).start();
    }

    render() {
        return(
            <Animated.View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, justifyContent: "center", alignItems: "center", transform: [{ scale: this.state.scaleAnimation }] }} pointerEvents="none">
                <Text style={{ fontSize: 36, textAlign: "center", color: "white" }}>Round {this.props.round}</Text>
                <Text style={{ fontSize: 48, textAlign: "center", color: "white" }}>{this.props.minigame && this.props.minigame.name}</Text>
                <Text style={{ fontSize: 48, textAlign: "center", color: "white" }}>{this.props.mode && this.props.mode.name}</Text>
            </Animated.View>
        )
    }
}