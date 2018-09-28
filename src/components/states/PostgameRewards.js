import React from 'react';
import { View , Text, Button, StyleSheet } from 'react-native';
import { AdMobRewarded } from 'expo';
import { TweenLite } from 'gsap';
import firebase from '../../Firebase';
import { withRouter } from '../../Routing';

class PostgameRewards extends React.Component {
    state = {
        currency: null,
        currencyGain: null,
        isPurchaseDisabled: false,
        didWatchAd: false,
    };

    currency = {
        value: 0
    }

    currencyGain = {
        value: 100
    }

    constructor(props) {
        super(props);
        this.onPressPurchasePrize = this.onPressPurchasePrize.bind(this);
        this.onPressWatchAd = this.onPressWatchAd.bind(this);
        this.update = this.update.bind(this);
    }

    componentWillMount() {
        firebase.database.ref('players/' + firebase.uid).on('value', snapshot => {
            let player = snapshot.val();
            if(player) {
                this.setState({ currency: player.currency - 100 });
                this.currency.value = player.currency - 100;
                this.currencyGain.value = 100;
                let currencyTotal = this.currency.value + this.currencyGain.value;
                TweenLite.to(this.currency, 3, { value: currencyTotal, delay: 2 });
                TweenLite.to(this.currencyGain, 3, { value: 0, delay: 2 });
            }
        });

        let adUnitId;
        // adUnitId = 'ca-app-pub-6023984980488094/1926752312'; // Production
        adUnitId = 'ca-app-pub-3940256099942544/1712485313'; // Development
        AdMobRewarded.setAdUnitID(adUnitId);
        AdMobRewarded.setTestDeviceID('EMULATOR');
        AdMobRewarded.addEventListener('rewardedVideoDidRewardUser', this.onRewardedVideoDidRewardUser);
        AdMobRewarded.addEventListener('rewardedVideoDidClose', this.onRewardedVideoDidClose);
        this.requestAdAsync();
    }

    onRewardedVideoDidRewardUser = reward => {
        this.setState({ didWatchAd: true });
        firebase.database.ref('players/' + firebase.uid).transaction(player => {
            if(player) {
                player.currency += 100;
            }
            return player;
        });
    }

    onRewardedVideoDidClose = () => {
        this.currency.value = this.state.currency;
        this.currencyGain.value = 100;
        let currencyTotal = this.currency.value;
        TweenLite.to(this.currency, 3, { value: currencyTotal, delay: 2 });
        TweenLite.to(this.currencyGain, 3, { value: 0, delay: 2 });
    }

    requestAdAsync = async () => {
        await AdMobRewarded.requestAdAsync();
    }

    componentDidMount() {
        this.raf = requestAnimationFrame(this.update);
    }    

    update() {
        this.raf = requestAnimationFrame(this.update);
        this.setState({ currency: Math.round(this.currency.value) });
        this.setState({ currencyGain: Math.round(this.currencyGain.value) });
    }

    onPressPurchasePrize() {
        this.setState({ isPurchaseDisabled: true });
        this.currency.value = this.state.currency;
        TweenLite.to(this.currency, 3, { value: this.state.currency - 100 });
        this.props.startPurchase();
    }

    onPressWatchAd() {
        this.showAdAsync();
    }

    showAdAsync = async () => {
        await AdMobRewarded.showAdAsync();
    }

    render() {
        return(
            <View style={styles.container} pointerEvents="box-none">
                <Text style={styles.title}>{this.props.name}</Text>
                <View style={styles.avatar} />
                <View style={styles.currency}>
                    <Text style={styles.currencyLabel}>BB</Text>
                    <View style={styles.currencyBar}>
                        <Text style={styles.currencyText}>{this.state.currency}</Text>
                    </View>
                    <Text style={styles.currencyGain}>+{this.state.currencyGain}</Text>
                </View>
                <Text style={styles.currencyTooltip}>Earn Block Bits (BB) by playing and winning games. Then spend them on cosmetic upgrades and new ways to play coming in the future!</Text>
                <Button title="Buy a new look (100 BB)" onPress={this.onPressPurchasePrize} disabled={this.state.isPurchaseDisabled} style={{ flex: 1 }} />
                <Button title="Watch an ad to earn a bonus 100 BB" onPress={this.onPressWatchAd} disabled={this.state.didWatchAd} style={{ flex: 1 }} />
            </View>
        )
    }

    componentWillUnmount() {
        AdMobRewarded.removeAllListeners();
        cancelAnimationFrame(this.raf);
    }
}

const styles = StyleSheet.create({
    container: { 
        position: "absolute", 
        left: 0, 
        right: 0, 
        top: 0, 
        bottom: 0,
        justifyContent: "center",
        alignItems: "center"
    },
    title: {
        fontSize: 48,
        color: "white",
    },
    avatar: {
        width: 400,
        height: 400,
        backgroundColor: "transparent",
    },
    experience: {
        flexDirection: "row",
    },
    experienceLabel: {
        fontSize: 24,
        color: "white",
    },
    experienceBarOuter: {
        width: 200,
        height: 30,
        backgroundColor: "black",
        borderColor: "white",
        borderStyle: "solid",
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    experienceBarInner: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    experienceText: {
        fontSize: 24,
        color: "white"
    },
    experienceGain: {
        fontSize: 24,
        color: "white"
    },
    currency: {
        flexDirection: "row"
    },
    currencyLabel: {
        fontSize: 24,
        color: "white"
    },
    currencyBar: {
        width: 200,
        height: 30,
        backgroundColor: "black",
        borderColor: "white",
        borderStyle: "solid",
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    currencyText: {
        fontSize: 24,
        color: "white"
    },
    currencyGain: {
        fontSize: 24,
        color: "white"
    },
    currencyTooltip: {
        fontSize: 24,
        textAlign: "center",
        color: "white"
    }
});

const PostgameRewardsWithRouter = withRouter(PostgameRewards);

export default PostgameRewardsWithRouter;