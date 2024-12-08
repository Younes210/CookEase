import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import RecipePhotos from "./RecipePhotos"; // Assurez-vous que RecipePhotos.js est dans le même dossier
import { getDatabase, ref, set, remove, onValue } from "firebase/database";
import Icon from "react-native-vector-icons/Ionicons";
import { auth } from "../../firebase/Firebasee";

const Details = () => {
  const route = useRoute();
  const [selectedTab, setSelectedTab] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const recipe = route.params?.data?.recipe;

  if (!recipe) {
    console.error("Données invalides reçues dans le composant Details !");
    return (
      <View style={styles.container}>
        <Text>Impossible d'afficher les détails. Les données sont manquantes.</Text>
      </View>
    );
  }

  const recipeId = recipe.uri.split("_")[1]; // Utilise une partie unique de l'URI comme ID
  const userId = auth.currentUser?.uid;

  const tabOptions = ["Ingredients", "Cuisines", "Type de plat", "Poster une photo"];

  const toggleFavorite = () => {
    const db = getDatabase();
    const favoriteRef = ref(db, `favorites/${userId}/${recipeId}`);

    if (isFavorite) {
      remove(favoriteRef)
        .then(() => setIsFavorite(false))
        .catch((error) =>
          console.error("Erreur lors du retrait des favoris :", error)
        );
    } else {
      set(favoriteRef, true)
        .then(() => setIsFavorite(true))
        .catch((error) =>
          console.error("Erreur lors de l'ajout aux favoris :", error)
        );
    }
  };

  useEffect(() => {
    if (userId) {
      const db = getDatabase();
      const favoriteRef = ref(db, `favorites/${userId}/${recipeId}`);

      onValue(favoriteRef, (snapshot) => {
        setIsFavorite(snapshot.exists());
      });
    }
  }, [recipeId, userId]);

  // Header avec le bouton cœur
  const renderHeader = () => (
    <View>
      <Animatable.Image
        source={{ uri: recipe.image }}
        style={styles.banner}
        animation={"slideInUp"}
      />
      <View style={styles.favoriteContainer}>
        <TouchableOpacity
          onPress={toggleFavorite}
          style={styles.favoriteButton}
        >
          <Icon
            name={isFavorite ? "heart" : "heart-outline"}
            size={30}
            color={isFavorite ? "red" : "gray"}
          />
        </TouchableOpacity>
      </View>
      <Animatable.Text animation={"slideInUp"} style={styles.title}>
        {recipe.label}
      </Animatable.Text>
      <Animatable.Text animation={"slideInUp"} style={styles.source}>
        {"added by " + recipe.source}
      </Animatable.Text>
      <Animatable.Text animation={"slideInUp"} style={styles.calories}>
        {"Calorie: "}
        <Text style={{ color: "orange" }}>
          {Math.floor(recipe.calories)}
        </Text>
      </Animatable.Text>
      <Animatable.Text animation={"slideInUp"} style={styles.calories}>
        {"Total Weight: "}
        <Text style={{ color: "black" }}>
          {Math.floor(recipe.totalWeight)}
        </Text>
      </Animatable.Text>
      <Animatable.Text animation={"slideInUp"} style={styles.calories}>
        {"Meal Type : "}
        <Text style={{ color: "green" }}>
          {recipe.mealType[0]}
        </Text>
      </Animatable.Text>

      <FlatList
        data={tabOptions}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ marginTop: 20 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.typeItem,
              {
                borderWidth: selectedTab === index ? 0 : 0.5,
                marginLeft: index === 0 ? 25 : 10,
                borderColor: "#9e9e9e",
                backgroundColor: selectedTab === index ? "#9e9e9e" : "white",
              },
            ]}
            onPress={() => setSelectedTab(index)}
          >
            <Text style={{ color: selectedTab === index ? "white" : "black" }}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderContent = () => {
    if (selectedTab === 0) {
      return recipe.ingredientLines;
    } else if (selectedTab === 1) {
      return recipe.cuisineType;
    } else if (selectedTab === 2) {
      return recipe.dishType;
    } else if (selectedTab === 3) {
      return (
        <RecipePhotos recipeUri={recipe.uri} /> // Passez `recipeUri` correctement
      );
    }
  };

  return (
    <FlatList
      ListHeaderComponent={renderHeader}
      data={selectedTab !== 3 ? renderContent() : []}
      renderItem={({ item }) =>
        selectedTab !== 3 ? (
          <Animatable.View animation={"slideInUp"} style={styles.lables}>
            <Text>{item}</Text>
          </Animatable.View>
        ) : null
      }
      keyExtractor={(item, index) => index.toString()}
      ListFooterComponent={selectedTab === 3 ? renderContent() : null}
    />
  );
};

export default Details;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  favoriteContainer: {
    alignItems: "center",
    marginTop: -25, // Décale légèrement pour superposer au bas de l'image
    marginBottom: 10,
  },
  favoriteButton: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
    elevation: 5, // Ajoute une ombre pour un effet visuel
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    width: "90%",
    marginTop: 10,
    alignSelf: "center",
  },
  source: {
    marginLeft: 25,
    marginTop: 10,
  },
  typeItem: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 10,
    borderRadius: 8,
  },
  lables: {
    width: "90%",
    alignSelf: "center",
    height: 50,
    borderWidth: 0.5,
    justifyContent: "center",
    marginTop: 10,
    borderColor: "#9e9e9e",
    paddingLeft: 10,
  },
  calories: {
    fontSize: 20,
    color: "black",
    fontWeight: "500",
    marginTop: 20,
    marginLeft: 25,
  },
});
