
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../AuthContext";

const Signup = ({ navigation }) => {
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please enter name, email and password");
      return;
    }
    try {
      await signup(name.trim(), email.trim().toLowerCase(), password);

    } catch (e) {
      Alert.alert("Signup failed", e.message);
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Sign Up to continue</Text>
      <View style={styles.signincontainer}>
        

        <Text style={styles.text}>Name*</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Enter your name..."
        />

        <Text style={styles.text}>Email*</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="Enter your email..."
          autoCapitalize="none"
        />

        <Text style={styles.text}>Password*</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}

          style={styles.input}
          placeholder="Enter your password..."
          secureTextEntry
        />

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={{ color: "#0078e2ff", marginTop: 20 }}>
            I have an account
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={onSignup}>
          <Text style={{ color: "#fff", fontSize: 20 }}>Sign Up</Text>
        </TouchableOpacity>

        <View style={{ alignItems: "center", marginTop: 30, height: 400 }}>
          <Image
            style={{
              width: "80%",
              height: "40%",
              alignItems: "center",
              justifyContent: "center",
            }}
            source={require("../../../assets/Teamsync.png")}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: "#ffffffff",
    fontSize: 55,
    marginTop: 30,
    
    padding:30,
  },
  container: {
    backgroundColor: "#000000ff",
    flex: 1,
  
  },
  signincontainer: {
    marginTop:10,
    backgroundColor: "rgba(255, 252, 252, 0.13)",
   paddingTop:20,
    padding: 40,
    borderRadius: 100,
    marginHorizontal: 16,
  },
  input: {
    borderBottomWidth: 2,
    color:"rgba(183, 183, 183, 1)"
  },
  text: {
    fontSize: 15,
    color: "#aaa8a8ff",
    marginTop: 50,
  },
  button: {
    backgroundColor: "#004cd8ff",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    height: 60,
    borderRadius: 20,
  },
});

export default Signup;
