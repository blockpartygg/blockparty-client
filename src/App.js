import React from "react";
import { StatusBar } from "react-native";
import Assets from './Assets';
//import AssetUtils from './AssetUtils';
import { AppLoading } from 'expo';
import { Router, Switch, Route } from './Routing';
import Title from './components/screens/Title';
import Home from './components/screens/Home';
import Play from './components/screens/Play';

export default class App extends React.Component {
    state = {
        loading: true,
    }

    componentWillMount() {
        this.loadAssetsAsync();
    }

    loadAssetsAsync = async () => {
        //await Promise.all([this.preloadAssetsAsync()]);
        this.setState({ loading: false });
    }

    async preloadAssetsAsync() {
        // await AssetUtils.cacheAssetsAsync({
        //     fonts: this.fonts,
        //     files: this.files,
        // });
    }

    get fonts() {
        const items = {};
        const keys = Object.keys(Assets.fonts || {});
        for(const key of keys) {
            const item = Assets.fonts[key];
            const name = key.substr(0, key.lastIndexOf('.'));
            items[name] = item;
        }
        return [items];
    }

    get files() {
        // return AssetUtils.arrayFromObject(Assets.images);
    }

    componentDidMount() {
        StatusBar.setBarStyle("light-content");
        console.disableYellowBox = true;
    }

    render() {
        let loadingScreen = <AppLoading />
        let appScreen = (
            <Router>
                    <Switch hideNavBar={true}>
                        <Route exact path="/" component={Title} />
                        <Route path="/home" component={Home} />
                        <Route path="/play" component={Play} />
                    </Switch>
            </Router>
        );

        return this.state.loading ? loadingScreen : appScreen;
    }
}
