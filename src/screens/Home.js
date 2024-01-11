import React, { useState, useEffect, useRef } from 'react';

import { StyleSheet, Text, View, Dimensions, LogBox } from 'react-native';
import { VictoryChart, VictoryLine, VictoryScatter, VictoryTheme, VictoryAxis } from "victory-native";
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import Card from '../components/Card';
import Chart from '../components/Chart';
import { AntDesign } from '@expo/vector-icons';
import MQTTManager from '../connections/MQTTManager';
import FirebaseConnection from '../connections/FirebaseConnection';
import AppLoading from '../components/Loading';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIRE_RADIUS } from './Map';
import { setStatus } from './Warning';
import {getDistance} from 'geolib';
import * as firebase from 'firebase';

const db = new FirebaseConnection().db;

LogBox.ignoreLogs(["Setting a timer for a long period of time"]);
LogBox.ignoreLogs(["Commit failed with error"]);

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, ({data, error}) => {
    if (error) {
        console.log(error.message);
        return;
    }
    if (data) {
        console.log("Background Location update!");
        const {locations} = data;
        updateLocation(locations[0]);
    }
});

//Update user location and set status
async function updateLocation (location) {
    const uid = await AsyncStorage.getItem("uid");
    const userRef = db.collection("users").doc(uid);
    const buildingRef = db.collection("buildings").doc("bd_1");

    await db.runTransaction(async (transaction) => {
        const userInfo = await transaction.get(userRef);
        const buildingData = await transaction.get(buildingRef);

        const old_status = userInfo.data().status;
        let new_status = old_status;

        let increment = firebase.firestore.FieldValue.increment(0);

        const newIsIn = getDistance(
            {latitude: buildingData.data().position.latitude, longitude: buildingData.data().position.longitude},
            {latitude: location.coords.latitude, longitude: location.coords.longitude}
        ) <= FIRE_RADIUS;

        if (!("latitude" in userInfo.data()) || !("longitude" in userInfo.data())) {
            if (newIsIn) {
                new_status = "Unknown";
                increment = firebase.firestore.FieldValue.increment(1);
            }
        } else {
            const oldIsIn = getDistance(
                {latitude: buildingData.data().position.latitude, longitude: buildingData.data().position.longitude},
                {latitude: userInfo.data().latitude, longitude: userInfo.data().longitude}
            ) <= FIRE_RADIUS;
            
            if (!oldIsIn && newIsIn) { //From outside to inside
                if (old_status === "Not In Range" || old_status === "Safe") {
                    new_status = "Unknown";
                    increment = firebase.firestore.FieldValue.increment(1);
                }
            } else if (oldIsIn && !newIsIn) { //From inside to outside
                if (old_status === "Unknown" || old_status === "In Danger") {
                    if (buildingData.data().isOnFire) new_status = "Safe"; //Change to safe if is on fire
                    else new_status = "Not In Range"; //Change to to not in range if not is on fire
                    increment = firebase.firestore.FieldValue.increment(-1);
                }
            } else if (oldIsIn && newIsIn) {
                if (old_status === "Not In Range") {
                    increment = firebase.firestore.FieldValue.increment(1);
                    new_status = "Unknown";
                }
            } else if (!oldIsIn && !newIsIn) {
                if (old_status === "In Danger" || old_status === "Unknown") {
                    increment = firebase.firestore.FieldValue.increment(-1);
                    new_status = "Safe";
                }
            }
        }

        transaction.update(userRef, {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            lastLocationUpdate: new Date(location.timestamp),
            status: new_status,
        }, {merge: true});

        transaction.set(buildingRef, {
            numPeopleInDanger: increment,
        }, {merge: true})
    })
    
}

