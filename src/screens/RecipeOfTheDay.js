import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ref as dbRef, get, set } from "firebase/database";
import { database } from "../../firebase/Firebasee";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RecipeOfTheDay = () => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecipeOfTheDay = async () => {
      setLoading(true);

      try {
        const currentDate = await fetchCurrentDate();

        // Vérification du cache local
        const cachedData = await loadFromLocal();
        if (cachedData) {
          const { recipe: cachedRecipe, date: cachedDate } = cachedData;
          if (cachedDate === currentDate) {
            console.log("Utilisation de la recette en cache.");
            setRecipe(cachedRecipe);
            setLoading(false);
            return;
          }
        }

        // Vérification ou génération de la recette depuis Firebase
        const recipeOfTheDay = await fetchRecipeOfTheDay(currentDate);
        if (recipeOfTheDay) {
          console.log("Nouvelle recette chargée ou récupérée depuis Firebase.");
          setRecipe(recipeOfTheDay);

          // Sauvegarde dans le cache local
          await saveToLocal({ recipe: recipeOfTheDay, date: currentDate });
        } else {
          console.log("Aucune recette trouvée.");
        }
      } catch (error) {
        Alert.alert("Erreur", "Impossible de charger la recette du jour.");
        console.error("Erreur lors du chargement de la recette :", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecipeOfTheDay();
  }, []);

  const fetchRecipeOfTheDay = async (currentDate) => {
    try {
      const recipeOfTheDayRef = dbRef(database, `recipeOfTheDay`);
      const snapshot = await get(recipeOfTheDayRef);

      if (snapshot.exists()) {
        const data = snapshot.val();

        // Si une recette existe pour aujourd'hui, on l'utilise
        if (data.date === currentDate) {
          console.log("Recette du jour trouvée dans Firebase :", data.recipe);
          return data.recipe;
        }
      }

      // Sinon, générer une nouvelle recette
      console.log("Aucune recette valide trouvée, génération d'une nouvelle recette.");
      const recipesRef = dbRef(database, "recipes");
      const recipesSnapshot = await get(recipesRef);

      if (recipesSnapshot.exists()) {
        const recipes = Object.values(recipesSnapshot.val());

        if (recipes.length === 0) return null;

        const randomIndex = todayHash(currentDate) % recipes.length;
        const selectedRecipe = recipes[randomIndex];

        // Sauvegarder la nouvelle recette du jour dans Firebase
        await set(recipeOfTheDayRef, {
          date: currentDate,
          recipe: selectedRecipe,
        });

        return selectedRecipe;
      } else {
        console.log("Aucune recette disponible dans la base de données.");
        return null;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la recette du jour :", error);
      return null;
    }
  };

  const fetchCurrentDate = async () => {
    try {
      const serverTimeRef = dbRef(database, ".info/serverTimeOffset");
      const offsetSnapshot = await get(serverTimeRef);
      const offset = offsetSnapshot.val() || 0;
      const serverDate = new Date(Date.now() + offset);
      return serverDate.toISOString().split("T")[0]; // Format : YYYY-MM-DD
    } catch (error) {
      console.error("Erreur lors de la récupération de la date actuelle :", error);
      return new Date().toISOString().split("T")[0];
    }
  };

  const todayHash = (dateString) => {
    return dateString
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  };

  const saveToLocal = async (data) => {
    try {
      await AsyncStorage.setItem("recipeOfTheDay", JSON.stringify(data));
      console.log("Recette sauvegardée dans le cache local.");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde locale :", error);
    }
  };

  const loadFromLocal = async () => {
    try {
      const storedData = await AsyncStorage.getItem("recipeOfTheDay");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log("Recette chargée depuis le cache local.");
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error("Erreur lors du chargement local :", error);
      return null;
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!recipe) {
    return (
      <Text style={styles.error}>Aucune recette du jour n'a été trouvée.</Text>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: recipe.image }} style={styles.image} />
      <Text style={styles.title}>{recipe.label}</Text>
      <Text style={styles.details}>Source: {recipe.source}</Text>
      <Text style={styles.details}>
        Calories: {Math.floor(recipe.calories)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  image: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  details: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 4,
  },
  error: {
    fontSize: 16,
    textAlign: "center",
    color: "red",
  },
});

export default RecipeOfTheDay;
