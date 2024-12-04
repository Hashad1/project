import OpenAI from 'openai';

const ASSISTANT_ID = 'asst_CJpNbyOYJHH3HNHfqWm0xX3U';
const API_KEY = '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';

const openai = new OpenAI({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true
});

export async function createThread() {
  const thread = await openai.beta.threads.create();
  return thread.id;
}

export async function sendMessage(threadId: string, message: string) {
  // Check for any running runs first
  const runs = await openai.beta.threads.runs.list(threadId);
  const runningRun = runs.data.find(run => 
    ['in_progress', 'queued'].includes(run.status)
  );

  // If there's a running run, wait for it to complete
  if (runningRun) {
    await waitForRun(threadId, runningRun.id);
  }

  // Now create the new message and run
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: message,
  });

  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: ASSISTANT_ID,
  });

  return run.id;
}

async function waitForRun(threadId: string, runId: string) {
  let attempts = 0;
  const maxAttempts = 30; // Maximum 30 seconds wait
  
  while (attempts < maxAttempts) {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    
    if (['completed', 'failed', 'cancelled', 'expired'].includes(run.status)) {
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  
  try {
    await openai.beta.threads.runs.cancel(threadId, runId);
  } catch (error) {
    console.error('Error cancelling run:', error);
  }
}

export async function* streamResponse(threadId: string, runId: string) {
  let run;
  let lastMessageId: string | null = null;
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

      if (latestMessage.id !== lastMessageId) {
        lastMessageId = latestMessage.id;
        if (latestMessage.content[0].type === 'text') {
          const text = latestMessage.content[0].text.value;
          yield text;

          // Convert text to speech
          const speechResponse = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: text,
          });

          const audioBlob = await speechResponse.blob();
          yield { audio: audioBlob };
        }
      }
      break;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  } while (true);
}
