import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TextInput, Dimensions } from 'react-native';
import { Avatar, Caption } from 'react-native-paper';
import { SimpleLineIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import BottomSheet from 'reanimated-bottom-sheet';
import Animated from 'react-native-reanimated';
import FirebaseConnection from '../connections/FirebaseConnection';
import * as ImagePicker from 'expo-image-picker';

const db = new FirebaseConnection().db;
const auth = new FirebaseConnection().auth;

async function fetchUserInfoFromDB(uid) {
    const userDoc = db.collection("users").doc(uid);
    const userData = await userDoc.get();
    return userData.data();
}
const EditUserInfoScreen = ({ navigation }) => {
    const uid = auth.currentUser.uid;
    const [userInfo, setUserInfo] = useState(null);
    const [newName, setNewName] = useState(null);
    const [email, setEmail] = useState(null);
    const [newPhoneNumber, setNewPhoneNumber] = useState(null);
    const [image, setImage] = useState(null);
    const bs = React.createRef();
    const fall = new Animated.Value(1);

    useEffect(() => {
        fetchUserInfoFromDB(uid).then((uData) => {
            setUserInfo(uData);
            setNewName(uData.name);
            setEmail(uData.email);
            setNewPhoneNumber(uData.phone);
            setImage(uData.photoURL);
        });
    }, []);

    const choosePhotoFromLibrary = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need media library permissions to make this work!');
            }
        }
        ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        }).then(result => {
            if (!result.cancelled) {
                setImage(result.uri);
            }
        });
    };

    const takePhotoFromCamera = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera permissions to make this work!');
            }
        }
        ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        }).then(result => {
            if (!result.cancelled) {
                setImage(result.uri);
            }
        });
    };

    const renderInner = () => (
        <View style={styles.panel}>
            <View style={{ alignItems: 'center' }}>
                <Text style={styles.panelTitle}>Upload Photo</Text>
            </View>
            <TouchableOpacity style={[styles.panelBtn, { backgroundColor: '#fff' }]} onPress={takePhotoFromCamera}>
                <Text style={[styles.panelBtnText, { color: '#ff8303' }]}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.panelBtn, { backgroundColor: '#fff' }]} onPress={choosePhotoFromLibrary}>
                <Text style={[styles.panelBtnText, { color: '#ff8303' }]}>Choose From Library</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.panelBtn, { backgroundColor: '#f2f2f2' }]} onPress={() => bs.current.snapTo(1)}>
                <Text style={[styles.panelBtnText, { color: '#828282' }]}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.panelHeader}>
                <View style={styles.panelHandler}></View>
            </View>
        </View>
    );

    const handleSubmitInfo = () => {
        db.collection("users").doc(uid).update({
            name: newName,
            phone: newPhoneNumber,
            photoURL: image
        })
            .then(() => navigation.replace('Info'))
            .catch((error) => {
                console.log(error);
            });
    }

    return (
        <View style={styles.container}>
            <BottomSheet
                ref={bs}
                snapPoints={[220, 0]}
                renderContent={renderInner}
                renderHeader={renderHeader}
                initialSnap={1}
                callbackNode={fall}
                enabledGestureInteraction={true}
            />
            <View style={{ margin: 20 }}>
                <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => bs.current.snapTo(0)}>
                        <View style={styles.image}>
                            <ImageBackground
                                source={{ uri: image }}
                                style={{ height: 150, width: 150 }}
                                imageStyle={{ borderRadius: 15 }}
                            >
                                <View>
                                    <SimpleLineIcons name="camera" size={30} color="#fff"
                                        style={{
                                            opacity: 0.7,
                                            alignSelf: 'flex-end',
                                            marginRight: 5
                                        }} />
                                </View>
                            </ImageBackground>
                        </View>
                    </TouchableOpacity>
                    <Caption style={{ color: '#fff' }}>
                        {email}
                    </Caption>
                </View>
                <View style={{ marginTop: 20 }}>
                    <View style={styles.action}>
                        <SimpleLineIcons name="user" color="#ff8303" size={20} style={{ alignSelf: 'center' }} />
                        {newName != null &&
                            <TextInput
                                placeholder="Name"
                                placeholderTextColor="#828282"
                                value={newName}
                                onChangeText={(name) => { setNewName(name) }}
                                autoCorrect={false}
                                style={{ paddingLeft: 10, color: '#fff', flex: 1 }}
                            />
                        }
                    </View>
                    <View style={styles.action}>
                        <SimpleLineIcons name="envelope" color="#ff8303" size={20} style={{ alignSelf: 'center' }} />
                        {email != null &&
                            <TextInput
                                value={email}
                                autoCorrect={false}
                                style={{ paddingLeft: 10, color: '#fff', flex: 0.8 }}
                                editable={false}
                            />
                        }
                        {email != null &&
                            <Text style={{ flex: 0.4, color: '#828282', alignSelf: 'center', fontStyle: 'italic' }}>
                                (do not change)
                        </Text>
                        }
                    </View>
                    <View style={styles.action}>
                        <SimpleLineIcons name="phone" color="#ff8303" size={20} style={{ alignSelf: 'center' }} />
                        {newPhoneNumber != null &&
                            <TextInput
                                placeholder="Phone Number"
                                placeholderTextColor="#828282"
                                value={newPhoneNumber}
                                onChangeText={(phoneNumber) => setNewPhoneNumber(phoneNumber)}
                                autoCorrect={false}
                                style={{ paddingLeft: 10, color: '#fff', flex: 1 }}
                            />
                        }
                    </View>
                    <View style={{ marginTop: 30 }}>
                        <TouchableOpacity onPress={handleSubmitInfo} style={styles.submit}>
                            <Text style={styles.submitText}>Submit</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1B1A17'
    },
    image: {
        height: 150,
        width: 150,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textInput: {
        flex: 1,
        paddingLeft: 10,
        color: "#fff"
    },
    action: {
        flexDirection: 'row',
        marginVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5
    },
    submitText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff'
    },
    submit: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#ff8303',
        alignItems: 'center',
        marginVertical: 5
    },
    panel: {
        backgroundColor: 'rgba(255, 154, 21, 0.8)',
        height: 220,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 10
    },
    panelTitle: {
        color: '#fff',
        fontSize: 18,
        marginTop: 15,
        marginBottom: 15,
    },

    panelBtn: {
        padding: 5,
        alignItems: 'center',
        borderRadius: 5,
        marginHorizontal: 10,
        marginVertical: 8,
    },

    panelBtnText: {
        fontSize: 17,
        fontWeight: 'bold',
    },
    header: {
        backgroundColor: 'white',
    },

    panelHeader: {
        backgroundColor: 'white',
    },

    panelHandler: {
        backgroundColor: 'white'
    },

})

export default EditUserInfoScreen;