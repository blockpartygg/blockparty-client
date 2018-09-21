import React from 'react';
import { View, Text, KeyboardAvoidingView, Button, TextInput, StyleSheet } from 'react-native';
import firebase from '../../Firebase';

export default class SignIn extends React.Component {
    state = {
        email: '',
        password: '',
        signInError: '',
        name: '',
        playAsGuestError: '',
    }

    handleSignIn = (event) => {
        firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then(() => {
            firebase.database().ref('.info/connected').on('value', snapshot => {
                if(snapshot.val()) {
                    firebase.database().ref('players/' + firebase.auth().currentUser.uid + '/playing').onDisconnect().remove();
                    firebase.database().ref('players/' + firebase.auth().currentUser.uid).update({ playing: true });
                }
            });
            this.props.history.push('/home');
        }).catch(error => {
            this.setState({ signInError: error });
        });
        event.preventDefault();
    }

    handlePlayAsGuest = (event) => {
        firebase.auth().signInAnonymously().then(() => {
            firebase.database().ref('.info/connected').on('value', snapshot => {
                if(snapshot.val()) {
                    firebase.database().ref('players/' + firebase.auth().currentUser.uid).onDisconnect().remove();
                    firebase.database().ref('players/' + firebase.auth().currentUser.uid).set({ name: this.state.name, playing: true });
                }
            });
            this.props.history.push('/home');
        }).catch(error => {
            this.setState({ playAsGuestError: error });
        });
        event.preventDefault();
    }

    onPressSignUp = () => {
        this.props.history.push('signUp');
    }

    onPressBack = () => {
        this.props.history.goBack();
    }

    render() {
        const isSignInDisabled = (
            this.state.email === '' ||
            this.state.password === ''
        );
        const isPlayAsGuestDisabled = (
            this.state.name === ''
        );

        return(
            <View style={styles.container}>
                <KeyboardAvoidingView behavior="padding" enabled style={{ flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "transparent" }}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Join the Party!</Text>
                    </View>
                    <View style={styles.form}>
                        <Text style={styles.instructionsText}>Sign in to play!</Text>
                        <TextInput value={this.state.email} onChangeText={text => { this.setState({ email: text }); }} placeholder="Email address" keyboardType="email-address" textContentType="username" style={styles.formTextInput} />
                        <TextInput value={this.state.password} onChangeText={text => { this.setState({ password: text }); }} placeholder="Password" secureTextEntry textContentType="password" style={styles.formTextInput} />
                        <Text style={styles.instructionsText}>{this.state.signInError && this.state.signInError.message}</Text>
                        <Text style={styles.signUpInstructionsText}>Don't have an account? <Text onPress={this.onPressSignUp} style={styles.signUpLinkText}>Sign up</Text></Text>
                        <Text style={styles.instructionsText}>Or...</Text>
                        <TextInput value={this.state.name} onChangeText={text => { this.setState({ name: text }); }} placeholder="Player name" style={styles.formTextInput} />
                        <Button title="Play as guest" onPress={this.handlePlayAsGuest} disabled={isPlayAsGuestDisabled} />
                        <Text style={styles.instructionsText}>{this.state.playerAsGuestError && this.state.playAsGuestError.message}</Text>
                    </View>
                    <View style={styles.footer}>
                        <Button title="Back" onPress={this.onPressBack} style={styles.backButton} />
                        <Button title="Start" onPress={this.handleSignIn} disabled={isSignInDisabled} style={styles.startButton} />
                    </View>
                </KeyboardAvoidingView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#570C76",
    },
    header: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 50,
        height: 100,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center"
    },
    headerText: {
        fontSize: 24,
    },
    form: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    instructionsText: {
        fontSize: 24,
        color: "white"
    },
    avatarSelection: {
        flexDirection: "row"
    },
    formTextInput: {
        minWidth: 200,
        height: 40,
        fontSize: 24,
        textAlign: "center",
        backgroundColor: "#eeeeee",
        borderRadius: 5,
        margin: 10
    },
    signUpInstructionsText: {
        fontSize: 24,
        color: "white"
    },
    signUpLinkText: {
        fontWeight: "bold"
    },
    footer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 50,
        height: 100,
        backgroundColor: "white",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    }
});