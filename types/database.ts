export type LedgerEntry = {
  id: string
  user_id: string
  amount: number
  type: 'credit' | 'debt'
  entity: string
  category: string | null
  created_at: string
}

export type Profile = {
  id: string
  full_name: string | null
  phone_number: string | null
  updated_at: string
}
