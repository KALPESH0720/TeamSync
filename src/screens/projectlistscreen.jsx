
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function ProjectsListScreen() {

  const { user, logout } = useAuth();
  const navigation= useNavigation();

  const [projects, setProjects] = useState([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

useEffect(() => {
  if (!user?.uid) return; 

  const unsubscribe = firestore()
    .collection('projects')
    .where('members', 'array-contains', user.uid) 
    .onSnapshot(snapshot => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(list);
    });

  return () => unsubscribe();
}, [user?.uid]);


  const createProject = async () => {
  if (!newName.trim()) {
    return;
  }
  try {
    setCreating(true);
    await firestore().collection('projects').add({
      name: newName.trim(),
      description: newDesc.trim(),
      createdBy: user?.uid || null,
      createdAt: firestore.FieldValue.serverTimestamp(),
      members: user?.uid ? [user.uid] : [],
    });
    setNewName('');
    setNewDesc('');
  } catch (e) {
    console.log('Error creating project:', e);
  } finally {
    setCreating(false);
  }
};



  
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.projectItem}
      onPress={() =>
        navigation.push('ProjectChat', {
          projectId: item.id,
          projectName: item.name,
        })
      }
    >
      <Text style={styles.projectName}>{item.name}</Text>
      {item.description ? (
        <Text style={styles.projectDesc} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
      <Text style={styles.projectMeta}>Tap to open chat & tasks</Text>
    </TouchableOpacity>
  );

  return (
    
    <View style={styles.container}>
      <View style={{flexDirection:"row",height:40,justifyContent:"space-between",marginTop:40,alignItems:"center",marginBottom:20}}>
<Image source={require("../../assets/whitelogo.png")}  style={styles.logo}/>

<TouchableOpacity onPress={logout}>
  <Image style={styles.logo} source={require("../../assets/log-out.png")}/>
</TouchableOpacity>

 </View>
      <Text style={styles.header}>Projects</Text>

      <Text style={{fontSize:30,color:"#fff",fontWeight:"bold"}}>Welcome'</Text>
      <Text style={styles.subHeader}>
      {user?.displayName}
      </Text>

<Text style={{
  fontSize:20,
  margin:20,
  color:"#a1a1a1ff",
  fontWeight:"bold"
}}>Your Projects</Text>

      <FlatList
        data={projects}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

     
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
  projectItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
  logo:{
  height:"100%",
  width:"20%",
  padding:10,
},
  projectName: { fontSize: 16, fontWeight: '600', marginBottom: 4 ,color:"#fff"},
  projectDesc: { fontSize: 13, color: '#555' },
  projectMeta: { fontSize: 12, color: '#999', marginTop: 4 },
});
