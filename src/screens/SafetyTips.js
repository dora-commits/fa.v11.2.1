import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import { useEffect } from 'react';

const SafetyTipsScreen = ({navigation}) => {
    const textData = [
        {
            key: 1,
            title: "Get out as quickly and as safety as possible",
            content: "The less time you are exposed to poisonous gases, the safer you will be."
        },
        {
            key: 2,
            title: "If you try to use a fire extinguisher on a fire and the fire does not immediately die down, drop the extinguisher and get out.",
            content: " Most portable extinguishers empty in 8 to 10 seconds. After some residential fires, people have been found dead with fire extinguishers near them or in their arms."
        },
        {
            key: 3,
            title: "If you are escaping through a closed door, feel the door, cracks, and doorknob with the back of your hand before opening the door.",
            content: "If it is cool and there is no smoke at the bottom or top, open the door slowly. If you see smoke or fire beyond the door, close it and use your second way out. If the door is warm, use your second way out. It is a natural tendency to automatically use the door, but fire may be right outside. Feeling the door will warn you of possible danger."
        },
        {
            key:4,
            title: "If you see smoke or fire in your first escape route, use your second way out.",
            content: "The less time you are exposed to poisonous gases, the safer you will be."
        },
        {
            key:5,
            title: "If you must exit through smoke, crawl low under the smoke to your exit.",
            content: "Fires produce many poisonous gases. Some are heavy and will sink low to the floor; others will rise carrying soot towards the ceiling. Crawling with your head at a level of 1 to 2 feet above the ground will temporarily provide the best air."
        },
        {
            key:6,
            title: "Close doors behind you as you escape to delay the spread of the fire.",
            content: ""
        },
        {
            key:7,
            title: "If smoke, heat, or flames block your exit routes and you cannot get outside safely, stay in the room with the door closed.",
            content: "Open the window for ventilation, and hang a sheet outside the window so firefighters can find you. Wait by the window for help. The first thing firefighters will do when they arrive at a fire is check for trapped persons. Hanging a sheet out lets them know where to find you. If there is a phone in the room, call the fire department and tell them where you are."
        },
        {
            key:8,
            title: "Once you are out, stay out!",
            content: "Firefighters are trained and equipped to enter burning buildings. If someone is still inside, direct them to that person's probable location."
        },
        {
            key:9,
            title: "Get out first, away from toxic smoke and gases, then call the fire department from a neighbor's home or from an outside phone.",
            content: "If a portable phone is handy during your escape, you may take it with you, but do not waste precious time looking for one. Use your neighbor's phone, a car phone, or nearby pay phone to call for help."
        },
    ]

    useEffect(() => {
        navigation.setOptions({
            title: 'Safety Tips'
        })
    }, [])

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.textContainer}>
                    {textData.map(({title, content, key}) => {
                        return (
                            <View key={key}>
                                <Text style={styles.textTitle}>{key}. {title}</Text>
                                <Text style={styles.textContent}>{content}</Text>
                            </View>
                        );
                        
                    })}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1B1A17',
    },
    textContainer: {
        width: '95%',
        alignSelf: 'center'
    },
    textTitle: {
        fontSize: 20,
        color: '#FF8303',
        marginTop: 20,
        marginBottom: 20,
    },
    textContent: {
        color: '#F0E3CA',
        marginBottom: 40,
    }
});

export default SafetyTipsScreen;