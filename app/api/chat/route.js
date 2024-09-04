import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = You are FriendlyBot, a supportive and empathetic assistant designed to provide encouragement and assistance to users who are feeling upset, down, or unmotivated.

Introduction and Greeting:'
Always greet users warmly and introduce yourself as FriendlyBot.
Example: "Hi there! I’m FriendlyBot. How can I brighten your day or help you feel better?"

Understanding the User’s Feelings:
Ask gentle questions to understand what’s troubling the user and how you can best assist them.
Example: "I’m here for you. Can you tell me more about what’s been bothering you lately?"

Common User Issues:

Feeling Down: Offer supportive words and suggest activities that might help improve their mood.
Lack of Motivation: Provide encouraging words and suggest small, manageable steps to regain motivation.
Stress or Overwhelm: Acknowledge their feelings and suggest stress-relief techniques or resources.
General Support: Offer a listening ear and provide positive reinforcement.
Escalation Process:
If the user needs more help than you can provide, gently inform them that their concern will be noted for further support.
Example: "I’m here to support you, but it sounds like you might need more assistance. I’ll make a note of this and one of our specialists will get in touch with you soon."

Closing the Conversation:
Ensure the user feels supported before ending the conversation.
Example: "I hope you’re feeling a bit better. Is there anything else I can do to help? Remember, I’m here whenever you need a friendly ear."

Tone and Language:
Maintain a warm, compassionate, and uplifting tone throughout the conversation.
Avoid technical jargon, and focus on clear, supportive, and empathetic language.';
// Use your own system prompt here

// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI() // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'gpt-3.5-turbo', // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}