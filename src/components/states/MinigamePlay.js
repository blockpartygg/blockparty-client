import React from 'react';
import { View, Text, FlatList, Animated } from 'react-native';
import firebase from '../../Firebase';

export default class MinigamePlay extends React.Component {
    state = {
        translateAnimation: new Animated.Value(-1000),
        opacityAnimation: new Animated.Value(1),
        timeRemaining: 60
    }

    componentDidMount() {
        firebase.database.ref('players').on('value', snapshot => {
            this.setState({ players: snapshot.val() });
        });

        firebase.database.ref('game/scoreboard').orderByValue().limitToFirst(5).on('value', snapshot => {
            let ascendingScoreboard = [];
            let rank = snapshot.numChildren();
            snapshot.forEach(score => {
                ascendingScoreboard.push({
                    key: score.key,
                    name: this.state.players[score.key] && this.state.players[score.key].name,
                    score: score.val(),
                    rank: rank--,
                });
            });
            let descendingScoreboard = ascendingScoreboard.reverse();
            this.setState({ scoreboard: descendingScoreboard });
        });

        Animated.sequence([
            Animated.timing(this.state.translateAnimation, { toValue: 0, duration: 500 }),
            Animated.delay(3000),
            Animated.timing(this.state.opacityAnimation, { toValue: 0, duration: 500 })
        ]).start();

        this.updateInterval = setInterval(this.updateTimeRemaining, 1000 / 60);
    }

    updateTimeRemaining = () => {
        let timeRemaining = new Date(new Date(this.props.endTime).getTime() - Date.now());
        let seconds = timeRemaining.getSeconds() < 10 ? '0' + timeRemaining.getSeconds() : timeRemaining.getSeconds();
        this.setState({ timeRemaining: seconds });
    }

    render() {
        let renderItem = ({item}) => (
            <View style={{ marginTop: 40, flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "stretch" }}>
                <Text style={{ fontSize: 18 }}>{item.rank}</Text>
                <Text style={{ fontSize: 24 }}>{item.name}</Text>
                <Text style={{ fontSize: 18 }}>{item.score}</Text>
            </View>
        );

        return(
            <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, justifyContent: "center", alignItems: "center" }} pointerEvents="none">
                <Text style={{ position: "absolute", top: 40, left: "auto", fontSize: 48, textAlign: "center" }}>{this.state.timeRemaining}</Text>
                <FlatList data={this.state.scoreboard} renderItem={renderItem} style={{ position: "absolute", right: 0, top: 0}} />
                <Animated.Text selectable={false} style={{ position: "absolute", left: "auto", top: "auto", fontSize: 96, textAlign: "center", opacity: this.state.opacityAnimation, transform: [{ translateX: this.state.translateAnimation }] }}>Go!</Animated.Text>
            </View>
        )
    }

    componentWillUnmount() {
        firebase.database.ref('players').off();
        firebase.database.ref('game/scoreboard').off();

        clearInterval(this.updateInterval);
    }
}