//Return cluster information and data fetched from database, including device data
async function fetchDataFromDatabase() {
    const clrs = [];

    const clustersData = db.collection("buildings").doc("bd_1").collection("clusters");
    const querySnapshot = await clustersData.get();

    //querySnapshot doesn't have map function
    const docs = [];
    querySnapshot.forEach((doc) => {
        docs.push(doc);
    })

    let tenMinAgo = new Date();
    tenMinAgo.setMinutes(tenMinAgo.getMinutes() - 10);

    await Promise.all(docs.map(
        async (doc) => {

            let clr = {
                id: doc.id,
                name: doc.data().name,
                status: true,
                data: {},
                calData: {}
            }

            for (const deviceId of doc.data().devices) {
                const device = db.collection("devices").doc(deviceId);
                const deviceData = await device.get();
                if (deviceData.data().type === 'dht' || deviceData.data().type === 'gas_sensor') {
                    clr.data[deviceId] = [];
                    clr.calData[deviceId] = [];
                    // const query = await device.collection("data").where("timestamp", ">=", tenMinAgo).orderBy("timestamp", "desc").get();
                    const query = await device.collection("data").orderBy("timestamp", "desc").get();

                    query.forEach((doc) => {
                        //The data fetched is reversed, so push it to the front of the list
                        clr.data[deviceId].push({
                            x: doc.data().timestamp.toDate(),
                            y: doc.data().value,
                        })
                        clr.calData[deviceId].unshift({
                            value: doc.data().value,
                            timestamp: doc.data().timestamp,
                        })
                    });
                }
            }
            clrs.push(clr);
        }
    ))
    return clrs;
}

//Check if the building is on fire, and if the user is in the fire region, navigate to the warning screen if neccessary
async function checkForFireAndNavigateToWarning(navigation) {
    const buildingData = await db.collection("buildings").doc("bd_1").get();
    if (buildingData.data().isOnFire) {
        const uid = await AsyncStorage.getItem("uid");
        const user_info = await db.collection("users").doc(uid).get();
        if ("latitude" in user_info.data() && "longitude" in user_info.data()) {
            if (getDistance(
                {latitude: buildingData.data().position.latitude, longitude: buildingData.data().position.longitude}, 
                {latitude: user_info.data().latitude, longitude: user_info.data().longitude}) <= FIRE_RADIUS) 
                {
                if (user_info.data().status === "Unknown") {
                    navigation.navigate("Warning");
                }
            }
        }
    }
}

