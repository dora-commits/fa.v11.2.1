import React from 'react';
import {StyleSheet, Text, View, Modal, TouchableOpacity, Switch} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const Card = ({title, content}) => {
    return (
        <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardContent}>{content}</Text>
        </View>
    );
}

export const MySwitch = ({isOn, handler}) => {
    return (
        <View style={[styles.switchContainer, isOn ? styles.switchContainerOn : styles.switchContainerOff]}>
            <Text style={[styles.switchText, isOn ? styles.switchTextOn : styles.switchTextOff]}>{isOn ? 'On' : 'Off'}</Text>
            <Switch 
            value={isOn}
            onValueChange={handler}
            trackColor={{false: '#555555', true: '#A35709'}}
            thumbColor={isOn ? '#FF8303' : '#FAFAFA'}
            />
        </View>
    );
}

export const MyButton = ({icon, content, isDisabled, handler}) => {
    return (
        <TouchableOpacity style={[styles.btn, isDisabled ? styles.btnDisabled : styles.btnEnabled]} activeOpacity={0.6} disabled={isDisabled} onPress={handler}>
            <MaterialIcons style={styles.btnIcon} name={icon} size={20} color= {isDisabled ? '#F0E3CA99' : '#F0E3CA'} />
            <Text style={[styles.btnText, isDisabled ? styles.btnTextDisabled : styles.btnTextEnabled]}>{content}</Text>
        </TouchableOpacity>
    );
}

export const MyModal = ({isShown, title, noHandler, yesHandler}) => {
    return (
        <Modal
            animationType = "slide"
            transparent = {true}
            visible = {true}
            visible= {isShown}
        >   
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <TouchableOpacity style={[styles.modalBtn, styles.modalBtnDefault]} onPress={noHandler}>
                        <Text style={[styles.modalBtnText, styles.modalBtnTextDefault]}>No</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]}>
                        <Text style={[styles.modalBtnText, styles.modalBtnTextPrimary]} onPress={yesHandler}>Yes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}


const styles = StyleSheet.create({
    cardContainer: {
        width: '90%',
        borderBottomColor: '#F0E3CA',
        borderBottomWidth: 1,
        alignSelf: 'center',
        marginTop: 16,
    },
    cardTitle: {
        fontSize: 28,
        color: '#FF8303',
        marginBottom: 10,
        marginHorizontal: 5,
    },
    cardContent: {
        fontSize: 15,
        color: '#F0E3CA',
        marginBottom: 16,
        marginHorizontal: 7,
    },
    switchContainer: {
        marginTop: 50,
        height: 100,
        flexDirection: 'row',
        borderRadius: 20,
        alignItems: 'center',
        width: '90%',
        alignSelf: 'center',
        justifyContent: 'space-around'
    },
    switchContainerOn: {
        backgroundColor: '#463423'
    },
    switchContainerOff: {
        backgroundColor: "#2C2C2C"
    },
    switchText: {
        fontSize: 28,
    },
    switchTextOn: {
        color: '#FF8303',
    },
    switchTextOff: {
        color: '#DCDCDC'
    },
    btn: {
        width: '85%',
        flexDirection: 'row',
        marginTop: 35,
        alignSelf: 'center',
        padding: 15,
        borderRadius: 25,
    },
    btnDisabled: {
        backgroundColor: '#FF830399',
    }, 
    btnEnabled: {
        backgroundColor: '#FF8303',
    },
    btnIcon: {
        marginLeft: 20,
    },
    btnText: {
        marginLeft: 20,
        fontSize: 16
    },
    btnTextDisabled: {
        color: '#F0E3CA99'
    },
    btnTextEnabled: {
        color: '#F0E3CA'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: "#000000CC"
    },
    modalContent: {
        backgroundColor: 'rgba(255, 154, 21, 0.8)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        alignItems: 'center'
    },
    modalTitle: {
        backgroundColor: "#00000000",
        marginTop: 30,
        marginBottom: 30,
        color: "#F2F2F2",
        fontSize: 16
    },
    modalBtn: {
        paddingTop: 10,
        paddingBottom: 10,
        width: '50%',
        marginBottom: 20,
        borderRadius: 5,
        borderWidth: 1
    },
    modalBtnDefault: {
        backgroundColor: "#F2F2F2",
        borderColor: "#FF8303",
    },
    modalBtnPrimary: {
        backgroundColor: "#FF8303",
        borderColor: "#F2F2F2",
    },
    modalBtnText: {
        textAlign: 'center',
        fontSize: 16
    },
    modalBtnTextDefault: {
        color: "#FF8303",
    },
    modalBtnTextPrimary: {
        color: "#F2F2F2"
    }
});
