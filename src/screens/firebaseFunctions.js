import { getFirestore, collection, addDoc, doc, setDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { database, storage } from "../../firebase/Firebasee";

const db = getFirestore();

export const addPhotoToRecipe = async (recipeId, userId) => {
  try {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.IMAGE],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      const imageUri = result.uri;
      const imageRef = ref(storage, `recipes/${recipeId}/${Date.now()}_${userId}.jpg`);
      const imgBlob = await fetch(imageUri).then((res) => res.blob());
      await uploadBytes(imageRef, imgBlob);
      const downloadURL = await getDownloadURL(imageRef);

      const photoRef = doc(collection(db, `recipes/${recipeId}/photos`));
      await setDoc(photoRef, {
        url: downloadURL,
        uploadedBy: userId,
        likes: 0,
        timestamp: new Date(),
      });

      console.log("Photo ajoutée avec succès !");
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de la photo :", error);
  }
};

export const fetchRecipePhotos = async (recipeId) => {
  try {
    const photosRef = collection(db, `recipes/${recipeId}/photos`);
    const snapshot = await getDocs(photosRef);
    const photos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return photos;
  } catch (error) {
    console.error("Erreur lors de la récupération des photos :", error);
    return [];
  }
};
