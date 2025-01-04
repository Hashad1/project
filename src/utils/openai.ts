import OpenAI from 'openai';

<<<<<<< HEAD
const ASSISTANT_ID = import.meta.env.VITE_OPENAI_ASSISTANT_ID || 'asst_CJpNbyOYJHH3HNHfqWm0xX3U';
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!API_KEY) {
  console.error('OpenAI API key is not set. Please set VITE_OPENAI_API_KEY environment variable.');
}
=======
const ASSISTANT_ID = 'asst_CJpNbyOYJHH3HNHfqWm0xX3U';
const API_KEY = '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';
>>>>>>> beaa3022244824d7ff68c3273231ad1cfa470088

const openai = new OpenAI({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true
});

export async function createThread() {
  try {
    const thread = await openai.beta.threads.create();
    return thread.id;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
}

export async function sendMessage(threadId: string, message: string) {
  try {
    // Create the new message
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });

    // Create and start a new run
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID,
    });

    return run.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function streamResponse(threadId: string, runId: string, onChunk: (chunk: string) => void) {
  let run;
  let attempts = 0;
  const maxAttempts = 60;

  do {
    if (attempts >= maxAttempts) {
      throw new Error('Response timeout');
    }

    run = await openai.beta.threads.runs.retrieve(threadId, runId);

    if (run.status === 'failed') {
      throw new Error('Assistant run failed');
    }

    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(threadId);
      const latestMessage = messages.data[0];

      if (latestMessage.content[0].type === 'text') {
        const text = latestMessage.content[0].text.value;
        onChunk(text);
        await generateSpeech(text);
      }
      break;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  } while (true);
}
<<<<<<< HEAD

export async function generateSpeech(text: string) {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    const blob = new Blob([await mp3.arrayBuffer()], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();

    // Clean up the URL when done
    audio.addEventListener('ended', () => {
      URL.revokeObjectURL(url);
    });
  } catch (error) {
    console.error('Error generating speech:', error);
  }
}
=======
>>>>>>> beaa3022244824d7ff68c3273231ad1cfa470088
