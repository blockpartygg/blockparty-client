import React from 'react';
import { View, Animated } from 'react-native';

export default class MinigamePlay extends React.Component {
    state = {
        translateAnimation: new Animated.Value(-1000),
        opacityAnimation: new Animated.Value(1)
    }

    componentWillMount() {
        Animated.sequence([
            Animated.timing(this.state.translateAnimation, { toValue: 0, duration: 500 }),
            Animated.delay(3000),
            Animated.timing(this.state.opacityAnimation, { toValue: 0, duration: 500 })
        ]).start();  
    }

    render() {
        return(
            <View style={{ flex: 1, justifyContent: "center" }}>
                <Animated.Text selectable={false} style={{ fontSize: 96, textAlign: "center", opacity: this.state.opacityAnimation, transform: [{ translateX: this.state.translateAnimation }] }}>Go!</Animated.Text>
            </View>
        )
    }
}