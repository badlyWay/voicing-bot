const { createClient } = require("@supabase/supabase-js");
const supabaseApi = createClient(
    process.env.SUPABASE_PROJECT_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = {
    supabaseApi,
}