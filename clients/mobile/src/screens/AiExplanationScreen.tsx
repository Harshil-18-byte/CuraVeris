import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../theme/colors';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citation?: string;
}

export function AiExplanationScreen({
  onBack,
}: {
  onBack?: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'I can explain any charge, statutory ceiling, or insurance deduction verified on your bill using gazetted government benchmarks.',
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: input };
    const reply: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      text: `Based on your audited bill, the stent charge was adjusted because NPPA Order S.O. 1335(E) legally limits Drug Eluting Stents to ₹38,260 plus applicable GST. Any higher billing is an Unfair Trade Practice.`,
      citation: 'NPPA Order S.O. 1335(E) & Consumer Protection Act 2019',
    };
    setMessages([...messages, userMsg, reply]);
    setInput('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statutory Explanation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {messages.map((m) => (
          <View
            key={m.id}
            style={[
              styles.bubble,
              m.sender === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                m.sender === 'user' ? styles.userText : styles.assistantText,
              ]}
            >
              {m.text}
            </Text>
            {m.citation && (
              <Text style={styles.citationText}>Statutory Basis: {m.citation}</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask why a charge or deduction was made..."
          placeholderTextColor="#8E8E93"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  content: {
    padding: 20,
    gap: 12,
    paddingBottom: 24,
  },
  bubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral300,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: Colors.white,
  },
  assistantText: {
    color: Colors.neutral900,
  },
  citationText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral300,
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral300,
    gap: 10,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.neutral50,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.neutral900,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  sendText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
