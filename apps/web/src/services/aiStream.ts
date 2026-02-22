import { AIGeneratedItem } from '@koboard/editor';

export async function generateDiagramStream(
  prompt: string, 
  onItemParsed: (item: AIGeneratedItem) => void,
  onComplete: () => void,
  onError?: (err: Error) => void
) {
  try {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No readable stream returned from the server.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);
          
          if (line) {
            try {
              const parsedItem = JSON.parse(line) as AIGeneratedItem;
              // Add robustness in case the LLM outputs wrapping arrays or bad shapes
              if (parsedItem && (parsedItem.type === 'node' || parsedItem.type === 'edge')) {
                onItemParsed(parsedItem);
              }
            } catch (e) {
              console.warn('Failed to parse a JSONL line from stream:', line, e);
            }
          }
        }
      }

      if (done) {
        // flush the rest 
        if (buffer.trim()) {
           try {
              const parsedItem = JSON.parse(buffer.trim()) as AIGeneratedItem;
              if (parsedItem && (parsedItem.type === 'node' || parsedItem.type === 'edge')) {
                onItemParsed(parsedItem);
              }
            } catch (e) {
              console.warn('Failed to parse final JSONL line:', buffer, e);
            }
        }
        break;
      }
    }

    onComplete();
  } catch (error) {
    console.error('generateDiagramStream error:', error);
    if (onError) onError(error instanceof Error ? error : new Error(String(error)));
  }
}
