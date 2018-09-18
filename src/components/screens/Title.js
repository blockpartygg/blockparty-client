import React from 'react';
import { View, Image, Text, TextInput, Button, KeyboardAvoidingView, Animated } from 'react-native';
import firebase from '../../Firebase';
import blockPartyLogo from '../../assets/images/BlockPartyLogoSquareText.png';

export default class Title extends React.Component {
    state = {
        name: '',
        error: '',
        translateAnimation: new Animated.Value(250),
        opacityAnimation: new Animated.Value(0)
    }

    componentWillMount() {
        Animated.parallel([
            Animated.timing(this.state.translateAnimation, { toValue: 0, duration: 1000 }),
            Animated.timing(this.state.opacityAnimation, { toValue: 1, duration: 1000 }),
        ]).start();
    }

    handleSignIn = (event) => {
        firebase.auth().signInAnonymously().then(() => {
            firebase.database().ref('.info/connected').on('value', snapshot => {
                if(snapshot.val()) {
                    firebase.database().ref('players/' + firebase.auth().currentUser.uid).onDisconnect().remove();
                    firebase.database().ref('players/' + firebase.auth().currentUser.uid).set({ name: this.state.name });
                }
            });
            this.props.history.push('/home');
        }).catch(error => {
            this.setState({ error: error })
        });
        event.preventDefault();
    }

    render() {
        const isSignInDisabled = this.state.name === '';

        return(
            <Animated.View style={{ flex: 1, backgroundColor: "#570C76", opacity: this.state.opacityAnimation, transform: [{ translateY: this.state.translateAnimation }] }}>
                <KeyboardAvoidingView behavior="padding" enabled style={{ flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "transparent" }}>
                    <View style={{ width: "100%", height: "100%", flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <Image source={blockPartyLogo} style={{ width: "100%", flex: 1 }} resizeMode={"contain"} />
                        <Text style={{ fontSize: 48, fontWeight: "bold", color: "white", textAlign: "center" }}>THE PARTY IN YOUR POCKET</Text>
                    </View>
                    <View style={{ flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <TextInput value={this.state.name} onChangeText={text => { this.setState({ name: text }); }} placeholder="Player name" style={{ minWidth: 200, height: 40, fontSize: 24, textAlign: "center", backgroundColor: "#eeeeee", borderRadius: 5, margin: 10 }} />
                        <Button disabled={isSignInDisabled} title="Join the party!" onPress={this.handleSignIn} />
                        <Text>{this.state.error && this.state.error.message}</Text>
                    </View>
                </KeyboardAvoidingView>
            </Animated.View>
        )
    }
}