import React from 'react';
import {ScrollView, StyleSheet, Text, View, LogBox} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import DropDownItem from 'react-native-drop-down-item';
import { useEffect } from 'react';

const UserManualScreen = ({navigation}) => {
    const textData = [
        [
            {
                key: 1,
                title: "When will I receive an alarm?",
                content: "Our system will automatically detect if there is a fire near your location and inform it to you, you don't need to worry about this. We define there is a fire when the gas sensor detects gas or the temperature sensor detects a temperature beyond 90 celcius degrees",
            },
            {
                key: 2,
                title: "What is shown on the map?",
                content: "If you're not in the range of a fire, only the location of your building is shown in the map. When there is a fire, your location and the range of the fire will be shown on the map, too.",
            },
            {
                key: 3,
                title: "Confirm your status",
                content: "When we detect a fire, a warning message will be sent to you. After receiving it, please click the button to confirm if you are in danger or not. This will help us a lot in finding people who need help and also help for the data later.",
            },
            {
                key: 4,
                title: "Manually turn on and off devices",
                content: "Only users with manager privillege can use this feature. And with those who can, please only use this when needed. Our system is automatic, so only use this when you really feel that there is no need for the devices to turn on or off at that time. You can do that by Choose Cluster > Choose Device > Turn on/Turn off.",
            },
        ],
        [
            {
                key: 5,
                title: "View the list of people in the fire range",
                content: "When there is a fire, you can click on the marker of the building on the map, the list of people who are safe, in danger or unknow will be shown.",
            },
            {
                key: 6,
                title: "About damanged device",
                content: "This feature will be comming soon",
            },
        ],
        [
            {
                key: 7,
                title: "Our plan in the future",
                content: "Now, our app only apply for one building with limited amount of devices. In the future, we will scale it up to be able to detect fire in a big city with a large amount of devices and users.",
            },
            {
                key: 8,
                title: "Contact us",
                content: "We are a group of students at Bach Khoa Ho Chi Minh University. You can contact us by email: abcd@hcmut.edu.vn or by phone: 0123456789 for more information.",
            },  
        ],
    ]

    useEffect(() => {
        navigation.setOptions({
            title: 'User Manual'
        })
        LogBox.ignoreLogs(['Animated: `useNativeDriver`']);
    }, [])

    return (
        <View style={styles.container}>
            <ScrollView>
                <Text style={styles.title}>What do you want to know about ?</Text>
                {textData.map((texts, index, textData) => {
                    return(
                        <View style={styles.textGroup} key={index}>
                            {texts.map(({key, title, content}, index, texts) => {
                                return (
                                    <React.Fragment key={key}>
                                        <DropDownItem
                                            key={key}
                                            contentVisible={false}
                                            header={
                                                <View>
                                                <Text style={styles.text}>{title}</Text>
                                                </View>
                                            }
                                            visibleImage={{ uri: 'undefined' }}
                                            invisibleImage={{ uri: 'undefined' }}
                                            >
                                            <Text style={styles.text}>
                                                {content}
                                            </Text>
                                        </DropDownItem>
                                        {index != texts.length - 1 && <View style={styles.line}></View>}
                                    </React.Fragment>
                                );
                            })}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

export default UserManualScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1B1A17',
    },
    title: {
        fontSize: 20,
        color: '#FF8303',
        marginTop: 40,
        marginBottom: 20,
        textAlign: 'center'
    },
    textGroup: {
        backgroundColor: '#27271F99',
        borderColor: "#F0E3CA",
        borderWidth: 2,
        borderRadius: 10,
        marginTop: 20,
        marginBottom: 20,
        width: '97%',
        alignSelf: 'center',
    },
    text: {
        fontSize: 18,
        color: '#F0E3CA',
        marginTop: 15,
        marginBottom: 15,
        marginLeft: 10,
    },
    line: {
        borderBottomWidth: 1,
        borderBottomColor: "#F0E3CA99",
        width: '97%',
        alignSelf: 'center'
    }

    
});