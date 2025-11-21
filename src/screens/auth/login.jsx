import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from '../../AuthContext';

const login=({navigation})=>{

    const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Enter email and password');
      return;
    }
    try {
      await login(email.trim(), password);
    } catch (e) {
      Alert.alert('Login failed', e.message);
    }
  };
return(
  <View style={styles.container}>
    <View style={styles.signincontainer}>
              <Text style={styles.title}>
  Sign In to Begin
</Text>
<Text style={styles.text}>Email*</Text>
<TextInput
value={email}
onChangeText={text=>setEmail(text)}
style={styles.input}
placeholder="Enter your email..."
/>
<Text style={styles.text}>Password*</Text>
<TextInput
value={password}
onChangeText={text=>setPassword(text)}
style={styles.input}
placeholder="Enter your password..."
/>
<TouchableOpacity onPress={() => navigation.navigate('Signup')}>
  <Text style={{color:"#0078e2ff", marginTop:20}}>
    Don't have an account? Signup
  </Text>
</TouchableOpacity>


<TouchableOpacity
onPress={onLogin}
style={styles.button}
>
  <Text style={{
    color:"#ffffffff",
    fontSize:20
  }}>Sign In</Text>
</TouchableOpacity>
<View style={{alignItems:"center",marginTop:30,height:400}}>
   <Image
            style ={{width: "80%", height:"40%",alignItems:"center",justifyContent:"center"}}
         source={require("../../../assets/Teamsync.png")} />
  </View>
  </View>
  </View>
)
}

const styles=StyleSheet.create({
  title:{
    color:"#ffffffff",
    fontSize:55,
    marginTop:30,
    marginBottom:40

  },
  container:{
    backgroundColor:"#000000ff",
    height:250,
  
  },
  signincontainer:{
    backgroundColor:"rgba(129, 171, 203, 0.13)",
    marginTop:30,
padding:40,
borderRadius:100,

  },
  input:{
    borderBottomWidth:2,
  },
  text:{
    fontSize:15,
    color:"#aaa8a8ff",
    marginTop:50
  },
  button:{
    backgroundColor:"#000ed8ff",
    justifyContent:"center",
    alignItems:"center",
    marginTop:40,
    height:60,
    borderRadius:20,

    
  }

})

export default login;