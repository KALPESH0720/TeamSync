
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

export default function ProjectMembersScreen({ route }) {
  const { projectId, projectName } = route.params;

  const [project, setProject] = useState(null);
  const [membersDetails, setMembersDetails] = useState([]);
  const [email, setEmail] = useState('');
  const [loadingAdd, setLoadingAdd] = useState(false);

  useEffect(() => {
    const unsub = firestore()
      .collection('projects')
      .doc(projectId)
      .onSnapshot(doc => {
        setProject({ id: doc.id, ...doc.data() });
      });

    return () => unsub();
  }, [projectId]);


  useEffect(() => {
    const loadMembers = async () => {
      if (!project || !project.members || project.members.length === 0) {
        setMembersDetails([]);
        return;
      }

      const ids = project.members;
      const snap = await firestore()
        .collection('users')
        .where(firestore.FieldPath.documentId(), 'in', ids)
        .get();

      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));
      setMembersDetails(list);
    };

    loadMembers();
  }, [project]);

  const addMemberByEmail = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      Alert.alert('Error', 'Enter an email to add');
      return;
    }

    try {
      setLoadingAdd(true);
     
      const snap = await firestore()
        .collection('users')
        .where('email', '==', trimmed)
        .limit(1)
        .get();

      if (snap.empty) {
        Alert.alert('Not found', 'No user with that email');
        return;
      }

      const userDoc = snap.docs[0];
      const userId = userDoc.id;

      await firestore()
        .collection('projects')
        .doc(projectId)
        .update({
          members: firestore.FieldValue.arrayUnion(userId),
        });

      Alert.alert('Success', 'Member added to project');
      setEmail('');
    } catch (e) {
      console.log('Error adding member:', e);
      Alert.alert('Error', 'Could not add member');
    } finally {
      setLoadingAdd(false);
    }
  };

  const renderMember = ({ item }) => (
    <View style={styles.memberItem}>
      <Text style={styles.memberName}>{item.name || 'Unnamed user'}</Text>
      <Text style={styles.memberEmail}>{item.email}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Team members – {projectName || 'Project'}
      </Text>

      <Text style={styles.label}>Add member by email</Text>
      <TextInput
        style={styles.input}
        placeholder="user@example.com"
        placeholderTextColor="#9f9f9fff"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TouchableOpacity
        onPress={addMemberByEmail}
        disabled={loadingAdd}
        style={{
          backgroundColor:"#180fc3ff",
          height:40,
       justifyContent:"center",
       alignItems:"center",
       borderRadius:20,
       margin:10

        }}
      >
        <Text style={{color:"#fff"}}>{loadingAdd ? 'Adding...' : 'Add Member'}</Text>
      </TouchableOpacity>

      <Text style={[styles.label, { marginTop: 20 }]}>Current members</Text>
      <FlatList
        data={membersDetails}
        keyExtractor={item => item.id}
        renderItem={renderMember}
        ListEmptyComponent={
          <Text style={{ color: '#777', marginTop: 8 }}>
            No members yet.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#000000ff' },
  header: { fontSize: 18, fontWeight: '700', marginBottom: 16,color:"#fff" },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 4,color:"#fff" },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    height:40,
    color:"rgba(175, 175, 175, 1)"
  },
  memberItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  memberName: { fontSize: 14, fontWeight: '600',color:"#fff" },
  memberEmail: { fontSize: 13, color: '#c2c2c2ff' },
});
