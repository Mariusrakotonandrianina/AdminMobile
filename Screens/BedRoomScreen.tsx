import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';


const ChambreScreen: React.FC = () => {
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [disponibility, setDisponibility] = useState<string>('true');
  const [type, setType] = useState<string>('');
  const [loyer, setLoyer] = useState<string>('');
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('image/jpeg');
  const [bedrooms, setBedrooms] = useState<any[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedBedroom, setSelectedBedroom] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentBedroom, setCurrentBedroom] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          "Vous devez accorder la permission pour accéder à la bibliothèque d'images."
        );
      }
    })();
  }, []);

  useEffect(() => {
    fetchBedrooms();
  }, []);

  const fetchBedrooms = async () => {
    try {
      const response = await axios.get('http://192.168.4.28:5003/api/getAllBedroom');
      const sortedBedrooms = response.data.sort((a: any, b: any) => a.roomNumber - b.roomNumber);
      setBedrooms(sortedBedrooms);
    } catch (error) {
      console.error('Erreur lors de la récupération des chambres :', error);
      Alert.alert('Erreur', "Une erreur s'est produite lors de la récupération des chambres.");
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setFileUri(asset.uri);
        setFileType(asset.type || 'image/jpeg');
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de fichier :', error);
      Alert.alert('Erreur', "Une erreur s'est produite lors de la sélection du fichier.");
    }
  };

  const handleSubmit = async () => {
    if (!roomNumber || !type || !loyer || !fileUri) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires et sélectionner une image.');
      return;
    }

    const formData = new FormData();
    formData.append('roomNumber', roomNumber);
    formData.append('disponibility', disponibility);
    formData.append('type', type);
    formData.append('loyer', loyer);

    if (fileUri) {
      const uri = fileUri.startsWith('file://') ? fileUri : `file://${fileUri}`;
      const fileName = uri.split('/').pop() || 'photo.jpg';
      const fileExtension = fileName.split('.').pop();
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';

      const file = {
        uri,
        type: mimeType,
        name: fileName,
      };

      formData.append('imageRoom', file as any);
    }

    try {
      const url = selectedBedroom
        ? `http://192.168.4.28:5003/api/updBedroom/${selectedBedroom._id}`
        : 'http://192.168.4.28:5003/api/createBedRoom';

      const response = await fetch(url, {
        method: selectedBedroom ? 'PUT' : 'POST',
        body: formData,
      });

      if (!response.ok) {
        const responseBody = await response.text();
        console.error('Error response:', responseBody);
        throw new Error('Network response was not ok.');
      }

      Alert.alert('Succès', `Chambre ${selectedBedroom ? 'mise à jour' : 'créée'} avec succès.`);

      setRoomNumber('');
      setDisponibility('true');
      setType('');
      setLoyer('');
      setFileUri(null);
      setSelectedBedroom(null);

      fetchBedrooms();
      setShowForm(false);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue s'est produite.";
      Alert.alert('Erreur', `Une erreur s'est produite : ${errorMessage}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://192.168.4.28:5003/api/deleteBedroom/${id}`);
      Alert.alert('Succès', 'Chambre supprimée avec succès.');
      fetchBedrooms();
    } catch (error) {
      console.error('Erreur lors de la suppression de la chambre :', error);
      Alert.alert('Erreur', "Une erreur s'est produite lors de la suppression de la chambre.");
    }
  };

  const handleUpdate = (bedroom: any) => {
    setRoomNumber(bedroom.roomNumber);
    setDisponibility(bedroom.disponibility ? 'true' : 'false');
    setType(bedroom.type);
    setLoyer(bedroom.loyer);
    setFileUri(bedroom.imageRoom);
    setSelectedBedroom(bedroom);
    setShowForm(true);
  };

  const openMenu = (bedroom: any) => {
    setCurrentBedroom(bedroom);
    setModalVisible(true);
  };

  const renderMenu = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => { handleUpdate(currentBedroom); setModalVisible(false); }}>
            <Icon name="edit" size={20} color="#007BFF" />
            <Text style={styles.menuItemText}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => { handleDelete(currentBedroom._id); setModalVisible(false); }}>
            <Icon name="delete" size={20} color="#FF0000" />
            <Text style={styles.menuItemText}>Supprimer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => setModalVisible(false)}>
            <Icon name="close" size={20} color="#AAAAAA" />
            <Text style={styles.menuItemText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {showForm ? (
        <>
          <Text style={styles.title}>{selectedBedroom ? 'Modifier une chambre' : 'Créer une chambre'}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Numéro de la chambre</Text>
            <TextInput
              style={styles.input}
              value={roomNumber}
              onChangeText={setRoomNumber}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Disponibilité</Text>
            <Picker
              selectedValue={disponibility}
              style={styles.picker}
              onValueChange={(itemValue) => setDisponibility(itemValue)}
            >
              <Picker.Item label="Disponible" value="true" />
              <Picker.Item label="Indisponible" value="false" />
            </Picker>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Type de chambre</Text>
            <TextInput
              style={styles.input}
              value={type}
              onChangeText={setType}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Loyer</Text>
            <TextInput
              style={styles.input}
              value={loyer}
              onChangeText={setLoyer}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Image de la chambre</Text>
            <TouchableOpacity style={styles.imageButton} onPress={handleFilePick}>
                <Icon name="photo-camera" size={30} color="#007BFF" />
                <Text style={styles.imageButtonText}>{fileUri ? 'Image sélectionnée' : 'Choisir une image'}</Text>
            </TouchableOpacity>
            {fileUri && <Image source={{ uri: fileUri }} style={styles.image} />}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={handleSubmit}>
              <Icon name="send" size={24} color="#007BFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowForm(false)}>
              <Icon name="cancel" size={24} color="#FF0000" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <ScrollView>
          <View style={styles.header}>
            <Text style={styles.title}>Liste des chambres</Text>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Numéro</Text>
              <Text style={styles.tableHeaderText}>Type</Text>
              <Text style={styles.tableHeaderText}>Disponibilité</Text>
              <Text style={styles.tableHeaderText}>Loyer</Text>
              <Text style={styles.tableHeaderText}></Text>
            </View>

            {bedrooms.map((bedroom) => (
              <View key={bedroom._id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{bedroom.roomNumber}</Text>
                <Text style={styles.tableCell}>{bedroom.type}</Text>
                <Text style={styles.tableCell}>{bedroom.disponibility ? 'Oui' : 'Non'}</Text>
                <Text style={styles.tableCell}>{bedroom.loyer}</Text>
                <TouchableOpacity onPress={() => openMenu(bedroom)}>
                  <Icon name="more-vert" size={24} color="#000" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {!showForm && (
        <TouchableOpacity style={styles.iconButtonAdd} onPress={() => setShowForm(true)}>
            <Icon name="add" size={30} color="#AAAAAA" />
            <Text style={styles.iconButtonText}>Ajouter</Text>
        </TouchableOpacity>
      )}
      {renderMenu()}
    </View>
  );
};
const styles = StyleSheet.create({
  iconButtonAdd: {
    flexDirection: 'row', 
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E7F0FF',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#007BFF',
  },
  iconButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007BFF',
    fontWeight: 'bold',
  },
    header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  table: {
    marginTop: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  picker: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 5,
    backgroundColor: '#E7F0FF',
  },
  imageButtonText: {
    marginLeft: 10,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  tableContainer: {
    flex: 1,
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E7F0FF',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#007BFF',
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    color: '#333',
    paddingHorizontal: 5,
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    width: '100%',
  },
  menuItemText: {
    marginLeft: 10,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5, // ajout d'une ombre pour un effet de profondeur
  },
  iconButton: {
    padding: 15,
    backgroundColor: '#E7F0FF',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#007BFF',
  },
});

export default ChambreScreen;
