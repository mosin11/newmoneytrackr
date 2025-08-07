// Smart categorization based on description keywords
const categoryKeywords = {
  'Food & Dining': [
    'restaurant', 'food', 'cafe', 'pizza', 'burger', 'coffee', 'tea', 'lunch', 'dinner', 'breakfast',
    'swiggy', 'zomato', 'dominos', 'mcdonalds', 'kfc', 'subway', 'starbucks', 'grocery', 'vegetables',
    'fruits', 'milk', 'bread', 'rice', 'dal', 'chicken', 'mutton', 'fish', 'snacks', 'juice'
  ],
  'Transportation': [
    'uber', 'ola', 'taxi', 'bus', 'train', 'metro', 'auto', 'rickshaw', 'fuel', 'petrol', 'diesel',
    'parking', 'toll', 'flight', 'airline', 'airport', 'cab', 'transport', 'travel', 'ticket'
  ],
  'Shopping': [
    'amazon', 'flipkart', 'myntra', 'ajio', 'shopping', 'clothes', 'shirt', 'pants', 'shoes',
    'electronics', 'mobile', 'laptop', 'headphones', 'book', 'gift', 'online', 'store', 'mall'
  ],
  'Bills & EMI': [
    'electricity', 'water', 'gas', 'internet', 'wifi', 'mobile bill', 'phone bill', 'emi', 'loan',
    'credit card', 'insurance', 'premium', 'rent', 'maintenance', 'society', 'utility', 'bill'
  ],
  'Healthcare': [
    'doctor', 'hospital', 'medicine', 'pharmacy', 'medical', 'health', 'clinic', 'dentist',
    'checkup', 'treatment', 'surgery', 'ambulance', 'lab test', 'x-ray', 'scan', 'consultation'
  ],
  'Personal Care': [
    'salon', 'haircut', 'spa', 'massage', 'cosmetics', 'skincare', 'shampoo', 'soap', 'toothpaste',
    'grooming', 'beauty', 'parlour', 'gym', 'fitness', 'yoga', 'workout'
  ],
  'Investment': [
    'mutual fund', 'sip', 'stock', 'share', 'investment', 'fd', 'deposit', 'gold', 'crypto',
    'bitcoin', 'trading', 'portfolio', 'dividend', 'interest', 'savings'
  ],
  'Income': [
    'salary', 'wage', 'freelance', 'consulting', 'bonus', 'incentive', 'commission', 'profit',
    'dividend', 'interest', 'rental', 'business', 'income', 'earning', 'payment received'
  ],
  'Transfer': [
    'transfer', 'sent', 'received', 'upi', 'paytm', 'gpay', 'phonepe', 'bank transfer', 'neft',
    'rtgs', 'imps', 'wallet', 'cash', 'withdraw', 'deposit', 'atm'
  ],
  'Entertainment': [
    'movie', 'cinema', 'netflix', 'amazon prime', 'spotify', 'youtube', 'game', 'gaming',
    'concert', 'show', 'event', 'party', 'club', 'bar', 'entertainment', 'subscription'
  ]
}

export function suggestCategory(description: string): string {
  const desc = description.toLowerCase()
  
  // Calculate scores for each category
  const scores: Record<string, number> = {}
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    scores[category] = 0
    
    for (const keyword of keywords) {
      if (desc.includes(keyword.toLowerCase())) {
        // Exact match gets higher score
        if (desc === keyword.toLowerCase()) {
          scores[category] += 10
        } else if (desc.startsWith(keyword.toLowerCase()) || desc.endsWith(keyword.toLowerCase())) {
          scores[category] += 5
        } else {
          scores[category] += 2
        }
      }
    }
  }
  
  // Find category with highest score
  const bestMatch = Object.entries(scores).reduce((max, [category, score]) => 
    score > max.score ? { category, score } : max, 
    { category: 'Other Expense', score: 0 }
  )
  
  return bestMatch.score > 0 ? bestMatch.category : 'Other Expense'
}

export function getSmartSuggestions(description: string, recentTransactions: any[] = []): string[] {
  const suggestions = new Set<string>()
  
  // Add AI suggestion
  const aiSuggestion = suggestCategory(description)
  suggestions.add(aiSuggestion)
  
  // Add suggestions from recent similar transactions
  const desc = description.toLowerCase()
  recentTransactions.forEach(transaction => {
    if (transaction.description.toLowerCase().includes(desc) || 
        desc.includes(transaction.description.toLowerCase())) {
      suggestions.add(transaction.category)
    }
  })
  
  // Add common categories based on first word
  const firstWord = desc.split(' ')[0]
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => keyword.toLowerCase().includes(firstWord))) {
      suggestions.add(category)
    }
  }
  
  return Array.from(suggestions).slice(0, 3)
}