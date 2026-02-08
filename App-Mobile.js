// Mobile-Optimized Attendance App for React Native/Expo
// File: App.js

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  RefreshControl
} from 'react-native';

// Note: Install these packages:
// expo install expo-camera expo-location
// npm install @react-navigation/native @react-navigation/stack

import { Camera } from 'expo-camera';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function AttendanceApp() {
  // Auth & User Management
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  
  // Users Database
  const [users] = useState([
    { id: 1, username: 'admin', password: 'admin123', name: 'Admin User', role: 'admin', department: 'Management', email: 'admin@company.com' },
    { id: 2, username: 'john', password: 'john123', name: 'John Doe', role: 'employee', department: 'Sales', email: 'john@company.com' },
    { id: 3, username: 'jane', password: 'jane123', name: 'Jane Smith', role: 'employee', department: 'Marketing', email: 'jane@company.com' },
    { id: 4, username: 'bob', password: 'bob123', name: 'Bob Johnson', role: 'employee', department: 'IT', email: 'bob@company.com' },
    { id: 5, username: 'alice', password: 'alice123', name: 'Alice Williams', role: 'employee', department: 'HR', email: 'alice@company.com' }
  ]);

  // App State
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [status, setStatus] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hasPermission, setHasPermission] = useState(null);
  
  // Dashboard State
  const [activeView, setActiveView] = useState('employee');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterDate, setFilterDate] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const cameraRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(cameraStatus === 'granted' && locationStatus === 'granted');
    })();
  }, []);

  const handleLogin = () => {
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    
    if (user) {
      setIsLoggedIn(true);
      setUserRole(user.role);
      setCurrentUser(user.name);
      setActiveView(user.role === 'admin' ? 'admin' : 'employee');
      setStatus('Login successful!');
      setTimeout(() => setStatus(''), 2000);
    } else {
      Alert.alert('Error', 'Invalid username or password');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            setIsLoggedIn(false);
            setUserRole('');
            setCurrentUser('');
            setLoginForm({ username: '', password: '' });
            setCapturedPhoto(null);
            setLocation(null);
          }
        }
      ]
    );
  };

  const getCurrentLocation = async () => {
    try {
      setStatus('Getting location...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      const loc = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      };
      
      setLocation(loc);
      setStatus('Location captured ✓');
      return loc;
    } catch (error) {
      setStatus('Location error: ' + error.message);
      Alert.alert('Error', 'Failed to get location');
      throw error;
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true
        });
        setCapturedPhoto(photo.uri);
        setIsCameraActive(false);
        setStatus('Photo captured ✓');
      } catch (error) {
        Alert.alert('Error', 'Failed to capture photo');
      }
    }
  };

  const markAttendance = async (type) => {
    try {
      if (!capturedPhoto) {
        Alert.alert('Error', 'Please capture a photo first');
        return;
      }

      setStatus('Processing...');
      const loc = location || await getCurrentLocation();
      
      const record = {
        id: Date.now(),
        user: currentUser,
        type: type,
        timestamp: new Date().toISOString(),
        photo: capturedPhoto,
        location: loc,
        address: `${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`
      };

      setAttendanceRecords([record, ...attendanceRecords]);
      Alert.alert('Success', `${type === 'check-in' ? 'Check-in' : 'Check-out'} successful!`);
      
      setCapturedPhoto(null);
      setLocation(null);
      setStatus('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getFilteredRecords = () => {
    let filtered = [...attendanceRecords];

    if (filterDepartment !== 'all') {
      filtered = filtered.filter(record => {
        const user = users.find(u => u.name === record.user);
        return user?.department === filterDepartment;
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (filterDate === 'today') {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.timestamp);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === today.getTime();
      });
    } else if (filterDate === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(record => new Date(record.timestamp) >= weekAgo);
    } else if (filterDate === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(record => new Date(record.timestamp) >= monthAgo);
    }

    if (searchQuery) {
      filtered = filtered.filter(record => 
        record.user.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getStats = () => {
    const filtered = getFilteredRecords();
    return {
      totalRecords: filtered.length,
      checkIns: filtered.filter(r => r.type === 'check-in').length,
      checkOuts: filtered.filter(r => r.type === 'check-out').length,
      uniqueEmployees: new Set(filtered.map(r => r.user)).size
    };
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting permissions...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera or location</Text>
      </View>
    );
  }

  // Login Screen
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
        <View style={styles.loginBox}>
          <View style={styles.loginHeader}>
            <View style={styles.loginIcon}>
              <Text style={styles.loginIconText}>🛡️</Text>
            </View>
            <Text style={styles.loginTitle}>Attendance System</Text>
            <Text style={styles.loginSubtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.loginForm}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={loginForm.username}
              onChangeText={(text) => setLoginForm({...loginForm, username: text})}
              placeholder="Enter username"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={loginForm.password}
              onChangeText={(text) => setLoginForm({...loginForm, password: text})}
              placeholder="Enter password"
              secureTextEntry
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>

            <View style={styles.demoAccounts}>
              <Text style={styles.demoTitle}>Demo Accounts:</Text>
              <Text style={styles.demoText}>Admin: admin / admin123</Text>
              <Text style={styles.demoText}>Employee: john / john123</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Main App
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Attendance System</Text>
          <Text style={styles.headerSubtitle}>{currentUser} ({userRole})</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Time Display */}
      <View style={styles.timeContainer}>
        <Text style={styles.time}>
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </Text>
        <Text style={styles.date}>
          {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
      </View>

      {/* View Toggle (Admin only) */}
      {userRole === 'admin' && (
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, activeView === 'employee' && styles.toggleButtonActive]}
            onPress={() => setActiveView('employee')}
          >
            <Text style={[styles.toggleButtonText, activeView === 'employee' && styles.toggleButtonTextActive]}>
              Mark Attendance
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, activeView === 'admin' && styles.toggleButtonActive]}
            onPress={() => setActiveView('admin')}
          >
            <Text style={[styles.toggleButtonText, activeView === 'admin' && styles.toggleButtonTextActive]}>
              Dashboard
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} />
        }
      >
        {activeView === 'employee' ? (
          // Employee View
          <>
            {/* Camera Section */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📸 Photo Capture</Text>
              
              {isCameraActive ? (
                <View style={styles.cameraContainer}>
                  <Camera
                    ref={cameraRef}
                    style={styles.camera}
                    type={Camera.Constants.Type.front}
                  />
                  <View style={styles.cameraButtons}>
                    <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                      <Text style={styles.captureButtonText}>Capture</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setIsCameraActive(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : capturedPhoto ? (
                <View>
                  <Image source={{ uri: capturedPhoto }} style={styles.capturedImage} />
                  <TouchableOpacity
                    style={styles.retakeButton}
                    onPress={() => {
                      setCapturedPhoto(null);
                      setLocation(null);
                    }}
                  >
                    <Text style={styles.retakeButtonText}>Retake Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.startCameraButton}
                  onPress={() => setIsCameraActive(true)}
                >
                  <Text style={styles.startCameraButtonText}>Start Camera</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Location Section */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📍 Location</Text>
              {location ? (
                <View style={styles.locationCaptured}>
                  <Text style={styles.locationText}>✓ Location Captured</Text>
                  <Text style={styles.locationCoords}>
                    Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
                  </Text>
                  <Text style={styles.locationAccuracy}>
                    Accuracy: ±{location.accuracy.toFixed(0)}m
                  </Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
                  <Text style={styles.locationButtonText}>Get Current Location</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Status */}
            {status ? (
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>{status}</Text>
              </View>
            ) : null}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.checkInButton, !capturedPhoto && styles.disabledButton]}
                onPress={() => markAttendance('check-in')}
                disabled={!capturedPhoto}
              >
                <Text style={styles.actionButtonText}>Check In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.checkOutButton, !capturedPhoto && styles.disabledButton]}
                onPress={() => markAttendance('check-out')}
                disabled={!capturedPhoto}
              >
                <Text style={styles.actionButtonText}>Check Out</Text>
              </TouchableOpacity>
            </View>

            {/* Recent Activity */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>⏰ My Recent Activity</Text>
              {attendanceRecords.filter(r => r.user === currentUser).length === 0 ? (
                <Text style={styles.noRecords}>No attendance records yet</Text>
              ) : (
                attendanceRecords.filter(r => r.user === currentUser).slice(0, 5).map((record) => (
                  <View key={record.id} style={styles.recordItem}>
                    <Image source={{ uri: record.photo }} style={styles.recordImage} />
                    <View style={styles.recordDetails}>
                      <View style={[styles.badge, record.type === 'check-in' ? styles.checkInBadge : styles.checkOutBadge]}>
                        <Text style={styles.badgeText}>
                          {record.type === 'check-in' ? 'Check In' : 'Check Out'}
                        </Text>
                      </View>
                      <Text style={styles.recordTime}>
                        {formatDate(record.timestamp)} at {formatTime(record.timestamp)}
                      </Text>
                      <Text style={styles.recordLocation}>{record.address}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        ) : (
          // Admin Dashboard View
          <>
            {/* Statistics */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{getStats().totalRecords}</Text>
                <Text style={styles.statLabel}>Total Records</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{getStats().checkIns}</Text>
                <Text style={styles.statLabel}>Check-Ins</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{getStats().checkOuts}</Text>
                <Text style={styles.statLabel}>Check-Outs</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{getStats().uniqueEmployees}</Text>
                <Text style={styles.statLabel}>Employees</Text>
              </View>
            </View>

            {/* Search */}
            <View style={styles.card}>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by name..."
              />
            </View>

            {/* Records */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📊 Attendance Records</Text>
              {getFilteredRecords().length === 0 ? (
                <Text style={styles.noRecords}>No records found</Text>
              ) : (
                getFilteredRecords().map((record) => {
                  const user = users.find(u => u.name === record.user);
                  return (
                    <TouchableOpacity
                      key={record.id}
                      style={styles.adminRecordItem}
                      onPress={() => setSelectedRecord(record)}
                    >
                      <Image source={{ uri: record.photo }} style={styles.adminRecordImage} />
                      <View style={styles.adminRecordDetails}>
                        <Text style={styles.adminRecordName}>{record.user}</Text>
                        <Text style={styles.adminRecordDept}>{user?.department}</Text>
                        <View style={[styles.badge, record.type === 'check-in' ? styles.checkInBadge : styles.checkOutBadge]}>
                          <Text style={styles.badgeText}>
                            {record.type === 'check-in' ? 'Check In' : 'Check Out'}
                          </Text>
                        </View>
                        <Text style={styles.adminRecordTime}>
                          {formatDate(record.timestamp)} at {formatTime(record.timestamp)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Record Detail Modal */}
      <Modal
        visible={selectedRecord !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedRecord(null)}
      >
        {selectedRecord && (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Attendance Details</Text>
                <TouchableOpacity onPress={() => setSelectedRecord(null)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView>
                <Image source={{ uri: selectedRecord.photo }} style={styles.modalImage} />
                
                <View style={styles.modalDetails}>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Employee:</Text>
                    <Text style={styles.modalValue}>{selectedRecord.user}</Text>
                  </View>
                  
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Type:</Text>
                    <View style={[styles.badge, selectedRecord.type === 'check-in' ? styles.checkInBadge : styles.checkOutBadge]}>
                      <Text style={styles.badgeText}>
                        {selectedRecord.type === 'check-in' ? 'Check In' : 'Check Out'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Date:</Text>
                    <Text style={styles.modalValue}>{formatDate(selectedRecord.timestamp)}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Time:</Text>
                    <Text style={styles.modalValue}>{formatTime(selectedRecord.timestamp)}</Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Location:</Text>
                    <Text style={styles.modalValue}>{selectedRecord.address}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setSelectedRecord(null)}
                >
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loginContainer: {
    flex: 1,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    padding: 20,
  },
  loginBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  loginIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  loginIconText: {
    fontSize: 40,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  loginForm: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoAccounts: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  demoTitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  timeContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    margin: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  time: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
  },
  viewToggle: {
    flexDirection: 'row',
    padding: 10,
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#4F46E5',
  },
  toggleButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  cameraContainer: {
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraButtons: {
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  captureButton: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6B7280',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  capturedImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  retakeButton: {
    backgroundColor: '#6B7280',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  retakeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  startCameraButton: {
    backgroundColor: '#4F46E5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  startCameraButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  locationCaptured: {
    backgroundColor: '#D1FAE5',
    padding: 15,
    borderRadius: 8,
  },
  locationText: {
    color: '#065F46',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  locationCoords: {
    color: '#047857',
    fontSize: 14,
    marginTop: 5,
  },
  locationAccuracy: {
    color: '#059669',
    fontSize: 12,
    marginTop: 5,
  },
  locationButton: {
    backgroundColor: '#E0E7FF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  statusContainer: {
    backgroundColor: '#DBEAFE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  statusText: {
    color: '#1E40AF',
    textAlign: 'center',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  actionButton: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkInButton: {
    backgroundColor: '#10B981',
  },
  checkOutButton: {
    backgroundColor: '#EF4444',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noRecords: {
    textAlign: 'center',
    color: '#9CA3AF',
    padding: 30,
  },
  recordItem: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 10,
  },
  recordImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  recordDetails: {
    flex: 1,
    marginLeft: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 5,
  },
  checkInBadge: {
    backgroundColor: '#D1FAE5',
  },
  checkOutBadge: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recordTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  recordLocation: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 5,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  adminRecordItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 10,
  },
  adminRecordImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  adminRecordDetails: {
    flex: 1,
    marginLeft: 12,
  },
  adminRecordName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  adminRecordDept: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  adminRecordTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalClose: {
    fontSize: 24,
    color: '#6B7280',
  },
  modalImage: {
    width: '100%',
    height: 250,
  },
  modalDetails: {
    padding: 20,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  modalButton: {
    backgroundColor: '#4F46E5',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
