import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import firebase from '../../Firebase';

export default class SignIn extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            header: (
                <View style={styles.header}>
                    <FontAwesome.Button onPress={() => { navigation.goBack(); }} name="chevron-left" color="white" backgroundColor="transparent" style={styles.headerBackButton} />
                    <Text style={styles.headerText}>SIGN IN</Text>
                    <View style={styles.headerHorizontalBar} />
                </View>
            )
        }
    }

    state = {
        email: '',
        password: '',
        signInError: '',
        name: '',
        playAsGuestError: '',
    }

    onPressBack = () => {
        this.props.navigation.goBack();
    }

    handleSignIn = (event) => {
        firebase.signIn(this.state.email, this.state.password, () => {
            this.props.navigation.navigate('Home');
        }, error => {
            this.setState({ signInError: error });
        });
        event.preventDefault();
    }

    handlePlayAsGuest = (event) => {
        firebase.signInAsGuest(this.state.name, () => {
            this.props.navigation.navigate('Home');
        }, error => {
            this.setState({ playAsGuestError: error });
        });
    }

    onPressSignUp = () => {
        this.props.navigation.navigate('SignUp');
    }

    render() {
        const isSignInDisabled = (
            this.state.email === '' ||
            this.state.password === ''
        );
        const isPlayAsGuestDisabled = this.state.name === '';

        return(
            <View style={styles.container}>
                <View behavior="padding" enabled style={{ flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "transparent" }}>
                    <View style={styles.form}>
                        <Text style={styles.instructionsText}>Welcome back!</Text>
                        <Text style={styles.instructionsText}>Sign in to join the Party.</Text>
                        <TextInput value={this.state.email} onChangeText={text => { this.setState({ email: text }); }} placeholder="Email address" keyboardType="email-address" textContentType="username" style={styles.formTextInput} />
                        <TextInput value={this.state.password} onChangeText={text => { this.setState({ password: text }); }} placeholder="Password" secureTextEntry textContentType="password" style={styles.formTextInput} />
                        <Text style={styles.instructionsText}>{this.state.signInError && this.state.signInError.message}</Text>
                        <Text style={styles.instructionsText}>Or...</Text>
                        <TextInput value={this.state.name} onChangeText={text => { this.setState({ name: text }); }} placeholder="Player name" style={styles.formTextInput} />
                        <Text style={styles.instructionsText}>{this.state.playerAsGuestError && this.state.playAsGuestError.message}</Text>
                        <TouchableOpacity onPress={this.handlePlayAsGuest} disabled={isPlayAsGuestDisabled} style={styles.playAsGuestButton}>
                            <Text style={styles.playAsGuestLinkText}>Play as Guest</Text>    
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.handleSignIn} disabled={isSignInDisabled} style={styles.signInButton}>
                            <Text style={styles.signInButtonText}>Sign in</Text>
                        </TouchableOpacity>
                        <Text style={styles.signUpLabel}>Don't have an account?</Text>
                        <Text onPress={this.onPressSignUp} style={styles.signUpLink}>Sign up!</Text>
                    </View>
                </View>
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
        fontWeight: "bold",
        color: "white"
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
        fontWeight: "bold",
        textAlign: "center", 
        color: "white" 
    },
    signUpLabel: { 
        fontSize: 20,
        color: "white" 
    },
    signUpLink: { 
        fontSize: 20, 
        fontWeight: "bold",
        color: "#FA50B2", 
    },
});