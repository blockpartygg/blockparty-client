import React from 'react';
import { View, Text, Animated } from 'react-native';

export default class MinigamePlay extends React.Component {
    state = {
        translateAnimation: new Animated.Value(-1000),
        opacityAnimation: new Animated.Value(1),
        timeRemaining: 60
    }

    constructor(props) {
        super(props);
        this.updateTimeRemaining = this.updateTimeRemaining.bind(this);
    }

    componentWillMount() {
        Animated.sequence([
            Animated.timing(this.state.translateAnimation, { toValue: 0, duration: 500 }),
            Animated.delay(3000),
            Animated.timing(this.state.opacityAnimation, { toValue: 0, duration: 500 })
        ]).start();

        this.updateInterval = setInterval(this.updateTimeRemaining, 1000 / 60);
    }

    updateTimeRemaining() {
        let timeRemaining = new Date(new Date(this.props.endTime).getTime() - Date.now());
        let seconds = timeRemaining.getSeconds() < 10 ? '0' + timeRemaining.getSeconds() : timeRemaining.getSeconds();
        this.setState({ timeRemaining: seconds });
    }

    render() {
        return(
            <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, justifyContent: "center", alignItems: "center" }} pointerEvents="none">
                <Text style={{ position: "absolute", top: 40, left: "auto", fontSize: 48, textAlign: "center" }}>{this.state.timeRemaining}</Text>
                <Animated.Text selectable={false} style={{ fontSize: 96, textAlign: "center", opacity: this.state.opacityAnimation, transform: [{ translateX: this.state.translateAnimation }] }}>Go!</Animated.Text>
            </View>
        )
    }

    componentWillUnmount() {
        clearInterval(this.updateInterval);
    }
}