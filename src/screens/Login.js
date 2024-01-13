import React, { useState, useRef, useEffect } from 'react';
import * as Animatable from 'react-native-animatable';
import { StyleSheet, Text, View, TextInput, Image, Button, Dimensions, Alert } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from "react-native-vector-icons/Ionicons";
import FirebaseConnection from '../connections/FirebaseConnection';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as NotificationHandler from '../notifications/NotificationHandler';
import AppLoading from '../components/Loading';

const db = new FirebaseConnection().db;
const auth = new FirebaseConnection().auth;

const LoginScreen = ({navigation}) => {
    const [Username, setUsername] = useState(null)
    const [Password, setPassword] = useState(null)
    const [secure, setSecure] = useState(true);
    const [errMsg, seterrMsg] = useState(null);
    const [isReady, setIsReady] = useState(false);

    async function Login (username, password) {
        try {
            await auth.signInWithEmailAndPassword(username, password);
            Alert.alert("Welcome to Fire Alert app!");
            seterrMsg(null);

            //store username and password for auto login
            AsyncStorage.setItem('username', username).catch(() => {
                console.log("Error saving username");
            });
            AsyncStorage.setItem('password', password).catch(() => {
                console.log("Error saving password");
            });
            AsyncStorage.setItem('uid', auth.currentUser.uid).catch(() => {
                console.log("Error saving uid");
            });

            //register notification
            NotificationHandler.registerForPushNotificationsAsync().then(token => {
                const uid = auth.currentUser.uid; 
                //store token on firestore database for notification
                db.collection('users').doc(uid).set({
                    notifitoken: token
                }, {merge: true});
            });
            console.log("replacing....");
            navigation.replace('AppTabs');
        } catch (error) {
            seterrMsg(error.message);
        }
    }

    //Auto login if logged in once
    async function checkCredentials() {
        const username = await AsyncStorage.getItem('username');
        const password = await AsyncStorage.getItem('password');
        if (username != null && password != null){
            await Login(username, password);
        }
    }

    //Show the expo white splash screen while checking credentials
    if (!isReady) {
        return (
            <AppLoading
                startAsync={checkCredentials}
                onFinish={() => {setIsReady(true);}}
                onError={() => console.log("error")}
                />
        )
    };

    return (
        <View style = {styles.Container}>
            <Image 
                source = {require('../../assets/logo.png')}
                style = {styles.FireImages}
            />
            <Text style = {styles.FireFont}>Fire Alarm</Text>
            <Text style= {styles.normalText}>Email</Text>
            <View style={styles.InputBox}>
                <TextInput 
                    style = {styles.Input}
                    onChangeText={(val) => setUsername(val)}
                />
            </View>
            <Text style= {{...styles.normalText, marginTop: 5}}>Password</Text>
            <View style ={styles.InputBox}>
                <TextInput 
                    style = {styles.Input}
                    onChangeText={(val) => setPassword(val)}
                    secureTextEntry={secure}
                />
                <Icon 
                    name={secure === true ? 'eye-off' : 'eye'}
                    size = {25}
                    color = '#A35709'
                    onPress={()=>{
                        secure === true ? setSecure(false) : setSecure(true)
                    }}
                />      
            </View>
            {
                errMsg === null ? null: <Animatable.View animation = 'fadeInLeft' duration={500}>
                    <Text style={styles.errMsg}>{errMsg}</Text>
                </Animatable.View> 
            }

            <TouchableOpacity style = {{...styles.btn, backgroundColor: '#A35709', marginTop: 20}} onPress = { () => {Login(Username, Password);} }>
                <Text style={{...styles.btnText, color: '#F2F2F2'}}>
                    SIGN IN
                </Text>
            </TouchableOpacity> 
    
            <View style={{flexDirection: 'row', alignItems: 'center', width: Dimensions.get('window').width*0.7, marginTop: 15}}>
                <View style={{flex: 1, height: 1, backgroundColor: '#F2F2F2'}} />
                <View>
                    <Text style={{width: 50, textAlign: 'center', fontSize: 20, color: 'white',}}>OR</Text>
                </View>
                <View style={{flex: 1, height: 1, backgroundColor: '#F2F2F2'}} />
            </View>

            <TouchableOpacity 
                style = {{...styles.btn, backgroundColor: '#F2F2F2', marginTop: 15}}
                onPress={()=>{
                    navigation.navigate('Register')
                }}
            >
                <Text style={{...styles.btnText, color: '#A35709'}}>SIGN UP</Text>
            </TouchableOpacity> 
            
            <Text style={{
                marginTop: 15,
                color: '#A35709',
                fontSize: 15,
            }}>Forgot your password?</Text>

            <View style={{
                flex: 1,
                alignSelf: 'flex-end',
                justifyContent: 'flex-end',
                marginBottom: 10,
            }}>
                <Text style ={{
                    color: '#A35709',
                    textAlign: 'right',
                }}>
                    Contact us on
                </Text>
            </View>

        </View>
    )

}

export default LoginScreen

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#1B1A17',
        alignItems: 'center',
    },
    FireImages: {
        height: 111,
        width: 111,
        resizeMode: 'contain',
        marginTop: 100,
        aspectRatio: 2,
    },
    FireFont: {
        marginTop: 10,
        color: '#A35709',
        fontSize: 24,
        fontWeight: 'bold',
    },

    normalText: {
        marginTop: 50,
        padding: 5,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#A35709',
        alignSelf: 'flex-start',
        marginLeft: 35, 
    },

    Input: {
        paddingLeft: 20,
        height: 45,
        flex: 0.95,
    },

    InputBox: {
        flexDirection: 'row', 
        width: Dimensions.get('window').width*0.85,
        height: 50,
        borderWidth: 1,
        borderColor: '#A35709',
        alignItems: 'center',
        backgroundColor: '#F2F2F2',
        borderRadius: 50/4,
    },

    btn: {
        width: Dimensions.get('window').width*0.85,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 150/4,
        borderWidth: 1,
        borderColor: '#A35709',
    },

    btnText: {
        fontSize: 20,
        fontWeight: 'bold'
    },

    errMsg : {
        marginTop: 10,
        marginHorizontal: 30,
        textAlign: 'center',
        fontSize: 15,
        color: 'red',
    }
})

