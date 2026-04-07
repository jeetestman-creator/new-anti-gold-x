import { createClient } from 'jsr:@supabase/supabase-js@2';
import { sendEmail } from '../_shared/email.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending test email to: ${email}`);

    const result = await sendEmail({
      to: email,
      subject: 'SMTP Connection Test - Gold X Usdt',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #FFD700; border-radius: 10px; background-color: #0A0A0A; color: #FFFFFF;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #FFD700; margin: 0;">Gold X Usdt</h1>
            <p style="color: #888; font-size: 14px;">SMTP Configuration Test</p>
          </div>
          <div style="background-color: #1A1A1A; padding: 30px; border-radius: 8px; text-align: center; border: 1px solid rgba(255, 215, 0, 0.1);">
            <h2 style="color: #00FF00; margin-top: 0; font-size: 24px;">Success!</h2>
            <p style="color: #FFFFFF; margin-bottom: 25px; font-size: 16px;">Your Hostinger SMTP configuration is working correctly.</p>
            <p style="color: #AAA; font-size: 14px;">This test email confirms that your platform can now send automated emails to users for OTPs, deposits, and withdrawals.</p>
          </div>
          <div style="margin-top: 25px; text-align: center; font-size: 12px; color: #666; line-height: 1.5;">
            <p>&copy; 2026 Gold X Usdt. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Test email sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in test-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
