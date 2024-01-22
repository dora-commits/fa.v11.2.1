import React from 'react';

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MapStack from './MapStack';
import HomeStack from './HomeStack';
import UserStack from './UserStack';
import AboutStack from './AboutStack';
import AuthStack from './AuthStack';
import { View } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const AppBottomTabs = () => {
    // const Tabs = createMaterialBottomTabNavigator();
    const Tabs = createBottomTabNavigator();
    return (
        <Tabs.Navigator
            initialRouteName="Home"
            tabBarOptions={{
                activeTintColor: '#FF8303',
                labelStyle: {
                    paddingBottom: 5,
                },
                style: {
                    backgroundColor: "#1B1A17",
                    height: '8.5%',
                    paddingTop: 8,
                }
            }}
        >
            <Tabs.Screen 
                name="Home" 
                component={HomeStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen 
                name="Map" 
                component={MapStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5 name="map-marked-alt" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen 
                name="User" 
                component={UserStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5 name="user" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen 
                name="About" 
                component={AboutStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="ios-information-circle-outline" size={size*1.4} color={color} />
                    ),
                }}
            />
        </Tabs.Navigator>
    )
}

export default AppBottomTabs;