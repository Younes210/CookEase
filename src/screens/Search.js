import { View, Text, StyleSheet, Image, TextInput } from "react-native";
import React, { useState } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import Modal from "react-native-modal";
import { CUISINE_FILTERS, DISH_FILTERS, HEALTH_FILTERS } from "../../Data";
import { API_ID, API_KEY } from "../AppKey";

const Search = () => {
  const [search, setSearch] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigation = useNavigation();

  const [selectedDish, setSelectedDish] = useState("");
  const [selectedCusines, setSelectedCusines] = useState("");
  const [selectedHealth, setSelectedHealth] = useState("");
  const [selectedDiet, setSelectedDiet] = useState("");

  const searchRecipe = () => {
    var myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    myHeaders.append("Accept-Language", "en");

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    let url = "";
    if (selectedCusines == "" && selectedDish == "") {
      url = `https://api.edamam.com/api/recipes/v2?type=public&q=${search}&app_id=${API_ID}&app_key=${API_KEY}`;
    } else if (selectedCusines != "") {
      url = `https://api.edamam.com/api/recipes/v2?type=public&q=${search}&app_id=${API_ID}&app_key=${API_KEY}&cuisineType=${selectedCusines}`;
    } else if (selectedDish != "") {
      url = `https://api.edamam.com/api/recipes/v2?type=public&q=${search}&app_id=${API_ID}&app_key=${API_KEY}&=dishType${selectedDish}`;
    } else if (selectedDish != "" && selectedCusines != "") {
      url = `https://api.edamam.com/api/recipes/v2?type=public&q=${search}&app_id=${API_ID}&app_key=${API_KEY}&=dishType${selectedDish}&cuisineType=${selectedCusines}`;
    }

    fetch(url, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result.hits);
        setRecipes(result.hits);
      })
      .catch((error) => console.log("error", error));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={"dark-content"} />
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => {
          navigation.goBack();
        }}
      >
        <Image source={require("../image/back.png")} style={styles.backIcon} />
      </TouchableOpacity>
      <View style={styles.searchBox}>
        <Image
          source={require("../image/search1.png")}
          style={styles.searchIcon}
        />
        <TextInput
          value={search}
          onChangeText={setSearch}
          style={styles.input}
          placeholder="Rechercher..."
        />
        {search != "" && (
          <TouchableOpacity
            onPress={() => {
              setSearch("");
            }}
          >
            <Image
              source={require("../image/close.png")}
              style={styles.close}
            />
          </TouchableOpacity>
        )}
      </View>
      {search != "" && (
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => {
            searchRecipe();
            setRecipes([]);
          }}
        >
          <Text style={styles.searchTitle}>Recherche</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={recipes}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity
              style={styles.recipeItem}
              onPress={() => {
                navigation.navigate("Details", { data: item });
              }}
            >
              <Image
                source={{ uri: item.recipe.image }}
                style={styles.itemImage}
              />
              <View>
                <Text style={styles.title}>
                  {item.recipe.label.length > 40
                    ? item.recipe.label.substring(0, 40) + "..."
                    : item.recipe.label}
                </Text>
                <Text style={styles.source}>{item.recipe.source}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
      {recipes && recipes.length > 0 ? (
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => {
            setShowModal(true);
          }}
        >
          <Image source={require("../image/filter.png")} style={styles.close} />
        </TouchableOpacity>
      ) : null}
      <Modal
        onBackdropPress={() => {
          setShowModal(false);
        }}
        onBackButtonPress={() => {
          setShowModal(false);
        }}
        isVisible={showModal}
        backdropColor="rgba(0,0,0,.5)"
        style={{ margin: 0 }}
      >
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtre</Text>
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
              }}
            >
              <Image
                source={require("../image/close.png")}
                style={styles.close}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.heading}>Type de plat</Text>
          <View>
            <FlatList
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ marginTop: 15 }}
              horizontal
              data={DISH_FILTERS}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity
                    style={[
                      styles.filterItem,
                      {
                        backgroundColor:
                          selectedDish == item ? "#9e9e9e" : "transparent",
                      },
                    ]}
                    onPress={() => {
                      setSelectedDish(item);
                    }}
                  >
                    <Text
                      style={{
                        color: selectedDish == item ? "white" : "black",
                      }}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
          <Text style={styles.heading}>Cuisines</Text>
          <View>
            <FlatList
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ marginTop: 15 }}
              horizontal
              data={CUISINE_FILTERS}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity
                    style={[
                      styles.filterItem,
                      {
                        backgroundColor:
                          selectedCusines == item ? "#9e9e9e" : "transparent",
                      },
                    ]}
                    onPress={() => {
                      setSelectedCusines(item);
                    }}
                  >
                    <Text
                      style={{
                        color: selectedCusines == item ? "white" : "black",
                      }}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
          <TouchableOpacity
            style={styles.submitFilter}
            onPress={() => {
              setShowModal(false);
              searchRecipe();
            }}
          >
            <Text style={styles.btnText}>{"Appliquer les filtres"}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default Search;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backBtn: {
    width: 50,
    height: 50,
    backgroundColor: "white",
    borderRadius: 25,
    marginTop: 60,
    marginLeft: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  searchBox: {
    width: "90%",
    height: 50,
    borderWidth: 0.5,
    alignSelf: "center",
    marginTop: 50,
    borderRadius: 8,
    borderColor: "#9e9e9e",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
  },
  searchIcon: {
    width: 30,
    height: 30,
  },
  input: {
    width: "80%",
    marginLeft: 10,
    fontSize: 16,
    color: "black",
  },
  close: {
    width: 20,
    height: 25,
  },
  searchBtn: {
    width: "40%",
    height: 50,
    backgroundColor: "#9e9e9e",
    alignSelf: "center",
    marginTop: 20,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  searchTitle: {
    fontSize: 16,
    color: "white",
  },
  recipeItem: {
    width: "90%",
    height: 100,
    backgroundColor: "white",
    alignSelf: "center",
    marginTop: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  itemImage: {
    width: 90,
    height: 90,
    marginLeft: 10,
    borderRadius: 9,
  },
  title: {
    fontSize: 20,
    width: "60%",
    fontWeight: "500",
    marginLeft: 10,
  },
  source: {
    fontSize: 16,
    width: "60%",
    fontWeight: "500",
    marginLeft: 10,
    marginTop: 10,
    color: "green",
  },
  filterBtn: {
    width: 60,
    height: 60,
    backgroundColor: "white",
    shadowColor: "rgba(0,0,0,.3)",
    shadowOpacity: 5,
    position: "absolute",
    bottom: 50,
    right: 20,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    width: "100%",
    paddingBottom: 50,
    backgroundColor: "white",
    position: "absolute",
    bottom: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: "center",
    height: 60,
  },
  modalTitle: {
    color: "black",
    fontSize: 18,
    fontWeight: "600",
  },
  heading: {
    fontSize: 20,
    fontWeight: "800",
    marginLeft: 20,
    marginTop: 20,
  },
  filterItem: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 15,
    borderWidth: 0.6,
  },
  submitFilter: {
    width: "90%",
    height: 50,
    backgroundColor: "#9e9e9e",
    alignSelf: "center",
    marginTop: 20,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
