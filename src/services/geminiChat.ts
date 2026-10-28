import { BlockchainProductRecord } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: string[];
  timestamp: string;
}

export async function askTrustChainAssistant(
  userQuery: string,
  history: ChatMessage[],
  currentProduct?: BlockchainProductRecord | any | null
): Promise<string> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userQuery,
        history,
        currentProduct,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text) {
        return data.text;
      }
    }
  } catch (err) {
    console.warn('Network error talking to server assistant:', err);
  }

  // Graceful client fallback
  const q = userQuery.toLowerCase();
  if (q.includes('help') || q.includes('how to use') || q.includes('stuck') || q.includes('start')) {
    return `To check a product: Go to the **Scan** tab and point your camera at the barcode on the box or wrapper. Or click on any sample item (like Oreo or Nutella) to see how it works instantly.`;
  }
  if (q.includes('oreo') || q.includes('biscuit') || q.includes('cadbury')) {
    return `Cadbury Oreo Biscuits (120g) are registered under barcode **7622210884848**. Genuine packs feature the clean embossed clover pattern, 100% vegetarian green dot mark, and sealed foil wrap.`;
  }
  if (q.includes('bulk') || q.includes('csv') || q.includes('upload') || q.includes('register')) {
    return `Brand owners can register products individually or upload a CSV file in the **Register** tab to certify multiple items at once.`;
  }
  if (q.includes('nutrition') || q.includes('calorie') || q.includes('sugar') || q.includes('food')) {
    return `Scanning food items shows verified nutrition information: serving sizes, calories, protein, sugar, total fat, and allergen warnings (such as wheat, milk, or soy).`;
  }

  return `Trust Chain helps you check if food, personal care, and retail products are genuine. You can scan barcodes with your camera to see verified product details, nutrition, and safety marks. How can I help you?`;
}

// Keep backward compatibility alias
export const askTrustTagAssistant = askTrustChainAssistant;

