import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize OpenAI client (supports OpenAI, DeepSeek, minimal standard APIs)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

const SYSTEM_PROMPT = `
You are an expert AI diagram generation engine.
Your task is to translate user ideas into a directed flowchart or diagram.

You MUST only output valid JSONL (JSON Lines). Every single line must be a valid JSON object.
Do NOT wrap your output in markdown blocks like \`\`\`json or \`\`\`jsonl.
Do NOT output any introductory or explanatory text.
Each line must represent exactly one Node or one Edge.

For a NODE, the JSON format must be:
{"type": "node", "id": "n1", "label": "Start Process"}
{"type": "node", "id": "n2", "label": "Check Token"}

For an EDGE, the JSON format must be:
{"type": "edge", "id": "e1", "source": "n1", "target": "n2", "label": "Yes"}

Rules:
1. "id" must be a unique string for the element.
2. "source" and "target" for edges must refer to valid node "id"s that you have already output.
3. Keep labels concise (max 15 characters).
4. Output logically ordered steps.
5. Provide between 4 to 12 nodes typically.
`;

app.post('/api/chat', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  try {
    const stream = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      stream: true,
      temperature: 0.2, // Low temperature for consistent JSON
    });

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        // We write the raw chunks to the client. The frontend reader
        // will buffer and split by newline to parse JSON.
        res.write(content);
      }
    }

    res.end();
  } catch (error) {
    console.error('LLM API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate diagram stream' });
    } else {
      res.end();
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
