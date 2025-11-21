
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../AuthContext';

export default function ProjectTasksScreen({ route, navigation }) {
  const { projectId, projectName } = route.params;
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: projectName ? `${projectName} - Tasks` : 'Tasks',
    headerStyle: {
      backgroundColor: '#464646ff',  
    },
    headerTintColor: '#fff',     
    headerTitleStyle: {
      color: '#fff',
    },
    
    });
  }, [navigation, projectName]);

  useEffect(() => {
    const ref = firestore()
      .collection('projects')
      .doc(projectId)
      .collection('tasks')
      .orderBy('createdAt', 'desc');

    const unsubscribe = ref.onSnapshot(snapshot => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(list);
    });

    return () => unsubscribe();
  }, [projectId]);

  const toggleStatus = async task => {
    const order = ['todo', 'in-progress', 'done'];
    const currentIndex = order.indexOf(task.status || 'todo');
    const nextStatus = order[(currentIndex + 1) % order.length];

      if (task.assignedTo !== user?.uid) {
    Alert.alert('Not allowed', 'Only the assignee can update the task status.');
    return;
  }

    try {
      await firestore()
        .collection('projects')
        .doc(projectId)
        .collection('tasks')
        .doc(task.id)
        .update({ status: nextStatus });
    } catch (e) {
      console.log('Error updating status:', e);
    }
  };

  const renderItem = ({ item }) => {
    const isAssignedToMe = item.assignedTo === user?.uid;
    return (
      <TouchableOpacity
        style={[
          styles.taskItem,
          isAssignedToMe && { borderColor: '#4caf50' },
        ]}
        onPress={() => toggleStatus(item)}
      >
        <Text style={styles.taskTitle}>{item.title}</Text>
        {item.description ? (
          <Text style={styles.taskDesc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <View style={styles.taskFooter}>
          <Text style={styles.taskMeta}>
            Assigned to:{' '}
            {item.assignedToName || (item.assignedTo === user?.uid ? 'You' : 'Unknown')}
          </Text>
          <Text style={styles.statusBadge}>
            {item.status || 'todo'}
          </Text>
        </View>
        <Text style={styles.tapHint}>Tap to change status</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
    
 <TouchableOpacity
        style={{
          height:50,
          backgroundColor:"rgba(0, 7, 131, 1)",
          borderRadius:20,
          marginTop:10,
          margin:20,
          justifyContent:"center",
          alignItems:"center"

        }}
        onPress={() =>
          navigation.navigate('ProjectChat', { projectId, projectName })
        }
        >
          <Text style={{color:"#fff"}}>Back to Chat</Text>
        </TouchableOpacity>

      <View style={{ marginVertical: 8 }}>
      

 <TouchableOpacity
        style={{
          height:50,
          backgroundColor:"rgba(0, 7, 131, 1)",
          borderRadius:20,
          marginTop:10,
          margin:20,
          justifyContent:"center",
          alignItems:"center"

        }}
         onPress={() =>
            navigation.navigate('TaskForm', {
              projectId,
              projectName,
            })
          }
        >
          <Text style={{color:"#fff"}}>+ Add Task</Text>
        </TouchableOpacity>
        
      </View>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#000000ff' },
  taskItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  taskTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  taskDesc: { fontSize: 13, color: '#555' },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    alignItems: 'center',
    color:"rgba(217, 217, 217, 1)"
  },
  taskMeta: { fontSize: 12, color: '#777' },
  statusBadge: {
    color:"#fff",
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tapHint: { fontSize: 10, color: '#999', marginTop: 4 },
});
