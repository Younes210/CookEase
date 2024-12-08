import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { MEAL_FILTERS } from "../../Data";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import { API_ID, API_KEY } from "../AppKey";
import Icon from "react-native-vector-icons/Ionicons";
import { auth } from "../../firebase/Firebasee";
import { signOut } from "firebase/auth";
import { CommonActions } from "@react-navigation/native";


const AnimatedBtn = Animatable.createAnimatableComponent(TouchableOpacity);

const Home = () => {
  const navigation = useNavigation();
  const [recipes, setRecipes] = useState([]);
  const [recipeOfTheDay, setRecipeOfTheDay] = useState(null);
  const [loadingRecipeOfTheDay, setLoadingRecipeOfTheDay] = useState(true);

  useEffect(() => {
    const checkUserAuthentication = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigation.navigate("Login");
      }
    };

    checkUserAuthentication();
    getTrendyRecipes();
    fetchRecipeOfTheDay();
  }, []);

  const getTrendyRecipes = () => {
    var myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    myHeaders.append("Accept-Language", "en");

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      `https://api.edamam.com/api/recipes/v2?type=public&q=food&app_id=${API_ID}&app_key=${API_KEY}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        setRecipes(result.hits);
      })
      .catch((error) => console.log("error", error));
  };

  const fetchRecipeOfTheDay = () => {
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(
      `https://api.edamam.com/api/recipes/v2?type=public&q=random&app_id=${API_ID}&app_key=${API_KEY}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        const randomIndex = Math.floor(Math.random() * result.hits.length);
        setRecipeOfTheDay(result.hits[randomIndex]);
        setLoadingRecipeOfTheDay(false);
      })
      .catch((error) => {
        console.log("Erreur lors du chargement de la recette du jour :", error);
        setLoadingRecipeOfTheDay(false);
      });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
    } catch (error) {
      console.error("Erreur de déconnexion : ", error);
      Alert.alert("Erreur", "Erreur lors de la déconnexion.");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 270 }}
    >
      <StatusBar barStyle={"light-content"} />
      <View style={styles.topView}>
        <Animatable.Image
          animation={"slideInUp"}
          source={require("../image/cooking.jpg")}
          style={styles.banner}
        />
        <View style={styles.tranparentView}>
          <View style={styles.header}>
            <Animatable.Text animation={"slideInUp"} style={styles.logo}>
              CookEase
            </Animatable.Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Favorites")}
                style={styles.favoritesButton}
              >
                <Icon name="heart-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.logoutButton}
              >
                <Icon name="log-out-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <AnimatedBtn
            animation={"slideInUp"}
            activeOpacity={0.8}
            style={styles.searchBox}
            onPress={() => {
              navigation.navigate("Search");
            }}
          >
            <Image
              source={require("../image/search1.png")}
              style={styles.search}
            />
            <Text style={styles.placeholder}>Rechercher...</Text>
          </AnimatedBtn>
          <Animatable.Text animation={"slideInUp"} style={styles.note}>
            + de 1000 recettes faciles à faire en un clic
          </Animatable.Text>
        </View>
      </View>

      {/* Recette du jour */}
      <View>
        <Animatable.Text animation={"slideInUp"} style={styles.heading}>
          Recette du jour
        </Animatable.Text>
        {loadingRecipeOfTheDay ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : recipeOfTheDay ? (
          <TouchableOpacity
            style={styles.recipeOfTheDayContainer}
            onPress={() => {
              navigation.navigate("Details", {
                data: recipeOfTheDay,
              });
            }}
          >
            <Image
              source={{ uri: recipeOfTheDay.recipe.image }}
              style={styles.recipeOfTheDayImage}
            />
            <Text style={styles.recipeOfTheDayLabel}>
              {recipeOfTheDay.recipe.label}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text>Impossible de charger la recette du jour.</Text>
        )}
      </View>

      {/* Catégories */}
      <Animatable.Text animation={"slideInUp"} style={styles.heading}>
        Catégories
      </Animatable.Text>
      <View>
        <FlatList
          horizontal
          data={MEAL_FILTERS}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <AnimatedBtn
              onPress={() => {
                navigation.navigate("RecipeByCategory", {
                  data: item.title,
                });
              }}
              animation={"slideInUp"}
              activeOpacity={0.8}
              style={styles.categoryItem}
            >
              <View style={styles.card}>
                <Image source={item.icon} style={styles.categoryIco} />
              </View>
              <Text style={styles.category}>{item.title}</Text>
            </AnimatedBtn>
          )}
        />
      </View>

      {/* Recettes en tendance */}
      <Animatable.Text animation={"slideInUp"} style={styles.heading}>
        Recettes en tendance
      </Animatable.Text>
      <View>
        <FlatList
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ marginTop: 20, paddingBottom: 100 }}
          horizontal
          data={recipes}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.recipeItem}
              onPress={() => {
                navigation.navigate("Details", {
                  data: item,
                });
              }}
            >
              <Image
                source={{ uri: item.recipe.image }}
                style={styles.recipeImage}
              />
              <View style={[styles.tranparentView, { borderRadius: 15 }]}>
                <Text style={styles.recipeLabel}>{item.recipe.label}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topView: {
    width: "100%",
    height: "40%",
  },
  banner: {
    width: "100%",
    height: "100%",
  },
  tranparentView: {
    width: "100%",
    height: "100%",
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  favoritesButton: {
    padding: 10,
    marginRight: 10,
  },
  logoutButton: {
    padding: 10,
  },
  searchBox: {
    width: "90%",
    height: 60,
    backgroundColor: "white",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    marginTop: 50,
    alignSelf: "center",
  },
  search: {
    width: 30,
    height: 30,
  },
  placeholder: {
    marginLeft: 15,
    fontSize: 16,
    color: "#9e9e9e",
  },
  logo: {
    fontSize: 40,
    color: "white",
  },
  note: {
    fontSize: 18,
    color: "white",
    width: "90%",
    alignSelf: "center",
    textAlign: "center",
    fontWeight: "600",
    marginTop: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "600",
    marginLeft: 20,
    marginTop: 20,
  },
  recipeOfTheDayContainer: {
    marginVertical: 10,
    alignItems: "center",
  },
  recipeOfTheDayImage: {
    width: "90%",
    height: 200,
    borderRadius: 15,
  },
  recipeOfTheDayLabel: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  categoryItem: {
    width: 120,
    height: 120,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "80%",
    height: "70%",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  categoryIco: {
    width: 50,
    height: 50,
  },
  category: {
    fontSize: 18,
    fontWeight: "600",
    alignSelf: "center",
    marginTop: 10,
  },
  recipeItem: {
    width: 180,
    height: 220,
    marginLeft: 20,
    borderRadius: 15,
  },
  recipeImage: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  recipeLabel: {
    color: "white",
    fontSize: 18,
    width: "90%",
    fontWeight: "600",
  },
});
