import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SimpleLineIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function ItemDevice(props) {
    return (
        <View style={[styles.item, props.isO? styles.card : styles.cardNOT]}>
            <View style={styles.cardContent}>
                {props.children}
                <View style={{justifyContent: 'space-between', flexDirection:'row', flex: 1, alignItems: 'center'}}>
                    <View style={styles.content}>
                        <Text style={[styles.titleText, props.status === 'OK' ? styles.title : styles.titleNOT]}>{props.name} {'                    '} {props.status}</Text>
                    </View>
                    <SimpleLineIcons name= {"check",props.status === 'OK'?"check":"exclamation"} size={20} color={"#FF8303",props.status === 'OK'? "#FF8303":"#808080"}/>
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
        backgroundColor: "#0c0c0c"
    },
    cardNOT: {
        marginVertical: 10,
        padding: 12,
        borderColor: '#808080',
        borderWidth: 3,
        marginHorizontal: 10,
        backgroundColor: "#0c0c0c"
    },
    
    cardContent: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
    },

    content: {
        marginLeft: 5,
    },

    title: {
        color: '#FF8303',
        fontWeight: 'bold',
        fontSize: 13
    },
    titleNOT: {
        color: '#808080',
        fontWeight: 'bold',
        fontSize: 13
    },
    body: {
        color: 'grey'
    }
})
