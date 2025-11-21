import React from "react";
import {Image, Text, TouchableOpacity, View} from "react-native"
const onboarding=({navigation})=>{
return(
    <View style={{backgroundColor:"rgba(27, 7, 174, 1)",width:"100%"}}>
<Image
style={{alignItems:"center",justifyContent:"center",height:"70%", width:"90%",marginTop:10}}
source={require("../../assets/dev.png")}
/>

<Text style={{color:"#ffff",fontSize:45,fontWeight:"bold",marginBottom:10}}>Welcome to TeamSync</Text>
<Text style={{color:"rgba(225, 220, 228, 1)",fontSize:15}}>Set up your team’s home base. Already have an invite? Just click the link and you’re in.</Text>


<TouchableOpacity
onPress={() => navigation.navigate("Login")}
style={{backgroundColor:"rgba(255, 255, 255, 1)",height:50,margin:10,borderRadius:15,justifyContent:"center",alignItems:"center"}}
>
    <Text style={{color:"#000000ff",fontSize:15,fontWeight:"bold"}}>Let's Build</Text>
</TouchableOpacity>
    </View>
    
)

}

export default onboarding;