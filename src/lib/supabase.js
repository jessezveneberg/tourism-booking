import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rwcgdoryrkgqbbkxzmqv.supabase.co'
const supabaseKey = 'sb_publishable_Lx50pBKtoDN3LCgaBzBYxA_V9k476N9'

export const supabase = createClient(supabaseUrl, supabaseKey)