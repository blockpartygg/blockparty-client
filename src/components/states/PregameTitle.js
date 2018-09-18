import React from 'react';
import { View, Animated } from 'react-native';
import blockPartyLogo from '../../assets/images/BlockPartyLogoSquareText.png';

export default class PregameTitle extends React.Component {
    state = {
        scaleAnimation: new Animated.Value(0)
    }

    componentWillMount() {
        Animated.spring(this.state.scaleAnimation, { toValue: 1, friction: 1 }).start();
    }

    render() {
        return(
            <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, justifyContent: "center", alignItems: "center" }} pointerEvents="none">
                <Animated.Image source={blockPartyLogo} style={{ width: "80%", flex: 1, transform: [{ scale: this.state.scaleAnimation }] }} resizeMode={"contain"} />
            </View>
        )
    }
}
