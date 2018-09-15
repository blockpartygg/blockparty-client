import React from 'react';
import { View, Animated, Image } from 'react-native';
import blockPartyLogo from '../../assets/images/BlockParty_logo.png';

export default class PregameTitle extends React.Component {
    state = {
        scaleAnimation: new Animated.Value(1)
    }

    componentWillMount() {
        Animated.timing(this.state.scaleAnimation, { toValue: 2, duration: 3000 }).start();
    }

    render() {
        return(
            <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} pointerEvents="none">
                {/*<Animated.Image source={blockPartyLogo} style={{ width: "50%", flex: 1, transform: [{ scaleX: this.state.scaleAnimation }, { scaleY: this.state.scaleAnimation }] }} resizeMode={"contain"} />*/}
                <Image source={blockPartyLogo} style={{ width: "100%", flex: 1 }} resizeMode={"contain"} />
            </View>
        )
    }
}
