import { View, Text, Image, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';

const Splash = () => {
  const navigation = useNavigation();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Login"); // Remplace "Login" au lieu de naviguer
    }, 3000);
    
    return () => clearTimeout(timer); // Nettoyage du timer à la désactivation du composant
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animatable.Image animation={'slideInUp'} source={require('../image/logo.png')} style={styles.logo} />
      <Animatable.Text animation={'slideInUp'} style={styles.appName}>CookEase</Animatable.Text>
      <Animatable.Text animation={'slideInUp'} style={styles.tagLine}>À la recherche des meilleures recettes</Animatable.Text>
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05B681',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  appName: {
    fontSize: 40,
    fontWeight: '600',
    color: 'white',
    marginTop: 10,
  },
  tagLine: {
    position: 'absolute',
    bottom: 50,
    fontWeight: '600',
    color: 'black',
  },
});
