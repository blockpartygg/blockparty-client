import React from 'react';
import { View, Text, KeyboardAvoidingView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
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
        if(this.state.name !== '') {
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
        }
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
                        <FontAwesome.Button onPress={this.onPressBack} name="chevron-left" color="white" backgroundColor="transparent" style={styles.headerBackButton} />
                        <Text style={styles.headerText}>SIGN IN</Text>
                        <View style={styles.headerHorizontalBar} />
                    </View>
                    <View style={styles.form}>
                        <Text style={styles.instructionsText}>Welcome back!</Text>
                        <Text style={styles.instructionsText}>Sign in to join the Party</Text>
                        <TextInput value={this.state.email} onChangeText={text => { this.setState({ email: text }); }} placeholder="Email address" keyboardType="email-address" textContentType="username" style={styles.formTextInput} />
                        <TextInput value={this.state.password} onChangeText={text => { this.setState({ password: text }); }} placeholder="Password" secureTextEntry textContentType="password" style={styles.formTextInput} />
                        <Text style={styles.instructionsText}>{this.state.signInError && this.state.signInError.message}</Text>
                        <Text style={styles.instructionsText}>Or...</Text>
                        <TextInput value={this.state.name} onChangeText={text => { this.setState({ name: text }); }} placeholder="Player name" style={styles.formTextInput} />
                        <Text onPress={this.handlePlayAsGuest} disabled={isPlayAsGuestDisabled} style={styles.playAsGuestLinkText}>Play as Guest</Text>
                        <Text style={styles.instructionsText}>{this.state.playerAsGuestError && this.state.playAsGuestError.message}</Text>
                        <TouchableOpacity onPress={this.handleSignIn} disabled={isSignInDisabled} style={styles.signInButton}>
                            <Text style={styles.signInButtonText}>Sign in</Text>
                        </TouchableOpacity>
                        <Text style={styles.signUpLabel}>Don't have an account?</Text>
                        <Text onPress={this.onPressSignUp} style={styles.signUpLink}>Sign up!</Text>
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
        left: "5%",
        right: 0,
        top: 50,
        height: 50,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    headerBackButton: {
        justifyContent: "center" 
    },
    headerText: {
        margin: 10,
        fontSize: 14,
        fontWeight: "bold",
        color: "white"
    },
    headerHorizontalBar: {
        flex: 1,
        height: 12,
        backgroundColor: "#FA50B2"
    },
    instructionsText: {
        width: "100%",
        fontSize: 24,
        color: "white"
    },
    form: {
        width: "90%",
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    formTextInput: {
        width: "100%",
        height: 40,
        fontSize: 24,
        textAlign: "center",
        backgroundColor: "#eeeeee",
        borderRadius: 5,
        margin: 10
    },
    playAsGuestLinkText: {
        fontSize: 20,
        color: "white",
        fontWeight: "bold"
    },
    signInButton: { 
        width: "100%", 
        margin: 10, 
        padding: 10, 
        backgroundColor: "#EE3AAF", 
        borderWidth: 5, 
        borderColor: "#B4287D" 
    },
    signInButtonText: { 
        fontSize: 24, 
        textAlign: "center", 
        color: "white" 
    },
    signUpLabel: { 
        fontSize: 20, 
        color: "white" 
    },
    signUpLink: { 
        fontSize: 20, 
        color: "#FA50B2", 
        fontWeight: "bold" 
    },
});