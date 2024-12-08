import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Button,
  FlatList,
  Alert,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import { ref as dbRef, set, get, update, remove } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { getAuth } from "firebase/auth";
import { database, storage } from "../../firebase/Firebasee";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

const RecipePhotos = ({ recipeUri }) => {
  const [photos, setPhotos] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  const extractRecipeId = (recipeUri) => {
    if (!recipeUri || !recipeUri.includes("#recipe_")) {
      console.error("recipeUri est invalide ou manquant :", recipeUri);
      return null;
    }
    const parts = recipeUri.split("#recipe_");
    return parts[1] || null;
  };

  const recipeApiId = extractRecipeId(recipeUri);

  if (!recipeApiId) {
    return <Text>Erreur : identifiant de recette manquant</Text>;
  }

  const sortPhotosByLikes = (photos) => {
    return photos.sort((a, b) => (b.likes || 0) - (a.likes || 0)); // Tri décroissant par likes
  };

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const photosRef = dbRef(database, `recipes/${recipeApiId}/photos`);
        const snapshot = await get(photosRef);
        if (snapshot.exists()) {
          let photosData = Object.values(snapshot.val());
          photosData = sortPhotosByLikes(photosData); // Trier par nombre de likes
          setPhotos(photosData);
        } else {
          console.log("Aucune photo trouvée.");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des photos :", error);
        Alert.alert("Erreur", "Impossible de charger les photos.");
      }
    };

    loadPhotos();
  }, [recipeApiId]);

  const addPhotoToRecipe = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission d'accès aux photos nécessaire");
      return;
    }
  
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Désactive le recadrage de l'image
        quality: 1, // Qualité maximale
      });
  
      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
  
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
  
        const response = await fetch(manipulatedImage.uri);
        const blob = await response.blob();
  
        const fileName = `${Date.now()}_${recipeApiId}.jpg`;
        const imageRef = storageRef(storage, `recipes/${recipeApiId}/${fileName}`);
  
        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);
  
        const photoId = Date.now().toString();
        const photoRef = dbRef(database, `recipes/${recipeApiId}/photos/${photoId}`);
  
        await set(photoRef, {
          id: photoId,
          url: downloadURL,
          likes: 0,
          userLikes: {},
          timestamp: new Date().toISOString(),
        });
  
        setPhotos((prevPhotos) =>
          sortPhotosByLikes([
            ...prevPhotos,
            { id: photoId, url: downloadURL, likes: 0, userLikes: {} },
          ])
        );
  
        Alert.alert("Succès", "Photo ajoutée avec succès !");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la photo :", error);
      Alert.alert("Erreur", `Échec de l'ajout de la photo : ${error.message}`);
    }
  };
  
  const toggleLike = async (photoId) => {
    if (!user) {
      alert("Veuillez vous connecter pour liker ou retirer un like.");
      return;
    }

    const userId = user.uid;
    const photoRef = dbRef(
      database,
      `recipes/${recipeApiId}/photos/${photoId}`
    );
    const userLikeRef = dbRef(
      database,
      `recipes/${recipeApiId}/photos/${photoId}/userLikes/${userId}`
    );

    try {
      const userLikeSnapshot = await get(userLikeRef);

      if (userLikeSnapshot.exists()) {
        await remove(userLikeRef);
        const photoSnapshot = await get(photoRef);
        if (photoSnapshot.exists()) {
          const photoData = photoSnapshot.val();
          const newLikesCount = Math.max((photoData.likes || 0) - 1, 0);
          await update(photoRef, { likes: newLikesCount });
          setPhotos((prevPhotos) =>
            sortPhotosByLikes(
              prevPhotos.map((photo) =>
                photo.id === photoId
                  ? {
                      ...photo,
                      likes: newLikesCount,
                      userLikes: { ...photo.userLikes, [userId]: undefined },
                    }
                  : photo
              )
            )
          );
        }
      } else {
        await set(userLikeRef, true);
        const photoSnapshot = await get(photoRef);
        if (photoSnapshot.exists()) {
          const photoData = photoSnapshot.val();
          const newLikesCount = (photoData.likes || 0) + 1;
          await update(photoRef, { likes: newLikesCount });
          setPhotos((prevPhotos) =>
            sortPhotosByLikes(
              prevPhotos.map((photo) =>
                photo.id === photoId
                  ? {
                      ...photo,
                      likes: newLikesCount,
                      userLikes: { ...photo.userLikes, [userId]: true },
                    }
                  : photo
              )
            )
          );
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du like :", error);
      Alert.alert("Erreur", "Impossible de liker ou retirer le like.");
    }
  };

  const openModal = (imageUri) => {
    setSelectedImage(imageUri);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedImage(null);
  };

  return (
    <View style={styles.container}>
      <Button title="Ajouter une photo" onPress={addPhotoToRecipe} />
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const userHasLiked =
            item.userLikes && user && item.userLikes[user.uid];
          return (
            <View style={styles.photoContainer}>
              <TouchableOpacity onPress={() => openModal(item.url)}>
                <Image source={{ uri: item.url }} style={styles.photo} />
              </TouchableOpacity>
              <Text>Likes : {item.likes || 0}</Text>
              <Button
                title={userHasLiked ? "Dislike" : "Like"}
                onPress={() => toggleLike(item.id)}
              />
            </View>
          );
        }}
      />
      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={closeModal}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalOverlay} onPress={closeModal} />
          <View style={styles.modalContent}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullscreenImage}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  photoContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Assombrit l'arrière-plan
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: "90%",
    height: "90%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain", // Affiche toute l'image sans la couper
  },
});

export default RecipePhotos;
