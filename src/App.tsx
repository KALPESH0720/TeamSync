import 'react-native-gesture-handler';

import { enableScreens } from 'react-native-screens';
enableScreens();

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text, TouchableOpacity ,Image} from 'react-native';
import firestore from '@react-native-firebase/firestore';

import { AuthProvider, useAuth } from './AuthContext';

import OnboardingScreen from './screens/onboarding';
import LoginScreen from './screens/auth/login';
import SignupScreen from './screens/auth/signup';

import ProjectsListScreen from './screens/projectlistscreen';
import ProjectChatScreen from './screens/projectchatscreen';
import ProjectTasksScreen from './screens/projectTaskscreen';
import TaskFormScreen from './screens/taskformscreen';
import ProjectMembersScreen from './screens/projectMembersscreen';
import AddProjectScreen from './screens/addproject';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeScreen() {
  const { user } = useAuth();
  const [projectsCount, setProjectsCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = firestore()
      .collection('projects')
      .where('members', 'array-contains', user.uid)
      .onSnapshot(snap => {
        setProjectsCount(snap.size);
      });
    return () => unsub();
  }, [user?.uid]);

  return (
    <ProjectsListScreen />
  );
}

function ProfileScreen() {
  const { user, logout } = useAuth();
  const [activeCount, setActiveCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    const load = async () => {
      try {
        const projectSnap = await firestore()
          .collection('projects')
          .where('members', 'array-contains', user.uid)
          .get();

        const projects = projectSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        let active = 0;
        let completed = 0;

        for (let p of projects) {
          const taskSnap = await firestore()
            .collection('projects')
            .doc(p.id)
            .collection('tasks')
            .get();

          const tasks = taskSnap.docs.map(d => d.data());
          const doneCount = tasks.filter(t => t.status === 'done').length;
          const totalTasks = tasks.length;

          if (totalTasks > 0 && doneCount === totalTasks) completed += 1;
          else active += 1;
        }

        setActiveCount(active);
        setCompletedCount(completed);
      } catch (e) {
        console.log('profile stats error', e);
      }
    };
    load();
  }, [user?.uid]);

  return (
    
    <View style={{ flex: 1, backgroundColor: '#000', padding: 25 ,alignItems:"center"}}>
      <Text style={{ color: '#fff', fontSize: 35, fontWeight: 'bold', marginBottom: 16,margin:20,marginTop:50 }}>
        Profile
      </Text>
      <Text style={{ color: '#ccc', fontSize: 25, marginBottom: 25, borderBottomWidth:2 ,borderColor:"#6a6a6aff" }}>
        Name: {user?.displayName || 'No name'}
      </Text>
      <Text style={{ color: '#ccc', fontSize: 25, marginBottom: 25, borderBottomWidth:2 ,borderColor:"#6a6a6aff" }}>
        Email:  {user?.email}
      </Text>

      <Text
        onPress={logout}
        style={{ color: 'red', fontSize: 16, marginTop: 350}}
      >
        Logout
      </Text>
    </View>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000ff',
          borderTopColor: '#222',
          height: 60,
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#777',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
         tabBarIcon: ({ focused }) => (
  <Image
    source={require('../assets/home.png')}
    style={{
      width: 24,
      height: 24,
      tintColor: focused ? '#007AFF' : '#8E8E93', 
    }}
    resizeMode="contain"
  />
)

    
          
        }}
      />

      <Tab.Screen
        name="AddProjectTab"
        component={View}
        options={({ navigation }) => ({
          title: '',
          tabBarButton: props => (
            <TouchableOpacity
              {...props}
              onPress={() => navigation.navigate('AddProject')}
              style={{
                top: -15,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: '#0122a5ff',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 40 }}>+</Text>
              </View>
            </TouchableOpacity>
          ),
        })}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
           tabBarIcon: ({ focused }) => (
  <Image
    source={require('../assets/user.png')}
    style={{
      width: 24,
      height: 24,
      tintColor: focused ? '#007AFF' : '#8E8E93', 
    }}
    resizeMode="contain"
  />
)
        }}
      />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeTabs"
        component={HomeTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="ProjectChat" component={ProjectChatScreen} />
      <Stack.Screen name="ProjectTasks" component={ProjectTasksScreen} />
      <Stack.Screen name="TaskForm" component={TaskFormScreen}
      />
      <Stack.Screen
        name="ProjectMembers"
        component={ProjectMembersScreen}
        options={{
          headerStyle: {
            backgroundColor: '#323232ff',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            color: '#fff',
          },
        }}
      />
      <Stack.Screen name="AddProject" component={AddProjectScreen} options={{
          headerStyle: {
            backgroundColor: '#323232ff',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            color: '#fff',
          },
        }} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
