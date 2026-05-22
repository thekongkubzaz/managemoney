const { createClient } = require('@supabase/supabase-js');
const { config } = require('../config');

const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);
const TABLE = config.supabase.table;

module.exports = { supabase, TABLE };
