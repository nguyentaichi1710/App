import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import LoginScreen from './screens/LoginScreen';
import CallScreen from './screens/CallScreen';
import UserScreen from './screens/UserScreen';
import MessScreen from './screens/MessageScreen';
import Home from './screens/HomeScreen';
import {SafeAreaView} from 'react-native-safe-area-context';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen name="Call" component={CallScreen} />
        <Stack.Screen name="User" component={UserScreen} />
        <Stack.Screen name="Mess" component={MessScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
