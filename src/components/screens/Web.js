import React from 'react';
import { View, Button, Text } from 'react-native';

export default class Web extends React.Component {
    onPressBack = () => {
        this.props.history.goBack();
    }

    render() {
        return(
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Button title="Back" onPress={this.onPressBack} />
                <Text>Coming soon</Text>
            </View>
        )
    }
}