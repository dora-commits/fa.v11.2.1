import React, { useState, useEffect, useRef } from 'react';
import {StyleSheet, Text, View, ScrollView, Modal} from 'react-native';
import MQTTManager from '../connections/MQTTManager'; 
import FirebaseConnection from '../connections/FirebaseConnection';
import {Card, MyButton, MyModal} from '../components/Device';
import Chart from '../components/Chart';
import email from 'react-native-email';

const db = new FirebaseConnection().db;

async function fetchDeviceInfoFromDatabase(deviceId, setWorking, setDeviceInformation, setDeviceData) {
    const device = await db.collection("devices").doc(deviceId).get();
    const building = await db.collection("buildings").doc("bd_1").get();
    const deviceData = device.data();
    if (deviceData._status === "OK") {
        setWorking(true);
    } else {
        setWorking(false);
    }
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
    ])

    let tenMinAgo = new Date();
    tenMinAgo.setMinutes(tenMinAgo.getMinutes() - 10);

    const data = [];
    const query = await db.collection("devices").doc(deviceId).collection("data").where("timestamp", ">=", tenMinAgo).orderBy("timestamp", "desc").get();
    query.forEach((doc) => {
        //The data fetched is reversed, so push it to the front of the list
        data.unshift({
            x: doc.data().timestamp.toDate(),
            y: doc.data().value,
        })
    });
    setDeviceData({
        id: deviceId, 
        name: deviceData.name, 
        status: true, 
        data: {
            [deviceId]: data,
        },
    });
    if (data.length == 0) {
        setWorking(false);
    }
}

const DeviceScreen = ({route, navigation}) => {
    const mqttManager = new MQTTManager();

    const handlerId1 = useRef(-1);
    const handlerId2 = useRef(-1);

    const interval = useRef();
    const [maxDate, setMaxDate] = useState(new Date());

    const [working, setWorking] = useState(true)

    const [deviceInformation, setDeviceInformation] = useState([])

    const [deviceData, setDeviceData] = useState(
        {
            id: 0, name: 'No name', status: true, data: {}
        }
    )
    
    const messageArrivedHandler = (message) => {
        const obj = JSON.parse(message.payloadString);
        if (parseInt(obj.id) === parseInt(route.params.deviceId)) {
            let value = obj.data;
            value = value.split("-")[0];
            timestamp = new Date();
            updateData(value, timestamp);
            setWorking(true);
        }
    };
    
    const [isInformModalOn, showInformModal] = useState(false);

    useEffect(() => {
        
        fetchDeviceInfoFromDatabase(route.params.deviceId, setWorking, setDeviceInformation, setDeviceData).then(() => {
            handlerId1.current = mqttManager.addMessageArrivedHandler("dht", messageArrivedHandler);
            handlerId2.current = mqttManager.addMessageArrivedHandler("gas_sensor", messageArrivedHandler);
        });

        return () => {
            mqttManager.removeMessageArrivedHandler("dht", handlerId1.current);
            mqttManager.removeMessageArrivedHandler("gas_sensor", handlerId2.current);
        }
    }, [])

    useEffect(() => {
        if (deviceInformation.length !== 0) {
            navigation.setOptions({
                title: deviceInformation[0].content,
            });
        }
        return () => {}
    }, [deviceInformation]);

    useEffect(() => {
        interval.current = setInterval(() => {
            setMaxDate(new Date());
        }, 5000);

        return () => {
            clearInterval(interval.current);
        }
    }, []);

    const updateData = (value, timestamp) => {
        setDeviceData((oldDeviceData) => {
            let newDeviceData = {...oldDeviceData};
            let newY = parseFloat(value);
            newDeviceData.data[route.params.deviceId].push({x: timestamp, y: newY});
            return newDeviceData;
        })
    }

    const informBtnHandler = () => {
        showInformModal(true);
    }

    const informModalNoBtnHandler = () => {
        showInformModal(false);
    }

    const informModalYesBtnHandler = () => {
        showInformModal(false);
        handleEmail();
    }

    const viewDeviceBtnHandler = () => {
        navigation.navigate('Map', {params: {deviceId: route.params.deviceId}});
    }

    const handleEmail = () => {
        const to = ['firealert@admin.com.vn'];
        email(to, {
            subject: '[Damaged device' + deviceInformation[0].content + ']',
            body: 'Dear dir/madam.\n\nThe device ' +  deviceInformation[0].content + 'at' + deviceInformation[2].content + 'is currently damaged.\n\nPlease consider taking a look at the device.\n\nBest regards.'
        }).catch(console.error);
    }
    
    
    return (
        <View style={styles.container}>
            <ScrollView>
                <Text style={styles.screenTitle}>Device information</Text>
                <Chart index={deviceData.id} name={deviceData.name} data={deviceData.data} maxDate={maxDate}/>

                {deviceInformation.map((data, index) => {
                    return <Card title={data.title} content={data.content} key={index}/>
                })}

                <Card title={"Status"} content={getStatusString(working)} />
                
                <MyButton icon="dangerous" content="INFORM DAMAGED DEVICE" isDisabled={working} handler={informBtnHandler}/>

                <MyButton icon="location-on" content="VIEW DEVICE ON MAP" isDisabled={false} handler={viewDeviceBtnHandler}/>

                <View style={styles.endView}></View>
            </ScrollView>
            
            <MyModal isShown={isInformModalOn} title="Do you want to report the damaged device ?" noHandler={informModalNoBtnHandler} yesHandler={informModalYesBtnHandler} />
        </View>
    );
}

const getStatusString = (isWorking) => {
    let result= "";
    if (isWorking) {
        result = "The device is working normally.";
    } else {
        result = "The device is damaged. You can press the button below to report it.";
    }
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






