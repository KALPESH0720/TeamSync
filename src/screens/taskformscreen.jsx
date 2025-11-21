import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../AuthContext';

export default function TaskFormScreen({ route, navigation }) {
  const { projectId, projectName } = route.params;
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const [members, setMembers] = useState([]);     
  const [assignee, setAssignee] = useState(null);  
  useLayoutEffect(() => {
    navigation.setOptions({
      title: projectName ? `Add Task - ${projectName}` : 'Add Task',
      headerStyle: {
        backgroundColor: '#1d1d1dff',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        color: '#fff',
      },
    });
  }, [navigation, projectName]);


  useEffect(() => {
    const loadMembers = async () => {
      try {
        const projectDoc = await firestore()
          .collection('projects')
          .doc(projectId)
          .get();

        const data = projectDoc.data();
        const memberIds = data?.members || [];

        if (!memberIds.length) {
          setMembers([]);
          setAssignee(null);
          return;
        }

   
        const snap = await firestore()
          .collection('users')
          .where(firestore.FieldPath.documentId(), 'in', memberIds)
          .get();

        const list = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }));

        setMembers(list);

        const me = list.find(m => m.id === user?.uid);
        setAssignee(me || list[0]);
      } catch (e) {
        console.log('Error loading members:', e);
      }
    };

    loadMembers();
  }, [projectId, user?.uid]);

  const createTask = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Task title is required');
      return;
    }

    const assignedUser = assignee || {
      id: user?.uid || null,
      name: user?.displayName || user?.email || 'Unknown',
    };

    try {
      setCreating(true);
      await firestore()
        .collection('projects')
        .doc(projectId)
        .collection('tasks')
        .add({
          title: title.trim(),
          description: description.trim(),
          status: 'todo',
          assignedTo: assignedUser.id,
          assignedToName: assignedUser.name || 'Unknown',
          createdBy: user?.uid || null,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      navigation.goBack();
    } catch (e) {
      console.log('Error creating task:', e);
      Alert.alert('Error', 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Task Title</Text>
      <TextInput
        style={[styles.input, { height: 40 }]}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter task title"
        placeholderTextColor="#a0a0a0ff"
      />

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
        placeholderTextColor="#a0a0a0ff"
        multiline
      />

    
      <Text style={[styles.label, { marginTop: 12 }]}>Assign to</Text>
      {members.length === 0 ? (
        <Text style={{ color: '#888', marginBottom: 8 }}>
          No team members found. Add members in the Team screen first.
        </Text>
      ) : (
        <View style={styles.assigneeRow}>
          {members.map(m => {
            const selected = assignee?.id === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                onPress={() => setAssignee(m)}
                style={[
                  styles.assigneeChip,
                  selected && styles.assigneeChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.assigneeText,
                    selected && { color: '#fff' },
                  ]}
                >
                  {m.name || m.email}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={{ marginTop: 16 }}>
        <TouchableOpacity
          style={styles.button}
          onPress={createTask}
          disabled={creating}
        >
          <Text style={{ color: '#fff' }}>
            {creating ? 'Creating...' : 'Create Task'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#000000ff' },
  label: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
    color: 'rgba(179, 179, 179, 1)',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    color: '#fff',
  },
  button: {
    height: 50,
    backgroundColor: 'rgba(0, 7, 131, 1)',
    borderRadius: 20,
    marginTop: 10,
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assigneeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  assigneeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#555',
    marginRight: 8,
    marginBottom: 8,
  },
  assigneeChipSelected: {
    backgroundColor: '#180fc3ff',
    borderColor: '#180fc3ff',
  },
  assigneeText: {
    color: '#ddd',
    fontSize: 13,
  },
});
