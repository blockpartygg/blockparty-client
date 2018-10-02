import React from 'react';
import { AsyncStorage, View, Image, Text, TouchableOpacity, Animated } from 'react-native';
import firebase from '../../Firebase';
import blockPartyLogo from '../../assets/images/BlockPartyLogoSquare.png';

export default class Title extends React.Component {
    state = {
        translateAnimation: new Animated.Value(250),
        opacityAnimation: new Animated.Value(0)
    }

    playDestination = 'signIn';

    componentWillMount() {
        this.getPlayerAccountCreated();

        Animated.parallel([
            Animated.timing(this.state.translateAnimation, { toValue: 0, duration: 1000 }),
            Animated.timing(this.state.opacityAnimation, { toValue: 1, duration: 1000 }),
        ]).start();
    }

    getPlayerAccountCreated = async () => {
        try {
            const playerAccountCreated = await AsyncStorage.getItem('playerAccountCreated');
            if(playerAccountCreated === 'true') {
                this.playDestination = 'signIn';
            }
            else {
                this.playDestination = 'signUp';
            }
        } catch(error) {
            console.log(error);
        }
    }

    handlePlay = () => {
        if(firebase.isAuthed) {
            this.playDestination = 'home';
            firebase.setupSocket();
            firebase.setupPresence();
        }
        
        this.props.history.push(this.playDestination);
    }

    onPressTermsOfUse = () => {
        this.props.history.push('/web');
    }

    onPressPrivacyPolicy = () => {
        this.props.history.push('/web');
    }

    render() {
        return(
            <Animated.View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#570C76", opacity: this.state.opacityAnimation, transform: [{ translateY: this.state.translateAnimation }] }}>
                <View style={{ width: "80%", height: "100%", flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <Image source={blockPartyLogo} style={{ width: "100%", flex: 1 }} resizeMode={"contain"} />
                </View>
                <View style={{ width: "80%", flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <TouchableOpacity onPress={this.handlePlay} style={{ width: "100%", margin: 10, padding: 10, backgroundColor: "#EE3AAF", borderWidth: 5, borderColor: "#B4287D" }}>
                        <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", color: "white" }}>Join the Party!</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ position: "absolute", bottom: 50 }}>
                    <Text style={{ textAlign: "center", color: "#B378CC" }}>By playing you agree to the{'\n'}<Text onPress={this.onPressTermsOfUse} style={{ fontWeight: "bold" }}>Terms of Service</Text> and <Text onPress={this.onPressPrivacyPolicy} style={{ fontWeight: "bold" }}>Privacy Policy</Text></Text>
                </View>
            </Animated.View>
        )
    }
}