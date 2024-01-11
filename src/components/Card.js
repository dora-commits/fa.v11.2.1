import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SimpleLineIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function Card(props) {
    return (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                {props.children}
                <View style={{ justifyContent: 'space-between', flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                    <View style={styles.content}>
                        <Text style={styles.title}>{props.name}</Text>
                        <Text style={styles.body}>{props.detail}</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        marginVertical: 10,
        padding: 12,
        borderColor: '#ff8303',
        borderWidth: 3,
        marginHorizontal: 10,
        backgroundColor: "#422407"
        // backgroundColor: "#cecece"
    },
    cardContent: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
    },

    content: {
        marginLeft: 10,
    },

    title: {
        color: '#FF8303',
        fontWeight: 'bold',
        fontSize: 19
    },
    body: {
        color: 'grey'
    }
})