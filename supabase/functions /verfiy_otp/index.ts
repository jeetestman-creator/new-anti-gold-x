import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  email: string;
  otp: string;
  purpose: 'signup' | 'login' | 'password_reset';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, otp, purpose }: RequestBody = await req.json();

    if (!email || !otp || !purpose) {
      return new Response(
        JSON.stringify({ error: 'Email, OTP, and purpose are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- SECURITY: Rate Limiting ---
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const { data: isAllowed, error: limitError } = await supabase.rpc('check_rate_limit', {
      p_identifier: `${clientIp}:${email}`, // Rate limit per IP + Email combination
      p_endpoint: 'verify-otp',
      p_limit: 5,
      p_window_seconds: 60
    });

    if (limitError) {
      console.error('Rate limit error:', limitError);
    }

    if (isAllowed === false) {
      return new Response(
        JSON.stringify({ error: 'Too many attempts. Please try again in 1 minute.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // --- END SECURITY ---

    // Find matching OTP
    const { data: otpRecord, error: fetchError } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .eq('purpose', purpose)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching OTP:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify OTP' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!otpRecord) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired OTP' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark OTP as verified
    const { error: updateError } = await supabase
      .from('otp_verifications')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    if (updateError) {
      console.error('Error updating OTP:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to complete verification' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Special logic for signup: create the actual user
    if (purpose === 'signup') {
      const { data: pendingData, error: pendingError } = await supabase
        .from('pending_signups')
        .select('*')
        .eq('email', email)
        .eq('token', otp)
        .maybeSingle();

      if (pendingError || !pendingData) {
        console.error('Failed to find pending signup:', pendingError);
        return new Response(
          JSON.stringify({ error: 'Verification successful but signup data not found. Please try registering again.' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create user in auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: pendingData.password,
        email_confirm: true,
        user_metadata: {
          full_name: pendingData.full_name,
          phone: pendingData.phone,
          country: pendingData.country,
          referral_code: pendingData.referral_code || null
        }
      });

      if (authError) {
        console.error('Auth creation error:', authError);
        return new Response(
          JSON.stringify({ error: authError.message || 'Failed to create user account' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Clean up pending signup
      await supabase.from('pending_signups').delete().eq('email', email);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Account created and verified successfully',
          user: {
            id: authData.user.id,
            email: email
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, verified: true, message: 'OTP verified successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-otp function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
