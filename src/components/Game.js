import React from 'react';
import firebase from '../../Firebase';

export default class Game extends React.Component {
    state = {
        state: null,
        endTime: null,
        round: null,
        minigame: null,
        mode: null,
        teams: null,
    }

    componentDidMount() {
        firebase.database.ref('game/state').on('value', snapshot => {
            let state = snapshot.val();
            if(state) {
                this.setState({ state: state });
            }
        });
        firebase.database.ref('game/endTime').on('value', snapshot => {
            let endTime = snapshot.val();
            if(endTime) {
                this.setState({ endTime: endTime });
            }
        });
        firebase.database.ref('game/round').on('value', snapshot => {
            let round = snapshot.val();
            if(round) {
                this.setState({ round: round });
            }
        });
        firebase.database.ref('game/minigame').on('value', snapshot => {
            let minigame = snapshot.val();
            if(minigame) {
                this.setState({ minigame: minigame });
            }
        });
        firebase.database.ref('game/mode').on('value', snapshot => {
            let mode = snapshot.val();
            if(mode) {
                this.setState({ mode: mode });
            }
        });
    }
}