const Home = ({ navigation }) => {
    const mqttManager = new MQTTManager();

    const [cluster, setCluster] = useState([]);
    const handlerId1 = useRef(-1);
    const handlerId2 = useRef(-1);

    const scrollX = new Animated.Value(0);

    const [isReady, setIsReady] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();
    const locationListener = useRef();
    const interval = useRef();
    const [maxDate, setMaxDate] = useState(new Date());

    const messageArrivedHandler = (message) => {
        console.log("Message arrived !!!");
        console.log(message.payloadString);
        const object = JSON.parse(message.payloadString);
        let value = object.data;
        value = value.split('-');
        console.log(value);
        timestamp = new Date();
        updateData(object.id, value, timestamp);
    }



    useEffect(() => {
        load().then(() => {
            handlerId1.current = mqttManager.addMessageArrivedHandler("dht", messageArrivedHandler);
            handlerId2.current = mqttManager.addMessageArrivedHandler("gas_sensor", messageArrivedHandler);
            setIsReady(true);
        });
        console.log("Adding notification handler");
        //Add handler for notification clicked
        //This only works if the app is not terminated (foreground case)
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            Notifications.dismissAllNotificationsAsync();
            console.log("navigating to warning screen");
            navigation.navigate("Warning");
        });

        //Add handler for notification clicked
        //This only works if the app is not terminated (background case)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            Notifications.dismissAllNotificationsAsync();
            console.log("navigating to warning screen");
            navigation.navigate("Warning");
        });

        return () => {
            //Clean up function
            if (handlerId1.current) mqttManager.removeMessageArrivedHandler("dht", handlerId1.current);
            if (handlerId2.current) mqttManager.removeMessageArrivedHandler("gas_sensor", handlerId2.current);
            console.log("Cleaning up notification handler");
            Notifications.removeNotificationSubscription(notificationListener.current);
            Notifications.removeNotificationSubscription(responseListener.current);
            if (locationListener.current) {
                console.log("Remove foreground location handler");
                locationListener.current.remove();
            }
        }
    }, []);

    useEffect(() => {
        interval.current = setInterval(() => {
            setMaxDate(new Date());
        }, 5000);

        return () => {
            clearInterval(interval.current);
        }
    }, []);

    const updateData = (device_id, value, timestamp) => {
        setCluster((oldCluster) => {
            let nC = [...oldCluster];
            for (let i = 0; i < nC.length; i++) {
                if (device_id in nC[i].data) {
                    nC[i].data[device_id].push({ x: timestamp, y: parseFloat(value[0]) });
                    nC[i].calData[device_id].push({ value: value[0], timestamp: timestamp });
                    return nC;
                }
            }
            return nC;
        });
    }

    async function load() {
        await checkForFireAndNavigateToWarning(navigation);
        const clrs = await fetchDataFromDatabase();
        setCluster(clrs);
        const {status} = await Location.requestBackgroundPermissionsAsync();
        if (status === 'granted') {
            const locationUpdateStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
            if (!locationUpdateStarted) {
                await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                    accuracy: Location.Accuracy.Balanced,
                });
            }
        }
        const ret = await Location.requestForegroundPermissionsAsync();
        if (ret.status === 'granted') {
            locationListener.current = await Location.watchPositionAsync({timeInterval: 5000, distanceInterval: 1}, (location) => {
                console.log("foreground location update !");
                updateLocation(location);
            })
        }
    }


    if (!isReady) {
        return (
            <AppLoading
                startAsync={async () => { }}
                onFinish={() => { }}
                onError={() => { }}
            />
        )
    }

    return (
        <View style={styles.container}>
            <Animated.ScrollView
                horizontal
                pagingEnabled
                scrollEventThrottle={16}
                snapToAlignment='center'
                snapToInterval={Dimensions.get('window').width}
                showsHorizontalScrollIndicator={false}
                decelerationRate={0}
                onScroll={Animated.event([
                    { nativeEvent: { contentOffset: { x: scrollX } } }
                ], { useNativeDriver: false })}
                style={{ height: Dimensions.get('window').height * 0.5, marginTop: 20 }}
            >
                {cluster.map((item, index) => (
                    <TouchableOpacity onPress={() => navigation.navigate("FullChart", { cluster: item.id, param: item })} key={index.toString()}>
                        <Chart index={index} name={item.name} data={item.data} maxDate={maxDate}/>
                    </TouchableOpacity>
                ))}
            </Animated.ScrollView>
            <View style={styles.titleBlock}>
                <Text style={styles.title}>CLUSTER LIST</Text>
            </View>
            <FlatList
                style={styles.listBlock}
                keyExtractor={(item, index) => index.toString()}
                data={cluster}
                renderItem={itemData => (
                    <TouchableOpacity onPress={() => { navigation.navigate("ListDevice", { cluster: itemData.item.id }) }}>
                        <Card name={itemData.item.name} detail="Building 1">
                            <AntDesign name="dashboard" size={24} color="#FF8303" />
                        </Card>
                    </TouchableOpacity>
                )}
            />
        </View>

    );
}

export default Home;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1B1A17',
    },

    header: {
        marginTop: 30,
        paddingHorizontal: 30
    },

    clustername: {
        color: '#f2f2f2',
        marginBottom: 5,
        fontSize: 17,
    },

    chartContainer: {
        backgroundColor: '#232323',
        borderWidth: 2,
        borderColor: '#cecece',
        borderRadius: 15,
        elevation: 3,
        shadowColor: 'white',
    },

    titleBlock: {
        width: Dimensions.get('window').width / 2.5,
        margin: 10,
        alignItems: 'center',
        borderColor: '#F2f2f2',
        borderWidth: 2,
    },

    title: {
        fontSize: 17,
        padding: 10,
        fontWeight: 'bold',
        color: '#f2f2f2',
    },

    listBlock: {
        marginHorizontal: 10,
        marginBottom: 10,
        height: Dimensions.get('window').height * 0.5
    }

});



