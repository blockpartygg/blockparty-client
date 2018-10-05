import React from 'react';
import { AsyncStorage, View, Image, Text, TouchableOpacity, Animated } from 'react-native';
import firebase from '../../Firebase';
import analytics from '../../Analytics';
import blockPartyLogo from '../../assets/images/BlockPartyLogoSquare.png';

export default class Title extends React.Component {
    static navigationOptions = {
        header: null
    }

    state = {
        logoImageScaleAnimation: new Animated.Value(0),
        playButtonTranslateAnimation: new Animated.Value(100),
        playButtonOpacityAnimation: new Animated.Value(0)
    }

    componentDidMount() {
        Animated.sequence([
            Animated.timing(this.state.logoImageScaleAnimation, { toValue: 1, duration: 500 }),
            Animated.parallel([
                Animated.timing(this.state.playButtonTranslateAnimation, { toValue: 0, duration: 500 }),
                Animated.timing(this.state.playButtonOpacityAnimation, { toValue: 1, duration: 500 }),
            ])
        ]).start();
        this.didFocusListener = this.props.navigation.addListener('didFocus', () => {
            analytics.sendScreenView('Title');
        });
    }

    handlePlay = () => {
        if(firebase.isAuthed) {
            this.playDestination = 'Home';
            firebase.setupSocket();
            firebase.setupPresence();
            this.props.navigation.navigate(this.playDestination);
        }
        else {
            this.getPlayerAccountCreated().then(() => {
                this.props.navigation.navigate(this.playDestination);
            });
        }
    }

    getPlayerAccountCreated = async () => {
        try {
            const playerAccountCreated = await AsyncStorage.getItem('playerAccountCreated');
            if(playerAccountCreated === 'true') {
                this.playDestination = 'SignIn';
            }
            else {
                this.playDestination = 'SignUp';
            }
        } catch(error) {
            console.log(error);
        }
    }

    onPressTermsOfUse = () => {
        this.props.navigation.navigate('Web');
    }

    onPressPrivacyPolicy = () => {
        this.props.navigation.navigate('Web');
    }

    render() {
        return(
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#570C76" }}>
                <View style={{ width: "80%", height: "100%", flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <Animated.Image source={blockPartyLogo} style={{ width: "100%", flex: 1, transform: [{ scaleY: this.state.logoImageScaleAnimation }] }} resizeMode={"contain"} />
                </View>
                <Animated.View style={{ width: "80%", flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center", opacity: this.state.playButtonOpacityAnimation, transform: [{ translateY: this.state.playButtonTranslateAnimation }] }}>
                    <TouchableOpacity onPress={this.handlePlay} style={{ width: "100%", margin: 10, padding: 10, backgroundColor: "#EE3AAF", borderWidth: 5, borderColor: "#B4287D" }}>
                        <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", color: "white" }}>Join the Party!</Text>
                    </TouchableOpacity>
                </Animated.View>
                <View style={{ position: "absolute", bottom: 50 }}>
                    <Text style={{ textAlign: "center", color: "#B378CC" }}>By playing you agree to the{'\n'}<Text onPress={this.onPressTermsOfUse} style={{ fontWeight: "bold" }}>Terms of Service</Text> and <Text onPress={this.onPressPrivacyPolicy} style={{ fontWeight: "bold" }}>Privacy Policy</Text></Text>
                </View>
            </View>
        )
    }

    componentWillUnmount() {
        this.didFocusListener.remove();
    }
}