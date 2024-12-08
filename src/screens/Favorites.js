import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from "react-native";
import { getDatabase, ref, onValue } from "firebase/database";
import { auth } from "../../firebase/Firebasee";
import { useNavigation } from "@react-navigation/native";
import { API_ID, API_KEY } from "../AppKey";

const Favorites = () => {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const navigation = useNavigation();
  const userId = auth.currentUser?.uid;

  if (!userId) {
    console.error("Utilisateur non connecté !");
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Veuillez vous connecter pour voir vos favoris.</Text>
      </View>
    );
  }

  useEffect(() => {
    const db = getDatabase();
    const favoriteRef = ref(db, `favorites/${userId}`);

    const unsubscribe = onValue(favoriteRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const recipeIds = Object.keys(data);
        fetchRecipesByIds(recipeIds);
      } else {
        setFavoriteRecipes([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchRecipesByIds = (recipeIds) => {
    const promises = recipeIds.map((id) =>
      fetch(
        `https://api.edamam.com/api/recipes/v2/${id}?type=public&app_id=${API_ID}&app_key=${API_KEY}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.recipe) {
            return {
              recipe: {
                uri: data.recipe.uri,
                label: data.recipe.label,
                image: data.recipe.image,
                ingredientLines: data.recipe.ingredientLines,
                cuisineType: data.recipe.cuisineType,
                dishType: data.recipe.dishType,
                calories: data.recipe.calories,
                totalWeight: data.recipe.totalWeight,
                mealType: data.recipe.mealType,
              },
            };
          } else {
            console.error("Structure inattendue pour la recette :", data);
            return null;
          }
        })
    );

    Promise.all(promises)
      .then((results) => {
        const filteredResults = results.filter((recipe) => recipe !== null);
        setFavoriteRecipes(filteredResults);
      })
      .catch((error) => console.error("Erreur lors du chargement des favoris :", error));
  };

  return (
    <FlatList
      data={favoriteRecipes}
      keyExtractor={(item) => item.recipe.uri}
      ListHeaderComponent={
        <Text style={styles.title}>Vos Recettes Favorites</Text> // Ajoute le titre comme partie défilable
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Details", { data: item })}
          style={styles.recipeItem}
        >
          <Image source={{ uri: item.recipe.image }} style={styles.recipeImage} />
          <Text style={styles.recipeLabel}>{item.recipe.label}</Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  recipeItem: {
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  recipeLabel: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 5,
  },
});

export default Favorites;
