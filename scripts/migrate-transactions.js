const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true },
  type: { type: String, required: true, enum: ['in', 'out'] },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true }
}, { timestamps: true })

const Transaction = mongoose.model('Transaction', transactionSchema)

// Auto-categorization function
function categorizeTransaction(description) {
  const desc = description.toLowerCase()
  
  // Food & Dining
  if (desc.includes('food') || desc.includes('restaurant') || desc.includes('pizza') || 
      desc.includes('biryani') || desc.includes('dosa') || desc.includes('pani puri') ||
      desc.includes('swiggy') || desc.includes('zomato') || desc.includes('dominos') ||
      desc.includes('kfc') || desc.includes('mcdonalds') || desc.includes('burger') ||
      desc.includes('cafe') || desc.includes('tea') || desc.includes('coffee') ||
      desc.includes('breakfast') || desc.includes('lunch') || desc.includes('dinner') ||
      desc.includes('meal') || desc.includes('eat') || desc.includes('curd') ||
      desc.includes('eggs') || desc.includes('ponugolu')) {
    return 'Food & Dining'
  }
  
  // Transportation
  if (desc.includes('petrol') || desc.includes('fuel') || desc.includes('gas') ||
      desc.includes('uber') || desc.includes('ola') || desc.includes('taxi') ||
      desc.includes('auto') || desc.includes('bus') || desc.includes('train') ||
      desc.includes('metro') || desc.includes('transport') || desc.includes('travel')) {
    return 'Transportation'
  }
  
  // Healthcare
  if (desc.includes('medicine') || desc.includes('doctor') || desc.includes('hospital') ||
      desc.includes('pharmacy') || desc.includes('medical') || desc.includes('health') ||
      desc.includes('clinic') || desc.includes('treatment')) {
    return 'Healthcare'
  }
  
  // Shopping & Groceries
  if (desc.includes('grocery') || desc.includes('vegetables') || desc.includes('fruits') ||
      desc.includes('shopping') || desc.includes('market') || desc.includes('store') ||
      desc.includes('amazon') || desc.includes('flipkart') || desc.includes('myntra') ||
      desc.includes('water')) {
    return 'Shopping'
  }
  
  // Personal Care
  if (desc.includes('salon') || desc.includes('hair') || desc.includes('beauty') ||
      desc.includes('spa') || desc.includes('grooming')) {
    return 'Personal Care'
  }
  
  // Bills & EMI
  if (desc.includes('emi') || desc.includes('bill') || desc.includes('electricity') ||
      desc.includes('water bill') || desc.includes('phone') || desc.includes('internet') ||
      desc.includes('credit card') || desc.includes('loan') || desc.includes('icici') ||
      desc.includes('hdfc') || desc.includes('kotak')) {
    return 'Bills & EMI'
  }
  
  // Investment
  if (desc.includes('investment') || desc.includes('mutual fund') || desc.includes('mf') ||
      desc.includes('sip') || desc.includes('stocks') || desc.includes('groww') ||
      desc.includes('navi') || desc.includes('zerodha')) {
    return 'Investment'
  }
  
  // Income
  if (desc.includes('salary') || desc.includes('received') || desc.includes('refund') ||
      desc.includes('cashback') || desc.includes('bonus') || desc.includes('income')) {
    return 'Income'
  }
  
  // Transfer
  if (desc.includes('sent to') || desc.includes('transfer') || desc.includes('amount sent')) {
    return 'Transfer'
  }
  
  return 'Other Expense'
}

// Parse date function
function parseDate(dateStr) {
  if (!dateStr) return new Date()
  
  // Handle ISO date format
  if (dateStr.includes('T') && dateStr.includes('Z')) {
    return new Date(dateStr)
  }
  
  // Handle DD-MMM-YYYY HH:MM AM/PM format
  if (dateStr.includes('-') && (dateStr.includes('AM') || dateStr.includes('PM'))) {
    const [datePart, timePart] = dateStr.split(' ')
    const [day, month, year] = datePart.split('-')
    
    const monthMap = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    }
    
    const monthNum = monthMap[month] || '01'
    const formattedDate = `${year}-${monthNum}-${day.padStart(2, '0')}`
    
    return new Date(`${formattedDate} ${timePart}`)
  }
  
  return new Date(dateStr)
}

async function migrateTransactions() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/moneytrackr')
    console.log('Connected to MongoDB')
    
    // Read JSON file
    const jsonPath = path.join(__dirname, '..', 'cashbook.transactions.json')
    const rawData = fs.readFileSync(jsonPath, 'utf8')
    const transactions = JSON.parse(rawData)
    
    console.log(`Found ${transactions.length} transactions to migrate`)
    
    let migrated = 0
    let skipped = 0
    
    for (const tx of transactions) {
      try {
        // Skip if already in new format
        if (tx.userEmail && tx.category) {
          skipped++
          continue
        }
        
        // Convert old format to new format
        const newTransaction = {
          userEmail: tx.email || 'mosinzhb32@gmail.com',
          type: tx.type === 'cash_in' ? 'in' : 'out',
          amount: tx.amount,
          category: categorizeTransaction(tx.description),
          description: tx.description,
          date: parseDate(tx.date)
        }
        
        // Create transaction
        await Transaction.create(newTransaction)
        migrated++
        
        if (migrated % 10 === 0) {
          console.log(`Migrated ${migrated} transactions...`)
        }
        
      } catch (error) {
        console.error(`Error migrating transaction:`, error.message)
      }
    }
    
    console.log(`Migration completed: ${migrated} migrated, ${skipped} skipped`)
    
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

migrateTransactions()