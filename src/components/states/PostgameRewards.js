import React from 'react';
import { View , Text, Button, StyleSheet } from 'react-native';
import { TweenLite } from 'gsap';
import { withRouter } from '../../Routing';

class PostgameRewards extends React.Component {
    state = {
        currency: 0,
        currencyGain: 100
    };

    currency = {
        tween: null,
        value: 0
    }

    currencyGain = {
        tween: null,
        value: 100
    }

    constructor(props) {
        super(props);
        this.purchasePrize = this.purchasePrize.bind(this);
        this.update = this.update.bind(this);
    }

    componentWillMount() {
        this.currency.tween = TweenLite.to(this.currency, 3, { value: 100, delay: 2 });
        this.currencyGain.tween = TweenLite.to(this.currencyGain, 3, { value: 0, delay: 2 });
        this.raf = requestAnimationFrame(this.update);
    }

    purchasePrize() {
        this.currency.tween = TweenLite.to(this.currency, 3, { value: 0 });
        this.props.startPurchase();
    }

    update() {
        this.raf = requestAnimationFrame(this.update);
        this.setState({ currency: Math.round(this.currency.value) });
        this.setState({ currencyGain: Math.round(this.currencyGain.value) });
    }

    render() {
        return(
            <View style={styles.container} pointerEvents="box-none">
                <Text style={styles.title}>Ron Solo</Text>
                <View style={styles.avatar} />
                {/*<View style={styles.experience}>
                    <Text style={styles.experienceLabel}>XP</Text>
                    <View style={styles.experienceBarOuter}>
                        <View style={styles.experienceBarInner} />
                        <Text style={styles.experienceText}>0</Text>
                    </View>
                    <Text style={styles.experienceGain}>+1,000</Text>
                </View>*/}
                <View style={styles.currency}>
                    <Text style={styles.currencyLabel}>$</Text>
                    <View style={styles.currencyBar}>
                        <Text style={styles.currencyText}>{this.state.currency}</Text>
                    </View>
                    <Text style={styles.currencyGain}>+{this.state.currencyGain}</Text>
                </View>
                <Text style={styles.currencyTooltip}>Earn Block Bits by playing and winning games. Then spend them on cosmetic upgrades and new ways to play coming in the future!</Text>
                <Button title="Buy a new look ($100)" onPress={this.purchasePrize} style={{ flex: 1 }} />
            </View>
        )
    }

    componentWillUnmount() {
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
        width: 300,
        height: 300,
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