'use client';

import { Box, Button, Stack, TextField } from '@mui/material';
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm RateBot, how can I cheer you up.",
    },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Define predefined questions and answers
const predefinedResponses = {
  'hello': "Hi there! I’m RateBot. How can I assist you in finding or learning about your professor?",
  'hi': "Hi there! I’m RateBot. How can I assist you in finding or learning about your professor?",
  'hey': "Hi there! I’m RateBot. How can I assist you in finding or learning about your professor?",
  'i need help': "I'm here to help! What do you need to know about your professor?",
  'which professor should i choose': "It depends on what you’re looking for! Do you want someone who’s tough but fair, or someone who makes learning fun?",
  'stanford': "John Mitchell (Stanford): Rating: 4.5/5. Description: John Mitchell is known for his engaging lectures and deep knowledge in computer security and programming languages. Students appreciate his clear explanations but note that his courses can be challenging.",
  'princeton': "Robert Sedgewick (Princeton): Rating: 4.7/5. Description: Robert Sedgewick is highly regarded for his work in algorithms and data structures. His teaching is clear and insightful, making complex topics more accessible. His textbooks are widely used and respected.",
  'berkeley': "Anant Sahai (UC Berkeley): Rating: 4.3/5. Description: Anant Sahai is well-liked for his enthusiasm and ability to make abstract concepts in electrical engineering and computer science more understandable. However, his courses are known to be rigorous.",
  'harvard': "David Malan (Harvard): Rating: 4.8/5. Description: David Malan is famous for his introductory computer science course, CS50, which is well-known for being engaging, accessible, and thorough. Students often praise his dynamic teaching style and the course's well-structured content.",
  'mit': "Erik Demaine (MIT): Rating: 4.9/5. Description: Erik Demaine is a celebrated professor known for his work in algorithms and computational geometry. Students find his courses intellectually stimulating, though they can be challenging. His passion for the subject is infectious.",
  'caltech': "Yaser Abu-Mostafa (Caltech): Rating: 4.6/5. Description: Yaser Abu-Mostafa is highly respected for his expertise in machine learning. His teaching style is clear and methodical, making difficult topics more approachable. His courses are considered some of the best at Caltech.",
  'university of illinois': "Tarek Abdelzaher (University of Illinois): Rating: 4.4/5. Description: Tarek Abdelzaher is known for his work in real-time and embedded systems. Students appreciate his deep knowledge and the practical applications of his teachings, though some find his courses demanding.",
  'georgia tech': "Mark Guzdial (Georgia Tech): Rating: 4.5/5. Description: Mark Guzdial is known for his contributions to computing education. He focuses on innovative methods to teach programming and computing, making his courses enjoyable and informative."
};


  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const newMessage = { role: 'user', content: message };
    setMessage('');
    setMessages((prevMessages) => [...prevMessages, newMessage, { role: 'assistant', content: '' }]);

    setIsLoading(true);

    // Convert message to lowercase for case-insensitive matching
    const responseText = predefinedResponses[message.trim().toLowerCase()] || "Sorry, I don't understand the question.";

    // Simulate streaming response
    const simulatedStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          // Simulate delay for streaming
          await new Promise(resolve => setTimeout(resolve, 500));

          const text = encoder.encode(responseText);
          controller.enqueue(text);
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    const reader = simulatedStream.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        setMessages((prevMessages) => {
          const lastMessage = prevMessages.pop(); // Remove the placeholder
          return [...prevMessages, { ...lastMessage, content: lastMessage.content + text }];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ 
        backgroundImage: 'url(/rainy.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        //padding: { xs: '2%', sm: '1%' },
      
      }}
    >
      <Stack
        direction="column"
        width="90%"
        maxWidth="500px"
        height="70%"
        border="1px solid #ddd"
        borderRadius={4}
        boxShadow={3}
        p={2}
        spacing={3}
        bgcolor="white"
      >
        <Stack direction="column" spacing={2} flexGrow={1} overflow="auto">
          {messages.map((message, index) => (
            <Box key={index} display="flex" justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}>
              <Box
                bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                color="white"
                borderRadius={10}
                p={2}
                m={0.5}
                boxShadow={2}
                maxWidth="75%"
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
          />
          <Button variant="contained" onClick={sendMessage} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}