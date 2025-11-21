import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../AuthContext';

export default function AddProjectScreen({ navigation }) {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const createProject = async () => {
    if (!name.trim()) return;
    try {
      setCreating(true);
      await firestore().collection('projects').add({
        name: name.trim(),
        description: desc.trim(),
        createdBy: user?.uid || null,
        createdAt: firestore.FieldValue.serverTimestamp(),
        members: user?.uid ? [user.uid] : [],
      });
      navigation.goBack();
    } catch (e) {
      console.log('create project error:', e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
       <View style={styles.newProjectBox}>
             <Text style={styles.sectionTitle}>Create New Project</Text>
     
     <Text style={styles.txt}>Project name*</Text>
             <TextInput
               placeholder="Project name"
               value={name}
               onChangeText={setName}
               style={styles.input}
             />
             <Text style={styles.txt}>description*</Text>
             <TextInput
               placeholder="Short description"
               value={desc}
               onChangeText={setDesc}
               style={[styles.input, { height: 60 }]}
               multiline
             />
             <TouchableOpacity
             style={{
               backgroundColor:"rgba(1, 12, 172, 1)",
               height:40,
               justifyContent:"center",
               alignItems:"center",
               padding:10,
               borderRadius:20
             }}
               onPress={createProject}
               disabled={creating}
             >
               <Text style={{color:"#fff",fontSize:16}}>{creating ? 'Creating...' : 'Create Project'}</Text>
             </TouchableOpacity>
           
           </View>
    </View>
  );
}

const styles = StyleSheet.create({
   container: {
     flex: 1, 
     padding: 16,
      backgroundColor: '#000000ff'
     },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subHeader: { fontSize: 14, marginBottom: 12, color: '#555',color:"#c0c0c0ff" },
  newProjectBox: {
    borderWidth: 1,
    borderColor: '#6f0fff87',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 25, fontWeight: '600', marginBottom: 8,color:"#fff", marginBottom:10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 8,
    height:40,
    marginBottom: 8,
    color:"#fff"

  },
  txt:{
    color:"#fff",
    fontSize:16,
   margin:10
  },
  
 
});
