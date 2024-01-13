import React, { useState } from 'react';
import * as Animatable from 'react-native-animatable';
import { StyleSheet, Text, View, TextInput, Image, Button, Dimensions, Alert } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from "react-native-vector-icons/Ionicons";
import FirebaseConnection from '../connections/FirebaseConnection';
import defaultAvatar from '../../assets/users/unknown.png';

const db = new FirebaseConnection().db;
const auth = new FirebaseConnection().auth;

const SignupScreen = ({ navigation }) => {
    const [name, setName] = useState("");
    const [password, setPassword] = useState(null);
    const [secure, setSecure] = useState(true);
    const [confirmPassword, setConfirmPassword] = useState(null);
    const [confirmSecure, setconfirmSecure] = useState(true);
    const [email, setEmail] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState("");

    async function Signup() {
        if (!email || email == "") {
            Alert.alert('Email required!')
            return
        }
        else if (!password || password == "") {
            Alert.alert('Password required!')
            return
        }
        else if (!confirmPassword || confirmPassword == "") {
            Alert.alert('Confirm Password required!')
            return
        }
        else if (confirmPassword != password) {
            Alert.alert('Passwords mismatch')
            return
        }

        auth.createUserWithEmailAndPassword(email, password).then((user) => {
            Alert.alert('Account create successfully');
            db.collection('users').doc(user.user.uid).set({
                email: email,
                manager: false,
                name: name,
                phone: phoneNumber,
                photoURL: Image.resolveAssetSource(defaultAvatar).uri,
                createdAt: new Date(),
                status: "Not In Range",
            });
            navigation.navigate('Login');
        }).catch((error) => {
            Alert.alert(
                'Sign Up Error',
                error.message
            );
        })
    }

    return (
        <View style={styles.Container}>
            <Image source={require('../../assets/logo.png')}
                style={styles.FireImages} />
            <View>
                <Text style={styles.FireFont}>Fire Alarm</Text>
            </View>

            <View style={{
                alignSelf: 'flex-start',
                marginLeft: 14,
                marginTop: 10,
            }}>
                <Text style={{
                    textAlign: 'left',
                    fontSize: 25,
                    color: '#A35709',
                    fontWeight: 'bold',
                }}>
                    SIGN UP
                </Text>
            </View>

            <View style={{
                marginLeft: 15,
                borderBottomColor: '#A35709',
                borderBottomWidth: 1,
                alignSelf: 'flex-start',
                width: 220,
            }}>
            </View>

            <Text style={{ ...styles.normalText, marginTop: 5 }}>Name</Text>
            <View style={styles.InputBox}>
                <TextInput
                    style={styles.Input}
                    onChangeText={(val) => setName(val)}
                />
            </View>

            <Text style={styles.normalText}>Email</Text>
            <View style={styles.InputBox}>
                <TextInput
                    style={styles.Input}
                    onChangeText={(val) => setEmail(val)}
                />
            </View>

            <Text style={styles.normalText}>Phone Number</Text>
            <View style={styles.InputBox}>
                <TextInput
                    style={styles.Input}
                    onChangeText={(val) => setPhoneNumber(val)}
                />
            </View>

            <Text style={styles.normalText}>Password</Text>
            <View style={styles.InputBox}>
                <TextInput
                    style={styles.Input}
                    onChangeText={(val) => setPassword(val)}
                    secureTextEntry={secure}
                />
                <Icon
                    name={secure === true ? 'eye-off' : 'eye'}
                    size={25}
                    color='#A35709'
                    onPress={() => {
                        secure === true ? setSecure(false) : setSecure(true)
                    }}
                />
            </View>


            <Text style={styles.normalText}>Confirm Password</Text>
            <View style={styles.InputBox}>
                <TextInput
                    style={styles.Input}
                    onChangeText={(val) => setConfirmPassword(val)}
                    secureTextEntry={confirmSecure}
                />
                <Icon
                    name={confirmSecure === true ? 'eye-off' : 'eye'}
                    size={25}
                    color='#A35709'
                    onPress={() => {
                        confirmSecure === true ? setconfirmSecure(false) : setconfirmSecure(true)
                    }}
                />
            </View>

            <Text style={{
                marginTop: 10,
                color: '#f2f2f2',
            }}>
                Clicking sign up means you agree with our terms
            </Text>


            <TouchableOpacity style={{ ...styles.btn, backgroundColor: '#A35709', marginTop: 10 }} onPress={() => { Signup() }}>
                <Text style={{ ...styles.btnText, color: '#F2F2F2' }}>SIGN UP</Text>
            </TouchableOpacity>


        </View>
    )
}

export default SignupScreen

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
        marginTop: 30,
        aspectRatio: 2,
    },
    FireFont: {
        marginTop: 10,
        color: '#A35709',
        fontSize: 24,
        fontWeight: 'bold',
    },

    normalText: {
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
        width: Dimensions.get('window').width * 0.85,
        height: 50,
        borderWidth: 1,
        borderColor: '#A35709',
        alignItems: 'center',
        backgroundColor: '#F2F2F2',
        borderRadius: 50 / 4,
    },

    btn: {
        width: Dimensions.get('window').width * 0.85,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 150 / 4,
        borderWidth: 1,
        borderColor: '#A35709',
    },

    btnText: {
        fontSize: 20,
        fontWeight: 'bold'
    }
})

