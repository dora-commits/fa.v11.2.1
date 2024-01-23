import React, {useEffect} from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

export default function Loading({startAsync, onFinish, onError}){
    startAsync().then(() => {
        onFinish();
    }).catch(() => {
        onError();
    });

    return (
        <View style={styles.container}>
            <View>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="fire" size={170} color="#A35709" />
                    <Text style={styles.iconTitle}>Fire Alarm</Text>
                </View>
                <Text style={styles.iconVersion}>Version 0.0.1</Text>
            </View>
            <Text style={styles.loadMsg}>Loading...</Text>
        </View>
    )
    
}

const styles = StyleSheet.create({
    container:{
        backgroundColor: '#1B1A17',
        flex: 1,
        justifyContent: 'space-around',
    },
    iconContainer: {
        alignItems: 'center',
    },
    iconTitle: {
        fontSize: 24,
        color: "#A35709",
    },
    iconVersion: {
        fontSize: 22,
        textAlign: 'center',
        color: '#F0E3CA'
    },
    loadMsg: {
        marginTop: 20,
        fontSize: 35,
        textAlign: 'center',
        color: "#A35709",
    }
})