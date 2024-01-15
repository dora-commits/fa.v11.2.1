import React from 'react';

import { createStackNavigator } from "@react-navigation/stack";
import AppInfoScreen from "../screens/AppInfo"
import SafetyTipsScreen from "../screens/SafetyTips"
import UserManualScreen from "../screens/UserManual"

const AboutStack = () => {
    const Stack = createStackNavigator();
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#1B1A17',
                    shadowColor: '#000000',
                    elevation: 20,
                },
                headerTintColor: '#F0E3CA',
            }}
        >
            <Stack.Screen name="AppInfo" component={AppInfoScreen}/>
            <Stack.Screen name="SafetyTips" component={SafetyTipsScreen}/>
            <Stack.Screen name="UserManualScreen" component={UserManualScreen} />
        </Stack.Navigator>
    )
}

export default AboutStack;