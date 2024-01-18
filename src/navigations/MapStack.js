import React from 'react';

import { createStackNavigator } from "@react-navigation/stack";
import { View } from 'react-native';
import MapScreen from '../screens/Map';
import PeopleList from '../screens/PeopleList';

const MapStack = () => {
    const Stack = createStackNavigator();
    return (
        <Stack.Navigator>
            <Stack.Screen name="Map" component={MapScreen} options={{headerShown: false}}/>
            <Stack.Screen name="PeopleList" component={PeopleList} options={{headerShown: false}}/>
        </Stack.Navigator>
    )
}

export default MapStack;