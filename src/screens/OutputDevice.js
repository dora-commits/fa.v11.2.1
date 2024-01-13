import React, { useState, useEffect, useRef } from 'react';

import {StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal} from 'react-native';
import {Card, MyButton, MyModal, MySwitch} from '../components/Device';
import MQTTManager from '../connections/MQTTManager';
import firebase from 'firebase/app';
import 'firebase/firestore';
import FirebaseConnection from '../connections/FirebaseConnection';

const db = new FirebaseConnection().db;
const auth = new FirebaseConnection().auth;

async function fetchDeviceInfoFromDatabase(deviceId, setOn, setDeviceInformation, deviceType, observer) {
    const deviceDoc = db.collection("devices").doc(deviceId);
    const device = await deviceDoc.get();
    const building = await db.collection("buildings").doc("bd_1").get();
    const deviceData = device.data();
    setOn(deviceData.isOn);
    setDeviceInformation([
        {
            title: "Device model",
            content: deviceData.name
        },
        {
            title: "Installed on",
            content: deviceData.installed
        },
        {
            title: "Location",
            content: building.data().location
        },
    ]);
    deviceType.current = device.data().type;
    
    observer.current = deviceDoc.onSnapshot(docSnapShot => {
        setOn(docSnapShot.data().isOn);
    });
}

async function fetchUserInfoFromDB(uid) {
    const userDoc = db.collection("users").doc(uid);
    const userData = await userDoc.get();
    return userData.data();
}

const DeviceScreen = ({route, navigation}) => {
    const mqttManager = new MQTTManager();

    const [on, setOn] = useState(false);

    const [deviceInformation, setDeviceInformation] = useState([]);
    const deviceType = useRef("");

    const observer = useRef(null);

    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        fetchUserInfoFromDB(auth.currentUser.uid).then((uData) => {
            setUserInfo(uData);
        });
    }, []);
    
    useEffect(() => {
        fetchDeviceInfoFromDatabase(route.params.deviceId, setOn, setDeviceInformation, deviceType, observer).then(() => {

        });
        return () => {
            if (observer.current){
                observer.current();
            }
        }
    }, [])

    useEffect(() => {
        if (deviceInformation.length !== 0) {
            navigation.setOptions({
                title: deviceInformation[0].content,
            });
        }
        return () => {}
    }, [deviceInformation])
    
    const [isSwitchModalOn, showSwitchModal] = useState(false)

    const switchHandler = (val) => {
        showSwitchModal(true);
    }

    const switchModalNoBtnHandler = () => {
        showSwitchModal(false);
    }

    const switchModalYesBtnHandler = () => {
        //TODO: switch the device on / off
        let msg;
        if (deviceType.current === "alarm") {
            msg = {
                id: "3",
                name: "SPEAKER",
                data: on ? "0": "512",
                unit: ""
            }
            mqttManager.sendMessage("alarm", JSON.stringify(msg));
        } else {
            msg = {
                id: "11",
                name: "RELAY",
                data: on? "0": "1",
                unit: "",
            }
            mqttManager.sendMessage("water", JSON.stringify(msg));
        }
        const deviceDoc = db.collection("devices").doc(route.params.deviceId);
        deviceDoc.set({
            isOn: !on
        }, {merge: true});
        // setOn(!on);
        showSwitchModal(false);
    }

    const viewDeviceBtnHandler = () => {
        navigation.navigate('Map', {params: {deviceId: route.params.deviceId}});
    }
    
    return (
        <View style={styles.container}>
            <ScrollView>
                <Text style={styles.screenTitle}>Device information</Text>

                {deviceInformation.map((data, index) => {
                    return <Card title={data.title} content={data.content} key={index}/>
                })}

                <Card title={"Status"} content={getStatusString(on)} />

                { userInfo && 
                    (
                        userInfo.manager && <MySwitch isOn={on} handler={switchHandler}/>
                    )
                }

                <MyButton icon="location-on" content="VIEW DEVICE ON MAP" isDisabled={false} handler={viewDeviceBtnHandler}/>

                <View style={styles.endView}></View>
            </ScrollView>
            
            <MyModal isShown={isSwitchModalOn} title={on? "Do you really want to TURN OFF the device ?": "Do you really want to TURN ON the device ?"} noHandler={switchModalNoBtnHandler} yesHandler={switchModalYesBtnHandler} />
        </View>
    );
}

const getStatusString = (isOn) => {
    let result = '';
    if (isOn) result =  "The device is currently on.";
    else result = "The device is currently off.";
    return result;
}

export default DeviceScreen;

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
        marginBottom: 30,
    },
    chart: {
        width: '80%',
        height: 200,
        backgroundColor: 'white',
        alignSelf: 'center',
        marginTop: 10,
    },
    endView: {
        marginTop: 20
    },
});

