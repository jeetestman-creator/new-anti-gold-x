import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  email: string;
  purpose: 'signup' | 'login' | 'password_reset';
  userData?: {
    fullName: string;
    phone: string;
    country: string;
    password?: string;
    referralCode?: string;
  }
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

    const { email, purpose, userData }: RequestBody = await req.json();

    if (!email || !purpose) {
      return new Response(
        JSON.stringify({ error: 'Email and purpose are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- SECURITY: Rate Limiting ---
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const { data: isAllowed, error: limitError } = await supabase.rpc('check_rate_limit', {
      p_identifier: `${clientIp}:${email}`, // Rate limit per IP + Email combination
      p_endpoint: 'send-otp',
      p_limit: 5,
      p_window_seconds: 60
    });

    if (limitError) {
      console.error('Rate limit error:', limitError);
    }

    if (isAllowed === false) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again in 1 minute.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // --- END SECURITY ---

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated OTP for ${email}: ${otpCode}`);

    // Set expiry to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // If it's a signup, we need to store the user data
    if (purpose === 'signup') {
      if (!userData) {
        return new Response(
          JSON.stringify({ error: 'User data required for signup' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Store pending signup using the OTP as the token (or just use the email as primary key)
      await supabase.from('pending_signups').delete().eq('email', email);
      const { error: pendingError } = await supabase.from('pending_signups').insert({
        email,
        password: userData.password,
        full_name: userData.fullName,
        phone: userData.phone,
        country: userData.country,
        referral_code: userData.referralCode,
        token: otpCode, // We use the OTP as the token for consistency
        expires_at: expiresAt
      });

      if (pendingError) {
        console.error('Failed to store pending signup:', pendingError);
        return new Response(
          JSON.stringify({ error: 'Failed to initiate signup' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Delete any existing OTPs for this email and purpose
    await supabase
      .from('otp_verifications')
      .delete()
      .eq('email', email)
      .eq('purpose', purpose);

    // Store OTP in database
    const { error: insertError } = await supabase
      .from('otp_verifications')
      .insert({
        email,
        otp_code: otpCode,
        purpose,
        expires_at: expiresAt,
        verified: false
      });

    if (insertError) {
      console.error('Failed to store OTP:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate OTP' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send email with OTP using SMTP
    try {
      const { sendEmail } = await import('../_shared/email.ts');
      const fromEmail = Deno.env.get('SMTP_USER') || 'info@goldxusdt.com';
      console.log(`Sending email from: ${fromEmail} to: ${email}`);

      const siteUrl = Deno.env.get('SITE_URL') || 'https://goldxusdt.com';
      const actionUrl = `${siteUrl}/signup?email=${encodeURIComponent(email)}&step=otp`;
      const buttonText = purpose === 'signup' ? 'Verify Email' : 'Confirm OTP';

      // Email Template with placeholders for robustness
      const template = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #FFD700; border-radius: 10px; background-color: #0A0A0A; color: #FFFFFF;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #FFD700; margin: 0;">Gold X Usdt</h1>
            <p style="color: #888; font-size: 14px;">Secure USDT Investment Platform</p>
          </div>
          <div style="background-color: #1A1A1A; padding: 30px; border-radius: 8px; text-align: center; border: 1px solid rgba(255, 215, 0, 0.1);">
            <h2 style="color: #FFFFFF; margin-top: 0; font-size: 24px;">Verification Code</h2>
            <p style="color: #AAA; margin-bottom: 25px; font-size: 16px;">Use the code below to complete your {{purpose}} process.</p>
            
            <div style="font-size: 36px; font-weight: bold; color: #000000; letter-spacing: 8px; background: #FFD700; padding: 20px; border-radius: 6px; display: inline-block; margin-bottom: 30px; min-width: 200px; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);">
              {{otp_code}}
            </div>
            
            <div style="margin-bottom: 25px;">
              <a href="{{action_url}}" style="background-color: #FFD700; color: #000000; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);">
                {{button_text}}
              </a>
            </div>
            
            <p style="color: #888; margin-top: 20px; font-size: 13px;">This code will expire in 10 minutes. If the button doesn't work, copy and paste the code manually.</p>
          </div>
          <div style="margin-top: 25px; text-align: center; font-size: 12px; color: #666; line-height: 1.5;">
            <p>If you didn't request this code, please ignore this email.</p>
            <p>&copy; 2026 Gold X Usdt. All rights reserved.</p>
          </div>
        </div>
      `;

      // Replace placeholders
      const html = template
        .replace('{{otp_code}}', otpCode)
        .replace('{{purpose}}', purpose.replace('_', ' '))
        .replace('{{action_url}}', actionUrl)
        .replace('{{button_text}}', buttonText);

      await sendEmail({
        to: email,
        subject: `Your OTP Code - ${purpose.replace('_', ' ').toUpperCase()}`,
        from: `Gold X Usdt <${fromEmail}>`,
        html,
      });
      
      console.log('SMTP email sent with OTP:', otpCode);

    } catch (e) {
      console.error('Failed to send email via Zoho SMTP:', e);
      return new Response(
        JSON.stringify({ error: `Network error sending email: ${e.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP sent successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-otp function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
