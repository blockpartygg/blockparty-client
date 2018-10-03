import React from "react";
import { StatusBar } from "react-native";
import { AppLoading, Asset } from 'expo';
import firebase from './Firebase';
import socketIO from './SocketIO';
import THREE from './THREE';
import RootStack from './Navigation';

export default class App extends React.Component {
    state = {
        loading: true,
    }

    componentWillMount() {
        firebase.initialize();
        socketIO.initialize();
        THREE.suppressExpoWarnings();
    }

    componentDidMount() {
        StatusBar.setBarStyle("light-content");
        console.disableYellowBox = true;
    }

    componentWillUnmount() {
        THREE.suppressExpoWarnings(false);
    }

    loadAssetsAsync = async () => {
        const imageAssets = this.cacheImages([require('./assets/images/BlockPartyLogoSquare.png')])
        await Promise.all([...imageAssets]);
    }

    cacheImages(images) {
        return images.map(image => {
            if(typeof image === 'string') {
                return Image.prefetch(image);
            } else {
                return Asset.fromModule(image).downloadAsync();
            }
        });
    }

    render() {
        let loadingScreen = <AppLoading startAsync={this.loadAssetsAsync} onFinish={() => this.setState({ loading: false })} />
        let appScreen = <RootStack />

        return this.state.loading ? loadingScreen : appScreen;
    }
}
