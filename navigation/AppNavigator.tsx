import React, { useState, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../Screens/HomeScreen';
import LoginScreen from '../Screens/LoginScreen';
import SigninScreen from '../Screens/SiginScreen';
import HistoryScreen from '../Screens/HistoriqueScreen';
import ProfileScreen from '../Screens/ProfileScreen';
import BedRoomScreen from '../Screens/BedRoomScreen';
import { useAuth } from '../context/AuthContext';
import { View, StyleSheet, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import CustomHeaderTitle from '../components/CustomHeaderTitle';
import Acueil from '../Screens/Acueil';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string = '';

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Chambre':
              iconName = 'bed';
              break;
            case 'Historique':
              iconName = 'time';
              break;
            case 'Profil':
              iconName = 'person';
              break;
          }

          return (
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Icon name={iconName} size={size || 24} color="white" />
              </View>
            </View>
          );
        },
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: 'transparent',
          elevation: 0,
          height: 80,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={Acueil}
        options={{ 
          headerShown: false,
        }}  
      />
      <Tab.Screen 
        name="Chambre" 
        component={BedRoomScreen}
        options={{ 
          headerShown: false,
        }}  
      />
      <Tab.Screen
        name="Historique" 
        component={HistoryScreen}
        options={{ 
          headerShown: false,
        }}  
      />
      <Tab.Screen 
        name="Profil"
        component={ProfileScreen}
        options={{ 
          headerShown: false,
        }}  
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuIconRef = useRef<TouchableOpacity>(null);

  const handleLogout = () => {
    setModalVisible(false);
    logout();
  };

  const toggleMenu = () => {
    if (modalVisible) {
      setModalVisible(false);
    } else {
      menuIconRef.current?.measure((fx, fy, width, height, px, py) => {
        const screenWidth = Dimensions.get('window').width;

        const modalWidth = 200;

        const leftPosition = px + modalWidth > screenWidth ? screenWidth - modalWidth - 10 : px;

        setMenuPosition({ x: leftPosition, y: py + height });
        setModalVisible(true);
      });
    }
  };

  return (
    <>
      <Stack.Navigator initialRouteName="Home">
        {!isAuthenticated ? (
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ 
                headerShown: false,
              }} 
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ 
                headerShown: false,
              }} 
            />
            <Stack.Screen 
              name="Signin" 
              component={SigninScreen} 
              options={{ 
                headerShown: false,
              }} 
            />
          </>
        ) : (
          <Stack.Screen 
            name="Main" 
            component={MainTabs} 
            options={{ 
              headerShown: true,
              headerTitle: () => <CustomHeaderTitle />,
              headerStyle: {
                backgroundColor: 'white',
                height: 120,
              },
              headerTitleStyle: {
                color: 'black',
                fontWeight: 'bold',
                fontSize: 50,
                marginTop: 20,
                marginBottom: 0,
              },
              headerRight: () => (
                <TouchableOpacity
                  style={styles.headerRightContainer}
                  onPress={toggleMenu}
                  ref={menuIconRef}
                >
                  <Icon name="menu" size={24} color="black" />
                </TouchableOpacity>
              ),
              headerBackTitleVisible: false,
            }} 
          />
        )}
      </Stack.Navigator>
      
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={[styles.modalOverlay, { justifyContent: 'flex-start', alignItems: 'flex-start' }]}
          onPress={toggleMenu}
          activeOpacity={1}
        >
          <View style={[styles.modalContent, { position: 'absolute', top: menuPosition.y, left: menuPosition.x }]}>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setModalVisible(false);

              }}
            >
              <Icon name="settings" size={20} color="black" />
              <Text style={styles.modalText}>Paramètres</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={handleLogout}
            >
              <Icon name="log-out" size={20} color="black" />
              <Text style={styles.modalText}>Déconnecter</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
  },
  iconBackground: {
    backgroundColor: 'black',
    padding: 5,
    borderRadius: 20,
  },
  headerRightContainer: {
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalText: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default AppNavigator;
