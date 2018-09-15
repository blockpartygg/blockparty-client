import React from 'react';
import { Animated, Text } from 'react-native';

export default class RoundInstructions extends React.Component {
    state = {
        scaleAnimation: new Animated.Value(0)
    }

    componentWillMount() {
        Animated.timing(this.state.scaleAnimation, { toValue: 1, duration: 1000 }).start();
    }

    render() {
        return(
            <Animated.View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} pointerEvents="none">
                <Text style={{ fontSize: 36, textAlign: "center" }}>Round {this.props.round}</Text>
                <Text style={{ fontSize: 48, textAlign: "center" }}>{this.props.minigame && this.props.minigame.name}</Text>
                <Text style={{ fontSize: 24, textAlign: "center" }}>{this.props.minigame && this.props.minigame.instructions}</Text>
                <Text style={{ fontSize: 48, textAlign: "center" }}>{this.props.mode && this.props.mode.name}</Text>
                <Text style={{ fontSize: 24, textAlign: "center" }}>{this.props.mode && this.props.mode.instructions}</Text>
            </Animated.View>
        )
    }
}