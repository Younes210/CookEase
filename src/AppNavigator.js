import { View, Text } from "react-native";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./screens/Home";
import Search from "./screens/Search";
import Details from "./screens/Details";
import Splash from "./screens/Splash";
import RecipeByCategory from "./screens/RecipeByCategory";
import Login from "./screens/Login";
import RecipeOfTheDay from "./screens/RecipeOfTheDay";
import Favorites from "./screens/Favorites";
const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
      <Stack.Screen
          name="Splash"
          component={Splash}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          
          options={{ headerShown: false,gestureEnabled: false }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
          <Stack.Screen
          name="Search"
          component={Search}
          options={{ headerShown: false }}
        />
          <Stack.Screen
          name="Details"
          component={Details}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RecipeByCategory"
          component={RecipeByCategory}
          options={{ headerShown: false }}
        />
        <Stack.Screen
        name="RecipeOfTheDay"
        component={RecipeOfTheDay}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Favorites"
        component={Favorites}
        options={{ headerShown: false }}
      />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

 