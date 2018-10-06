import React from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import analytics from '../../Analytics';

export default class Web extends React.Component {
    componentDidMount() {
        this.didFocusListener = this.props.navigation.addListener('didFocus', () => {
            analytics.sendScreenView('Web');
        });
    }

    render() {
        return(
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text style={styles.legaleseText}>Bob Loblaw Bob Loblaw Bob Loblaw Bob Loblaw Bob Loblaw Bob Loblaw Bob Loblaw Bob Loblaw Bob Loblaw Bob Loblaw Bob Loblaw Bob Loblaw </Text>
            </View>
        )
    }

    componentWillUnmount() {
        this.didFocusListener.remove();
    }
}

const styles = StyleSheet.create({
    legaleseText: {
        fontSize: 24
    }
});