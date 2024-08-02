import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Customer {
  _id: string;
  name: string;
  email: string;
  telephone: string;
}

interface BedRoom {
  roomNumber: string;
  type: string;
  loyer: number;
}

interface Reservation {
  _id: string;
  customer: Customer;
  bedRoom: BedRoom;
  startDate: string;
  endDate: string;
  paymentAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  reservationDate: string;
}

const HistoryScreen: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false);

  // States for the form
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('paid');
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');

  const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get('http://192.168.4.28:5003/api/getAllReservations');
        const sortedReservations = response.data.sort((a: Reservation, b: Reservation) => {
          return new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime();
        });
        setReservations(sortedReservations);
        setFilteredReservations(sortedReservations);
      } catch (err) {
        setError('Erreur lors de la récupération des données.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredReservations(reservations);
    } else {
      const filtered = reservations.filter((reservation) =>
        reservation.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.bedRoom.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredReservations(filtered);
    }
  }, [searchQuery, reservations]);

  const toggleModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setModalVisible(!isModalVisible);
  };

  const toggleEditModal = () => {
    if (selectedReservation) {
      setStartDate(new Date(selectedReservation.startDate));
      setEndDate(new Date(selectedReservation.endDate));
      setPaymentAmount(selectedReservation.paymentAmount.toString());
      setPaymentStatus(selectedReservation.paymentStatus);
      setPaymentMethod(selectedReservation.paymentMethod);
      setCustomerEmail(selectedReservation.customer.email);
      setRoomNumber(selectedReservation.bedRoom.roomNumber);
    }
    setEditModalVisible(!isEditModalVisible);
  };

  const handleEdit = async () => {
    try {
      const response = await axios.put(`http://192.168.4.28:5003/api/updReservation/${selectedReservation?._id}`, {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        paymentAmount: parseFloat(paymentAmount),
        paymentStatus,
        paymentMethod,
        customerEmail,
        roomNumber,
      });
      console.log('Réservation modifiée:', response.data);
      setEditModalVisible(false);
      setModalVisible(false);
      const updatedReservations = reservations.map((res) =>
        res._id === response.data._id ? response.data : res
      );
      setReservations(updatedReservations);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedReservation) return;

    try {
      await axios.delete(`http://192.168.4.28:5003/api/deleteReservation/${selectedReservation._id}`);
      Alert.alert('Succès', 'Réservation supprimée avec succès.');
      const updatedReservations = reservations.filter((res) => res._id !== selectedReservation._id);
      setReservations(updatedReservations);
      setFilteredReservations(updatedReservations);
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la suppression de la réservation.');
    }
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique des Réservations</Text>
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#007BFF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder=""
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text>{error}</Text>
      ) : (
        <FlatList
          data={filteredReservations}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <View style={styles.row}>
                <Text style={styles.itemTextTitle}>Nom du Client:</Text>
                <Text style={styles.itemTextValue}>{item.customer.name}</Text>
                <TouchableOpacity onPress={() => toggleModal(item)}>
                  <Icon name="more-vert" size={24} color="#007BFF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.itemTextTitle}>Email:</Text>
              <Text style={styles.itemTextValue}>{item.customer.email}</Text>
              <Text style={styles.itemTextTitle}>Téléphone:</Text>
              <Text style={styles.itemTextValue}>{item.customer.telephone}</Text>
              <Text style={styles.itemTextTitle}>Numéro de Chambre:</Text>
              <Text style={styles.itemTextValue}>{item.bedRoom.roomNumber}</Text>
              <Text style={styles.itemTextTitle}>Type de Chambre:</Text>
              <Text style={styles.itemTextValue}>{item.bedRoom.type}</Text>
              <Text style={styles.itemTextTitle}>Loyer:</Text>
              <Text style={styles.itemTextValue}>{item.bedRoom.loyer} €</Text>
              <Text style={styles.itemTextTitle}>Date de Réservation:</Text>
              <Text style={styles.itemTextValue}>{new Date(item.reservationDate).toLocaleDateString()}</Text>
              <Text style={styles.itemTextTitle}>Date d'arrivée:</Text>
              <Text style={styles.itemTextValue}>{new Date(item.startDate).toLocaleDateString()}</Text>
              <Text style={styles.itemTextTitle}>Date de départ:</Text>
              <Text style={styles.itemTextValue}>{new Date(item.endDate).toLocaleDateString()}</Text>
              <Text style={styles.itemTextTitle}>Montant du Paiement:</Text>
              <Text style={styles.itemTextValue}>{item.paymentAmount} €</Text>
              <Text style={styles.itemTextTitle}>Méthode de Paiement:</Text>
              <Text style={styles.itemTextValue}>{item.paymentMethod}</Text>
              <Text style={styles.itemTextTitle}>Statut de Paiement:</Text>
              <Text style={styles.itemTextValue}>{item.paymentStatus}</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Détails de la Réservation</Text>
          <View style={styles.modalButton}>
            <Icon name="edit" size={24} color="#007BFF" />
            <Text style={styles.modalButtonText} onPress={toggleEditModal}>Modifier</Text>
          </View>
          <View style={styles.modalButton}>
            <Icon name="delete" size={24} color="#FF0000" />
            <Text style={styles.modalButtonText} onPress={handleDelete}>Supprimer</Text>
          </View>
        </View>
      </Modal>

      <Modal isVisible={isEditModalVisible} onBackdropPress={() => setEditModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Modifier Réservation</Text>
          <TextInput
            style={styles.input}
            value={paymentAmount}
            onChangeText={setPaymentAmount}
            placeholder="Montant du Paiement"
            keyboardType="numeric"
          />
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Méthode de Paiement:</Text>
            <Picker
              selectedValue={paymentMethod}
              style={styles.picker}
              onValueChange={(itemValue) => setPaymentMethod(itemValue)}
            >
              <Picker.Item label="Carte de Crédit" value="credit_card" />
              <Picker.Item label="PayPal" value="paypal" />
              <Picker.Item label="Virement Bancaire" value="bank_transfer" />
            </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Statut de Paiement:</Text>
            <Picker
              selectedValue={paymentStatus}
              style={styles.picker}
              onValueChange={(itemValue) => setPaymentStatus(itemValue)}
            >
              <Picker.Item label="Payé" value="paid" />
              <Picker.Item label="Non Payé" value="unpaid" />
            </Picker>
          </View>
          <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateButton}>
            <Text>{startDate ? startDate.toDateString() : 'Choisir Date d\'arrivée'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dateButton}>
            <Text>{endDate ? endDate.toDateString() : 'Choisir Date de départ'}</Text>
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              onChange={onStartDateChange}
            />
          )}
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display="default"
              onChange={onEndDateChange}
            />
          )}
          <TouchableOpacity onPress={handleEdit} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  itemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemTextTitle: {
    fontWeight: 'bold',
  },
  itemTextValue: {
    color: '#555',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  dateButton: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HistoryScreen;
