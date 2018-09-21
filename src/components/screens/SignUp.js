import React from 'react';
import { View, KeyboardAvoidingView, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default class SignUp extends React.Component {
    state = {
        name: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        guestName: '',
        error: ''
    }

    handleSignUp = (event) => {
        firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).then(() => {
            firebase.database().ref('.info/connected').on('value', snapshot => {
                if(snapshot.val()) {
                    firebase.database().ref('players/' + firebase.auth().currentUser.uid + '/playing').onDisconnect().remove();
                    firebase.database().ref('players/' + firebase.auth().currentUser.uid).set({ name: this.state.name, currency: 0, playing: true });
                }
            });
            this.props.history.push('/home');
        }).catch(error => {
            this.setState({ error: error });
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

    onPressBack = () => {
        this.props.history.goBack();
    }

    onPressSignIn = () => {
        this.props.history.push('signIn');
    }

    render() {
        const isSignUpDisabled = (
            this.state.name === '' ||
            this.state.email === '' ||
            this.state.password === '' ||
            this.state.password !== this.state.passwordConfirmation
        );

        return(
            <View style={styles.container}>
                <KeyboardAvoidingView behavior="padding" enabled style={{ flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "transparent" }}>
                    <View style={styles.header}>
                        <FontAwesome.Button onPress={this.onPressBack} name="chevron-left" color="white" backgroundColor="transparent" style={styles.headerBackButton} />
                        <Text style={styles.headerText}>SIGN UP</Text>
                        <View style={styles.headerHorizontalBar} />
                    </View>
                    <View style={styles.form}>
                        <Text style={styles.instructionsText}>Welcome to the Party!</Text>
                        <Text style={styles.instructionsText}>Let's get started.</Text>
                        <TextInput value={this.state.name} onChangeText={text => { this.setState({ name: text }); }} placeholder="Player name" style={styles.formTextInput} />
                        <TextInput value={this.state.email} onChangeText={text => { this.setState({ email: text }); }} placeholder="Email address" keyboardType="email-address" textContentType="username" style={styles.formTextInput} />
                        <TextInput value={this.state.password} onChangeText={text => { this.setState({ password: text }); }} placeholder="Password" secureTextEntry textContentType="password" style={styles.formTextInput} />
                        <TextInput value={this.state.passwordConfirmation} onChangeText={text => { this.setState({ passwordConfirmation: text });  }} placeholder="Confirm password" secureTextEntry textContentType="password" style={styles.formTextInput} />
                        <Text style={styles.instructionsText}>{this.state.error && this.state.error.message}</Text>
                        <Text style={styles.instructionsText}>Or...</Text>
                        <TextInput value={this.state.guestName} onChangeText={text => { this.setState({ guestName: text }); }} placeholder="Player name" style={styles.formTextInput} />
                        <Text onPress={this.handlePlayAsGuest} style={styles.playAsGuestLinkText}>Play as Guest</Text>
                        <TouchableOpacity onPress={this.handleSignUp} disabled={isSignUpDisabled} style={styles.signUpButton}>
                            <Text style={styles.signUpButtonText}>Sign up</Text>
                        </TouchableOpacity>
                        <Text style={styles.signInLabel}>Have an account already?</Text>
                        <Text onPress={this.onPressSignIn} style={styles.signInLink}>Sign in!</Text>
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
        left: "10%",
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
    form: {
        width: "80%",
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    instructionsText: {
        width: "100%",
        fontSize: 24,
        color: "white"
    },
    avatarSelection: {
        flexDirection: "row"
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
    signUpButton: { 
        width: "100%", 
        margin: 10, 
        padding: 10, 
        backgroundColor: "#EE3AAF", 
        borderWidth: 5, 
        borderColor: "#B4287D" 
    },
    signUpButtonText: { 
        fontSize: 24, 
        textAlign: "center", 
        color: "white" 
    },
    signInLabel: { 
        fontSize: 20, 
        color: "white" 
    },
    signInLink: { 
        fontSize: 20, 
        color: "#FA50B2", 
        fontWeight: "bold" 
    },
});