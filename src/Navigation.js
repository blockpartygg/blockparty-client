import { createStackNavigator } from 'react-navigation';
import TitleScreen from './components/screens/TitleScreen';
import SignInScreen from './components/screens/SignInScreen';
import SignUpScreen from './components/screens/SignUpScreen';
import HomeScreen from './components/screens/HomeScreen';
import PlayScreen from './components/screens/PlayScreen';
import WebScreen from './components/screens/WebScreen';

const RootStack = createStackNavigator({
    Title: TitleScreen,
    SignIn: SignInScreen,
    SignUp: SignUpScreen,
    Home: HomeScreen,
    Play: PlayScreen,
    Web: WebScreen
}, {
    initialRouteName: 'Title',
    navigationOptions: {
        headerStyle: {
            backgroundColor: "#570C76"
        }
    }
});

export default RootStack;