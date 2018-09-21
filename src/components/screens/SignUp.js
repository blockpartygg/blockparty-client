import React from 'react';
import { View, KeyboardAvoidingView, Text, Button, TextInput, StyleSheet } from 'react-native';

export default class SignUp extends React.Component {
    state = {
        name: '',
        email: '',
        password: '',
        passwordConfirmation: '',
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

    onPressBack = () => {
        this.props.history.goBack();
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
                        <Text style={styles.headerText}>Sign up to join!</Text>
                    </View>
                    <View style={styles.form}>
                        <Text style={styles.instructionsText}>Choose your Avatar!</Text>
                        <View style={styles.avatarSelection}>
                            <Button title="Male" onPress={() => {}} />
                            <Button title="Female" onPress={() => {}} />
                        </View>
                        <TextInput value={this.state.name} onChangeText={text => { this.setState({ name: text }); }} placeholder="Player name" style={styles.formTextInput} />
                        <TextInput value={this.state.email} onChangeText={text => { this.setState({ email: text }); }} placeholder="Email address" keyboardType="email-address" textContentType="username" style={styles.formTextInput} />
                        <TextInput value={this.state.password} onChangeText={text => { this.setState({ password: text }); }} placeholder="Password" secureTextEntry textContentType="password" style={styles.formTextInput} />
                        <TextInput value={this.state.passwordConfirmation} onChangeText={text => { this.setState({ passwordConfirmation: text });  }} placeholder="Confirm password" secureTextEntry textContentType="password" style={styles.formTextInput} />
                    </View>
                    <View style={styles.footer}>
                        <Button title="Back" onPress={this.onPressBack} style={styles.backButton} />
                        <Button title="Start" onPress={this.handleSignUp} style={styles.startButton} disabled={isSignUpDisabled} />
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