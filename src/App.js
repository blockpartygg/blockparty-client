import React from "react";
import { StatusBar } from "react-native";
import { AppLoading, Asset } from 'expo';
import { Router, Switch, Route } from './Routing';
import Title from './components/screens/Title';
import Home from './components/screens/Home';
import Play from './components/screens/Play';
import SignIn from './components/screens/SignIn';
import SignUp from './components/screens/SignUp';
import Web from './components/screens/Web';

export default class App extends React.Component {
    state = {
        loading: true,
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

    componentDidMount() {
        StatusBar.setBarStyle("light-content");
        console.disableYellowBox = true;
    }

    render() {
        let loadingScreen = <AppLoading startAsync={this.loadAssetsAsync} onFinish={() => this.setState({ loading: false })} />
        let appScreen = (
            <Router>
                    <Switch hideNavBar={true}>
                        <Route exact path="/" component={Title} />
                        <Route path="/home" component={Home} />
                        <Route path="/play" component={Play} />
                        <Route path="/signIn" component={SignIn} />
                        <Route path="/signUp" component={SignUp} />
                        <Route path="/web" component={Web} />
                    </Switch>
            </Router>
        );

        return this.state.loading ? loadingScreen : appScreen;
    }
}
