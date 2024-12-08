
import { View, Text, StyleSheet, Image, Button } from "react-native";
import React, { useState } from "react";
import { useRoute } from "@react-navigation/native";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import * as Animatable from "react-native-animatable";
import RecipePhotos from './RecipePhotos'; // Import RecipePhotos component

const Details = () => {
  const route = useRoute();
  const [selectedTab, setSelectedTab] = useState(0);

  // Extract the recipe from route params
  const { recipe } = route.params.data;

  // Extract the URI of the recipe and log it for verification
  const recipeUri = recipe ? recipe.uri : null;
  if (!recipeUri) {
    console.error("Erreur : URI de la recette manquant");
    return <Text>Erreur : URI de recette manquant</Text>;
  }

  const renderHeader = () => (
    <View>
      <Animatable.Image
        source={{ uri: recipe.image }}
        style={styles.banner}
        animation={"slideInUp"}
      />
      <Animatable.Text animation={"slideInUp"} style={styles.title}>
        {recipe.label}
      </Animatable.Text>
      <Animatable.Text animation={"slideInUp"} style={styles.source}>
        {"added by " + recipe.source}
      </Animatable.Text>
      <Animatable.Text animation={"slideInUp"} style={styles.calories}>
        {"Calorie: "}{" "}
        <Text style={{ color: "orange" }}>
          {Math.floor(recipe.calories)}
        </Text>
      </Animatable.Text>
      <Animatable.Text animation={"slideInUp"} style={styles.calories}>
        {"Total Weight: "}{" "}
        <Text style={{ color: "black" }}>
          {Math.floor(recipe.totalWeight)}
        </Text>
      </Animatable.Text>
      <Animatable.Text animation={"slideInUp"} style={styles.calories}>
        {"Meal Type : "}{" "}
        <Text style={{ color: "green" }}>
          {recipe.mealType[0]}
        </Text>
      </Animatable.Text>

      <FlatList
        data={["Ingredients", "Cuisines", "Dish Type"]}
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

      {/* Add RecipePhotos and pass recipeUri */}
      <RecipePhotos recipeUri={recipeUri} />
    </View>
  );

  return (
    <FlatList
      ListHeaderComponent={renderHeader}
      data={
        selectedTab === 0
          ? recipe.ingredientLines
          : selectedTab === 1
          ? recipe.cuisineType
          : recipe.dishType
      }
      renderItem={({ item }) => (
        <Animatable.View animation={"slideInUp"} style={styles.lables}>
          <Text>{item}</Text>
        </Animatable.View>
      )}
      keyExtractor={(item, index) => index.toString()}
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
