import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Transaction from '@/models/Transaction'
import fs from 'fs'
import path from 'path'

function categorizeTransaction(description: string): string {
  const desc = description.toLowerCase()
  
  if (desc.includes('food') || desc.includes('pizza') || desc.includes('biryani') || 
      desc.includes('dosa') || desc.includes('pani puri') || desc.includes('curd') ||
      desc.includes('eggs') || desc.includes('ponugolu')) {
    return 'Food & Dining'
  }
  
  if (desc.includes('petrol') || desc.includes('fuel')) {
    return 'Transportation'
  }
  
  if (desc.includes('medicine') || desc.includes('health')) {
    return 'Healthcare'
  }
  
  if (desc.includes('grocery') || desc.includes('fruits') || desc.includes('water')) {
    return 'Shopping'
  }
  
  if (desc.includes('salon') || desc.includes('hair')) {
    return 'Personal Care'
  }
  
  if (desc.includes('emi') || desc.includes('credit card') || desc.includes('bill')) {
    return 'Bills & EMI'
  }
  
  if (desc.includes('investment') || desc.includes('groww') || desc.includes('navi')) {
    return 'Investment'
  }
  
  if (desc.includes('salary') || desc.includes('received') || desc.includes('refund')) {
    return 'Income'
  }
  
  if (desc.includes('sent to') || desc.includes('transfer')) {
    return 'Transfer'
  }
  
  return 'Other Expense'
}

function parseDate(dateStr: string): Date {
  if (dateStr.includes('-') && (dateStr.includes('AM') || dateStr.includes('PM'))) {
    const [datePart, timePart] = dateStr.split(' ')
    const [day, month, year] = datePart.split('-')
    
    const monthMap: { [key: string]: string } = {
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

export async function POST() {
  try {
    await dbConnect()
    
    // Read JSON file
    const jsonPath = path.join(process.cwd(), 'cashbook.transactions.json')
    const rawData = fs.readFileSync(jsonPath, 'utf8')
    const transactionsData = JSON.parse(rawData)
    
    let migrated = 0
    let skipped = 0
    
    for (const tx of transactionsData) {
      try {
        // Skip if already in new format
        if (tx.userEmail && tx.category) {
          skipped++
          continue
        }
        
        const newTransaction = {
          userEmail: tx.email || 'mosinzhb32@gmail.com',
          type: tx.type === 'cash_in' ? 'in' : 'out',
          amount: tx.amount,
          category: categorizeTransaction(tx.description),
          description: tx.description,
          date: parseDate(tx.date)
        }
        
        await Transaction.create(newTransaction)
        migrated++
        
      } catch (error) {
        console.error(`Error migrating transaction:`, error)
      }
    }
    
    return NextResponse.json({ 
      message: `Migration completed: ${migrated} migrated, ${skipped} skipped`,
      migrated,
      skipped
    })
    
  } catch (error) {
    console.error('Migration failed:', error)
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
  }
}