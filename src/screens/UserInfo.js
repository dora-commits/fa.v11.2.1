import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar, Caption } from 'react-native-paper';
import { SimpleLineIcons } from '@expo/vector-icons';
import * as firebase from 'firebase';
import AsyncStorage from "@react-native-async-storage/async-storage";
import FirebaseConnection from '../connections/FirebaseConnection';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const LOCATION_TASK_NAME = 'background-location-task';

const db = new FirebaseConnection().db;
const auth = new FirebaseConnection().auth;

async function fetchUserInfoFromDB(uid) {
    const userDoc = db.collection("users").doc(uid);
    const userData = await userDoc.get();
    return userData.data();
}

const UserInfoScreen = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        fetchUserInfoFromDB(auth.currentUser.uid).then((uData) => {
            setUserInfo(uData);
        });
    }, []);

    function signOut() {
        AsyncStorage.removeItem('username').catch(() => {
            console.log("Error removing username");
        });
        AsyncStorage.removeItem('password').catch(() => {
            console.log("Error removing password");
        });
        AsyncStorage.getItem('uid').then((uid) => {
            db.collection("users").doc(uid).update({
                notifitoken: firebase.firestore.FieldValue.delete(),
                lastLocationUpdate: firebase.firestore.FieldValue.delete(),
                latitude: firebase.firestore.FieldValue.delete(),
                longitude: firebase.firestore.FieldValue.delete(),
                status: "Not In Range",
            }).catch(() => {
                console.log("Error removing notification token");
            });
            AsyncStorage.removeItem('uid').catch(() => {
                console.log("Error removing uid");
            })
        }).catch(() => {
            console.log("Error processing notification token");
        });

        Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME).then(locationUpdateStarted => {
            if (locationUpdateStarted) {
                Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            }
        })

        navigation.replace("Authentication");
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
                    <Text style={styles.signOutBtnText}>SIGN OUT</Text>
                </TouchableOpacity>
            </View>
            { userInfo
                ? (userInfo.manager == true
                    ? <View style={[styles.avatar, { flex: 0.38 }]}>
                        <View style={styles.manager}>
                            <Text style={styles.managerText}>Manager User</Text>
                        </View>
                        <Avatar.Image source={{ uri: userInfo ? userInfo.photoURL : userInfo }} size={150} />
                        <Caption style={{ color: '#fff' }}>
                            {userInfo ? userInfo.email : userInfo}
                        </Caption>
                    </View>
                    : <View style={styles.avatar}>

                        <Avatar.Image source={{ uri: userInfo ? userInfo.photoURL : userInfo }} size={150} />
                        <Caption style={{ color: '#fff' }}>
                            {userInfo ? userInfo.email : userInfo}
                        </Caption>
                    </View>
                )
                : userInfo
            }
            <View style={styles.infoTitle}>
                <Text style={styles.personalInfo}>Personal info</Text>
                <TouchableOpacity onPress={() => navigation.navigate('EditInfo')} style={styles.edit}>
                    <Text style={styles.editText}>Edit</Text>
                    <SimpleLineIcons name="note" size={16} color="#000" />
                </TouchableOpacity>
            </View>
            <View style={styles.row}>
                <Text style={styles.tag}>Name</Text>
                <Text style={styles.data}>
                    {userInfo ? userInfo.name : userInfo}
                </Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.tag}>Email</Text>
                <Text style={styles.data}>
                    {userInfo ? userInfo.email : userInfo}
                </Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.tag}>Phone</Text>
                <Text style={styles.data}>
                    {userInfo ? userInfo.phone : userInfo}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1B1A17'
    },
    avatar: {
        flex: 0.3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        marginTop: 50,
        flex: 0.1,
        alignItems: 'flex-end'
    },
    signOutBtn: {
        borderWidth: 1,
        borderColor: '#ff8303',
        borderRadius: 25,
        marginRight: 15,
    },
    signOutBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        paddingHorizontal: 15,
        paddingVertical: 8
    },
    infoTitle: {
        flex: 0.1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    personalInfo: {
        flex: 0.8,
        color: '#fff',
        fontSize: 14,
        marginLeft: 30
    },
    row: {
        flex: 0.06,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tag: {
        flex: 0.25,
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 30,
    },

    data: {
        flex: 0.6,
        color: '#ff8303',
        fontSize: 16,
        fontWeight: 'bold'
    },

    edit: {
        flex: 0.2,
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 3,
        marginRight: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    editText: {
        color: '#000',
        marginRight: 10,
        fontStyle: 'italic'
    },
    manager: {
        backgroundColor: '#ff8303',
        padding: 5,
        marginBottom: 15,
        borderRadius: 5,
    },
    managerText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14
    }

})

export default UserInfoScreen;