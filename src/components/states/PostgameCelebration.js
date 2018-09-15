import React from 'react';
import { View, Text, FlatList } from 'react-native';
import firebase from '../../Firebase';

export default class PostgameCelebration extends React.Component {
    state = {
        players: [],
        leaderboard: []
    }

    componentWillMount() {
        firebase.database().ref('players').on('value', snapshot => {
            this.setState({ players: snapshot.val() });
        });

        firebase.database().ref('game/leaderboard').orderByValue().on('value', snapshot => {
            let leaderboard = [];
            snapshot.forEach(score => {
                leaderboard.push({
                    key: score.key,
                    score: score.val(),
                });
            });
            
            this.setState({ leaderboard: leaderboard.reverse() });
        });
    }

    render() {
        let leaderboardData = [];
        if(this.state.leaderboard) {
            let rank = 1;
            this.state.leaderboard.forEach(score => {
                leaderboardData.push({ key: score.key, rank: rank, name: this.state.players[score.key] && this.state.players[score.key].name, score: score.score });
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
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 36 }}>The winner is...</Text>
                <Text style={{ fontSize: 48 }}>{leaderboardData[0] && leaderboardData[0].name}</Text>
                <FlatList data={leaderboardData} renderItem={renderItem} />
            </View>
        )
    }
}