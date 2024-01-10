//import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import AppBottomTabs from "./src/navigations/AppBottomTabs";
import AuthStack from './src/navigations/AuthStack';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import Warning from './src/screens/Warning';

export default function App() {
  const Stack = createStackNavigator()
  StatusBar.setBarStyle('light-content');
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Authentication'>
        <Stack.Screen name='Authentication' component={AuthStack} options={{ headerShown: false }} />
        <Stack.Screen name='AppTabs' component={AppBottomTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Warning" component={Warning} options={{ headerShown: false}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// How to use MQTT

// import React, { useEffect, Component } from 'react';
// import { View, Button } from 'react-native';
// import MQTTConnection from './src/connections/MQTTConnection';

// export default function App() {
//   useEffect(() => {
//     const mqtt = new MQTTConnection('io.adafruit.com', 80, 'KaL844/feeds/iot-test');
//     return () => {

//     }
//   }, [])

//   return (
//     <View style={{flex: 1, justifyContent: 'center'}}>
//       <Button onPress={() => {mqtt.sendMessage('KaL844/feeds/iot-test','Test Server');}} title="Me"/>
//       <Button onPress={() => {mqtt.unsubscribeChannel('KaL844/feeds/iot-test')}} title="Ola"/>
//     </View>
//   )
// }
