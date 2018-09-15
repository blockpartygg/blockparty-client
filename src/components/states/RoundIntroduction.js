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
            <Animated.View style={{ flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center", transform: [{ scaleX: this.state.scaleAnimation }, { scaleY: this.state.scaleAnimation }] }}>
                <Text style={{ fontSize: 36, textAlign: "center" }}>Round {this.props.round}</Text>
                <Text style={{ fontSize: 48, textAlign: "center" }}>{this.props.minigame && this.props.minigame.name}</Text>
                <Text style={{ fontSize: 48, textAlign: "center" }}>{this.props.mode && this.props.mode.name}</Text>
            </Animated.View>
        )
    }
}