import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../AuthContext';

export default function ProjectChatScreen({ route, navigation }) {
  const { projectId, projectName } = route.params;
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: projectName || 'Project Chat',
      headerStyle: {
        backgroundColor: '#1F1F1F',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#2A2A2A',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
      },
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 8, marginRight: 8 }}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ProjectTasks', {
                projectId,
                projectName,
              })
            }
            style={styles.headerButton}
          >
            <Image
              source={require("../../assets/task.png")}
              style={{ width: 24, height: 24, resizeMode: 'contain' }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerButton, { marginLeft: 8 }]}
            onPress={() =>
              navigation.navigate('ProjectMembers', {
                projectId,
                projectName,
              })
            }
          >
            <Image
              source={require("../../assets/coworking.png")}
              style={{ width: 24, height: 24, resizeMode: 'contain' }}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, projectId, projectName]);

  useEffect(() => {
    const ref = firestore()
      .collection('projects')
      .doc(projectId )
      .collection('chat')
      .orderBy('createdAt', 'asc');

    const unsubscribe = ref.onSnapshot(snapshot => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(list);
      

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => unsubscribe();
  }, [projectId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      setSending(true);
      await firestore()
        .collection('projects')
        .doc(projectId)
        .collection('chat')
        .add({
          text: text.trim(),
          senderId: user?.uid || null,
          senderName: user?.displayName || user?.email || 'Unknown',
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      setText('');
    } catch (e) {
      console.log('Error sending message:', e);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item, index }) => {
    const isOwn = item.senderId === user?.uid;
    const createdAt = item.createdAt?.toDate
      ? item.createdAt.toDate()
      : null;
    const timeStr = createdAt
      ? createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

   
    const prevItem = index > 0 ? messages[index - 1] : null;
    const prevDate = prevItem?.createdAt?.toDate?.();
    const currentDate = createdAt;
    
    const showDateSeparator = !prevDate || 
      (currentDate && prevDate.toDateString() !== currentDate.toDateString());

    const dateLabel = currentDate
      ? currentDate.toDateString() === new Date().toDateString()
        ? 'Today'
        : currentDate.toLocaleDateString([], { month: 'short', day: 'numeric' })
      : '';

    return (
      <>
        {showDateSeparator && dateLabel && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>{dateLabel}</Text>
          </View>
        )}
        <View
          style={[
            styles.messageContainer,
            isOwn ? styles.ownMessage : styles.otherMessage,
          ]}
        >
          {!isOwn && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
            {item.text}
          </Text>
          <Text style={[styles.timeText, isOwn && styles.ownTimeText]}>
            {timeStr}
          </Text>
        </View>
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={styles.inputContainer}>
 

        <TextInput
          style={styles.input}
          placeholder="Type a message"
          placeholderTextColor="#6B6B6B"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />

        

        <TouchableOpacity
          onPress={sendMessage}
          disabled={sending || !text.trim()}
          style={[
            styles.sendButton,
            (!text.trim() || sending) && styles.sendButtonDisabled,
          ]}
        >
          <Image
            source={require("../../assets/send.png")}
            style={{ width: 20, height: 20, resizeMode: 'contain', tintColor: '#fff' }}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerButton: {
    padding: 6,
    borderRadius: 6,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 80,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: '#6B6B6B',
    fontWeight: '500',
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageContainer: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 8,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0122a5ff',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A2A2A',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A0A0A0',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 10,
    color: '#B0B0B0',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownTimeText: {
    color: '#FFE0E0',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1F1F1F',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 100,
    marginHorizontal: 6,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1068ffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#3A3A3A',
    opacity: 0.5,
  },
});