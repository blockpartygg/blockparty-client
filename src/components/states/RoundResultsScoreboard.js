import React from 'react';
import { View, FlatList, Text } from 'react-native';
import firebase from '../../Firebase';

export default class RoundResultsScoreboard extends React.Component {
    state = {
        players: [],
        scoreboard: []
    }

    componentWillMount() {
        firebase.database().ref('players').on('value', snapshot => {
            this.setState({ players: snapshot.val() });
        });

        firebase.database().ref('game/scoreboard').orderByValue().on('value', snapshot => {
            let scoreboard = [];
            snapshot.forEach(score => {
                scoreboard.push({
                    key: score.key,
                    score: score.val(),
                });
            });
            
            this.setState({ scoreboard: scoreboard.reverse() });
        });
    }

    render() {
        let scoreboardData = [];
        if(this.state.scoreboard) {
            let rank = 1;
            this.state.scoreboard.forEach(score => {
                scoreboardData.push({ key: score.key, rank: rank, name: this.state.players[score.key] && this.state.players[score.key].name, score: score.score });
                rank++;
            });
        }

        let renderItem = ({item}) => (
            <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text>{item.rank}</Text>
                <Text style={{ fontSize: 24 }}>{item.name}</Text>
                <Text>{item.score}</Text>
            </View>
        );

        return(
            <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} pointerEvents="none">
                <View style={{ flex: 1}} />
                <View style={{ flex: 8 }}>
                    <Text style={{ fontSize: 36, textAlign: "center" }}>Round {this.props.round}</Text>
                    <Text style={{ fontSize: 48, textAlign: "center" }}>Results</Text>
                    <Text style={{ fontSize: 24, textAlign: "center" }}>Scoreboard</Text>
                    <FlatList data={scoreboardData} renderItem={renderItem} />
                </View>
                <View style={{ flex: 1 }} />
            </View>
        )
    }

    componentWillUnmount() {
        firebase.database().ref('players').off();
        firebase.database().ref('game/scoreboard').off();
    }
}