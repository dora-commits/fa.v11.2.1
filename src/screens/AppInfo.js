import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useEffect } from 'react';


const AppInfoScreen = ({navigation}) => {
    const onUserManualPressed = () => {
        navigation.navigate("UserManualScreen");
    }

    const onSafetyTipPressed = () => {
        navigation.navigate("SafetyTips");
    }

    useEffect(() => {
        navigation.setOptions({
            title: 'About Us'
        })
    }, [])

    return (
        <View style={styles.container}>
            <Text style={styles.screenTitle}>About Us</Text>
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="fire" size={170} color="#A35709" />
                <Text style={styles.iconTitle}>Fire Alarm</Text>
            </View>
            <Text style={styles.iconVersion}>Version 0.0.1</Text>
            <TouchableOpacity style={[styles.btn, styles.btnDefault]} onPress={onUserManualPressed}>
                <Text style={[styles.btnText, styles.btnTextDefault]}>HOW TO USE THIS APP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={onSafetyTipPressed}>
                <Text style={[styles.btnText, styles.btnTextPrimary]}>WHAT TO DO WHEN A FIRE STARTS</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1B1A17',
    },
    screenTitle: {
        color: '#FF8303',
        fontSize: 35,
        marginTop: 30,
        textAlign: 'center',
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
    btn: {
        width: '85%',
        flexDirection: 'row',
        marginTop: '15%',
        alignSelf: 'center',
        padding: 15,
        borderRadius: 25,
        justifyContent: 'center'
    },
    btnDefault: {
        backgroundColor: '#F0E3CA',
    }, 
    btnPrimary: {
        backgroundColor: '#FF8303',
    },
    btnText: {
        fontSize: 16,
    },
    btnTextDefault: {
        color: '#1B1A17'
    },
    btnTextPrimary: {
        color: '#F0E3CA'
    },
});

export default AppInfoScreen;