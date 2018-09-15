import React from 'react';
import { View, Text, Platform } from 'react-native';

export default class PregameCountdown extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            timeRemaining: null,
        }
    }

    componentWillMount() {
        this.updateInterval = setInterval(() => { this.update(); }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.updateInterval);
    }

    update() {
        if(this.props.endTime != null) {
            let timeRemaining = new Date(new Date(this.props.endTime).getTime() - Date.now());
            let minutes = timeRemaining.getMinutes();
            let seconds = timeRemaining.getSeconds() < 10 ? '0' + timeRemaining.getSeconds() : timeRemaining.getSeconds();
            let timeRemainingFormatted = `${minutes}:${seconds}`;
            this.setState({ timeRemaining: timeRemainingFormatted });
        }
    }

    render() {
        return(
            <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, display: "flex", justifyContent: "center", alignItems: "center" }} pointerEvents="none">
                <Text style={{ fontSize: 24, color: "white" }}>Game starts in...</Text>
                <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'Roboto', fontSize: 182, color: "white" }}>{this.state.timeRemaining}</Text>
            </View>
        )
    }
}