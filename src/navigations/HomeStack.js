import React from 'react';

import { createStackNavigator } from "@react-navigation/stack";
import { View } from 'react-native';
import InputDeviceScreen from '../screens/InputDevice'
import OutputDeviceScreen from '../screens/OutputDevice'
import FullchartScreen from '../screens/Fullchart';
import Home from '../screens/Home';
import ListDevice from '../screens/ListDevice';


const HomeStack = ({navigation}) => {
    const Stack = createStackNavigator();
    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
            <Stack.Screen
                name="FullChart"
                component={FullchartScreen}
                options={({ route }) => {
                    return {
                        headerTitle: "CLUSTER " + route.params.cluster,
                        headerStyle: { backgroundColor: '#1B1A17' },
                        headerTintColor: '#fff'
                    };
                }} />

            <Stack.Screen name="Cluster" component={View} />
            <Stack.Screen
                name="InputDevice"
                component={InputDeviceScreen}
                options={() => {
                    return {
                        headerStyle: { backgroundColor: '#1B1A17' },
                        headerTintColor: '#fff'
                    };
                }} />
            <Stack.Screen
                name="OutputDevice"
                component={OutputDeviceScreen}
                options={() => {
                    return {
                        headerStyle: { backgroundColor: '#1B1A17' },
                        headerTintColor: '#fff'
                    };
                }} />
            <Stack.Screen name="ListDevice" component={ListDevice} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}

export default HomeStack;
