import React from 'react';

import { createStackNavigator } from "@react-navigation/stack";
import { View } from 'react-native';
import LoginScreen from '../screens/Login';
import SignupScreen from '../screens/Signup';


const AuthStack = () => {
    const Stack = createStackNavigator();
    return (
        <Stack.Navigator initialRouteName= 'Login'>
            <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}}/>
            <Stack.Screen name="Register" component={SignupScreen} options={{headerShown: false}}/>
        </Stack.Navigator>
    )
}

export default AuthStack;