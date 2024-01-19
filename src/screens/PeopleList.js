import React, { useState, useEffect, useRef } from 'react';

import { LogBox,StyleSheet, Text, View,SafeAreaView, Dimensions, ImageBackground } from 'react-native';
import { VictoryPie } from "victory-native";
import { TouchableOpacity, FlatList } from 'react-native-gesture-handler';
import ProgressCircle from 'react-native-progress-circle'
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { setStatusBarStyle } from 'expo-status-bar';
import Card from '../components/Card';
import { AntDesign } from '@expo/vector-icons';
import { Avatar } from 'react-native-paper';
import firebase from 'firebase/app';
import 'firebase/firestore';
import FirebaseConnection from '../connections/FirebaseConnection';

const listTab = [
    {
        status: 'Safe'
    },
    {
        status: 'In Danger'
    },
    {
        status: 'Unknown'
    },
]
  
const db = new FirebaseConnection().db;

LogBox.ignoreLogs(["Setting a timer for a long period of time"]);

const PeopleList = () => {
    const [status, setStatus] = useState('Safe');
    const listperson = useRef([]);
    const observer = useRef();

    const [dataList, setDataList] = useState(listperson.current);

    const setStatusFilter = status => {
        if (status) {
            setDataList([...listperson.current.filter(e => e._status === status)])
            setStatus(status)
        } else {
            let newStatus;
            setStatus(oldStatus => { //get the old status for filter
                newStatus = oldStatus;
                return oldStatus;
            })
            setDataList([...listperson.current.filter(e => e._status === newStatus)])
        }
        
    }

    async function fetchDataFromDatabase() {
        const listPeopleData = db.collection("users");
        observer.current = listPeopleData.onSnapshot(querySnapshot => {
            console.log("Downloading the collection in people list")
            var lpeople = [];
            var docs = [];
            querySnapshot.forEach((doc) => {
                docs.push(doc);
            })
    
            docs.map((doc) => {
                        let person = {
                            id: doc.id,
                            name: doc.data().name,
                            phone:doc.data().phone,
                            email: doc.data().email,
                            uri: doc.data().photoURL,
                            _status:doc.data().status,
                            status: true,
                            data: {
                            },
                        }
                    lpeople.push(person);
                }
            )
            listperson.current = lpeople
            setStatusFilter()
        })
    }
    
    useEffect(() => {
        fetchDataFromDatabase().then(() => {
//            listperson.current = lpeople;
            setStatusFilter("Safe");
        })
        return () => {
        console.log("Clean up called !");
        observer.current();
        }
    }, []);

    const data_check = listperson.current.filter(device => device._status === 'Safe'),numOfEOK = data_check.length;
    const sum_inrange = listperson.current.filter(person => person._status !== "Not In Range").length;

    const renderItem = ({item, index}) => {
        return (
            <View key={index}>
                <Text>{item._status}</Text>
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <View style={styles.chartContainer}>
                <ImageBackground 
                    source={require('../../assets/adaptive-icon.png')}
                    style={{ 
                        flex: 1,
                        width: '100%',
                        height: null,
                        marginLeft:50,
                        marginRight:50,
                        resizeMode: "cover",
                    }}
                >
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ProgressCircle
                            percent={Number(((numOfEOK/sum_inrange)*100).toFixed(2))}
                            radius={100}
                            borderWidth={10}
                            color="#A35709"
                            shadowColor="#fff"
                            bgColor="#000"
                    >
                        <MaterialCommunityIcons name="account-circle" size={50} color="#A35709" /> 
                        <Text style={{color:'#fff'}}> {sum_inrange ? Number(((numOfEOK/sum_inrange)*100).toFixed(2)) + "% Users [SAFE]" : "No user"}</Text>
                    </ProgressCircle>
                </View>
                </ImageBackground>
            </View>
            <View>
                <View style={styles.listTab}>
                    { listTab.map(e => (
                        <TouchableOpacity key={e.status} style={[styles.btnTab, status === e.status && styles.btnTabActive]} onPress={() => setStatusFilter(e.status)}>
                            <Text style={[styles.tabText, status === e.status && styles.textTabActive]}>{e.status}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.datalist}>
                    <FlatList
                        style={styles.listBlock}
                        keyExtractor={(item, index) => item.id}
                        data={dataList}
                        renderItem={itemData => (
                            <Card name={itemData.item.name} detail={itemData.item.phone}>
                                <Avatar.Image source={{uri : itemData.item.uri}} size={50} />
                            </Card>
                        )}
                    />
                </View>
            </View>
        </View>
    );
}

export default PeopleList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1B1A17',
        alignItems: 'center',
    },

    chartContainer: {
        height: '40%',
        width:'100%',
        marginTop: 0,
        marginBottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
      },

    listTab: {
        backgroundColor: '#1B1A17',
        flexDirection: 'row',
        alignSelf: 'center',
        marginBottom: 3
    },

    btnTab: {
        width: Dimensions.get('window').width/3.2,
        flexDirection: 'row',
        padding: 10,
        marginHorizontal: 2,
        justifyContent: 'center',
        borderColor: '#000000',
        borderWidth: 2
    },

    tabText: {
        fontSize: 16,
        color: '#f2f2f2'
    }, 

    btnTabActive: {
        borderWidth: 1,
        borderColor: '#FF8303',
    },

    textTabActive: {
        color: '#FF8303',
        fontWeight: 'bold'
    },

    datalist: {
        marginHorizontal: 3
    },

    listBlock: {
        marginHorizontal: 10,
        marginBottom: 10,
        height: Dimensions.get('window').height * 0.5
    }

});
  
