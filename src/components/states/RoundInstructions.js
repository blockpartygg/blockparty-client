import React from 'react';
import { Animated, Text } from 'react-native';
import firebase from '../../Firebase';

export default class RoundInstructions extends React.Component {
    state = {
        scaleAnimation: new Animated.Value(0)
    }

    componentDidMount() {
        analytics.sendEvent('Game State', 'Start', 'Round Instructions');
        Animated.timing(this.state.scaleAnimation, { toValue: 1, duration: 1000 }).start();
    }

    render() {
        return(
            <Animated.View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, justifyContent: "center", alignItems: "center", transform: [{ scale: this.state.scaleAnimation }] }} pointerEvents="none">
                <Text style={{ fontSize: 36, textAlign: "center", color: "white" }}>{this.props.round && 'Round ' + this.props.round}</Text>
                <Text style={{ fontSize: 48, textAlign: "center", color: "white" }}>{this.props.minigame && this.props.minigame.name}</Text>
                <Text style={{ fontSize: 24, textAlign: "center", color: "white" }}>{this.props.minigame && this.props.minigame.instructions}{'\n'}</Text>
                <Text style={{ fontSize: 48, textAlign: "center", color: "white" }}>{this.props.mode && this.props.mode.name}</Text>
                <Text style={{ fontSize: 24, textAlign: "center", color: "white" }}>{this.props.mode && this.props.mode.instructions}</Text>
                <Text style={{ fontSize: 24, textAlign: "center", color: "white" }}>{this.props.team && "You're on the "}<Text style={{ color: this.props.team }}>{this.props.team}</Text> team</Text>
            </Animated.View>
        )
    }
}