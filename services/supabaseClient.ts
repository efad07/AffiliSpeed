import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nppfametitdcnbwocqse.supabase.co';
// Using the key provided by the user
const supabaseKey = 'sb_publishable_QSvs_X9DzmGqrNQZZAnTTg_gPGcsbWu';

export const supabase = createClient(supabaseUrl, supabaseKey);