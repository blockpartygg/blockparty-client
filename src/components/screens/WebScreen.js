import React from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';

export default class Web extends React.Component {
    onPressBack = () => {
        this.props.navigation.goBack();
    }

    render() {
        return(
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Button title="Back" onPress={this.onPressBack} />
                <Text style={styles.legaleseText}>Bob Loblaw Bob Loblaw Bob Loblaw Bob Loblaw Bob Loblaw Bob Loblaw Bob Loblaw Bob Loblaw Bob Loblaw Bob Loblaw Bob Loblaw Bob Loblaw </Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    legaleseText: {
        fontSize: 24
    }
});