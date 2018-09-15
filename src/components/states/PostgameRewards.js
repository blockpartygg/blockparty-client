import React from 'react';
import { View , Text, Button, StyleSheet } from 'react-native';
import { withRouter } from '../../Routing';

class PostgameRewards extends React.Component {
    render() {
        return(
            <View style={styles.container}>
                <Text style={styles.title}>Ron Solo</Text>
                <View style={styles.avatar} />
                <View style={styles.experience}>
                    <Text style={styles.experienceLabel}>XP</Text>
                    <View style={styles.experienceBarOuter}>
                        <View style={styles.experienceBarInner} />
                        <Text style={styles.experienceText}>0</Text>
                    </View>
                    <Text style={styles.experienceGain}>+1,000</Text>
                </View>
                <View style={styles.currency}>
                    <Text style={styles.currencyLabel}>$</Text>
                    <View style={styles.currencyBar}>
                        <Text style={styles.currencyText}>0</Text>
                    </View>
                    <Text style={styles.currencyGain}>+100</Text>
                </View>
                <Button title="Home" onPress={() => { this.props.history.goBack(); }} style={{ flex: 1 }} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        height: 25,
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
        height: 25,
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
    }
});

const PostgameRewardsWithRouter = withRouter(PostgameRewards);

export default PostgameRewardsWithRouter;
