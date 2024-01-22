import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';

const OPTIONS = ['Present', '30 min', '1 hour', '6 hours', '12 hours', '1 day', '3 days', '7 days']
const HEIGHT = Dimensions.get('window').height;

const ModalPicker = (props) => {

    const onPressItem = (option) => {
        props.changeModalVisibility(false);
        props.setPeriod(option);
    }

    const option = OPTIONS.map((item, index) => {
        return (
            <TouchableOpacity style={styles.option} key={index} onPress={() => onPressItem(item)}>
                <Text style={styles.text}>{item}</Text>
            </TouchableOpacity>
        )
    })

    return (
        <TouchableOpacity 
            onPress={() => props.changeModalVisibility(false)} 
            style={[styles.container, { marginTop: 240 - props.yScroll}]}
        >
            <View style={[styles.modal, { width: 86, height: 80 }]}>
                <ScrollView>
                    {option}
                </ScrollView>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-end',
        marginRight: 30,
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 2,
        borderWidth: 1
    },
    option: {
        alignItems: 'flex-start',
    },
    text: {
        margin: 10,
        fontSize: 12,
    }
})

export default ModalPicker;