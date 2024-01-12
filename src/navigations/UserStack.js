import React from 'react';

import { createStackNavigator } from "@react-navigation/stack";
import { View } from 'react-native';
import UserInfoScreen from '../screens/UserInfo';
import EditUserInfoScreen from '../screens/EditUserInfo';

const UserStack = () => {
    const Stack = createStackNavigator();
    return (
        <Stack.Navigator>
            <Stack.Screen name="Info" component={UserInfoScreen} options={{ headerShown: false }} />
            <Stack.Screen
                name="EditInfo"
                component={EditUserInfoScreen}
                options={{
                    headerTitle: "",
                    headerStyle: { backgroundColor: '#1B1A17' },
                    headerTintColor: '#fff'
                }} />
        </Stack.Navigator>
    )
}

export default UserStack;