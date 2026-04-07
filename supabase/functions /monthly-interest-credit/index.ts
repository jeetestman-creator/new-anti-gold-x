import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date();
    
    // Get all users with deposit balance and their last ROI credit time
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, monthly_roi_percentage, last_roi_credit_at');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    // Get daily ROI percentage from settings
    const { data: dailyRoiSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'daily_roi_percentage')
      .maybeSingle();
    
    const globalDailyRate = dailyRoiSetting ? parseFloat(dailyRoiSetting.value) : 0.33;

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let successCount = 0;
    let failCount = 0;

    // Process each user's daily ROI
    for (const user of users) {
      try {
        const lastCreditAt = new Date(user.last_roi_credit_at || 0);
        const hoursSinceLastCredit = (now.getTime() - lastCreditAt.getTime()) / (1000 * 60 * 60);

        // Only credit if it's been at least 23 hours (to allow some buffer for scheduling)
        if (hoursSinceLastCredit < 23) {
          continue;
        }

        // Get ROI wallet balance for user
        const { data: depositWallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .eq('wallet_type', 'deposit')
          .maybeSingle();

        const depositBalance = depositWallet?.balance || 0;
        
        if (depositBalance <= 0) {
          continue;
        }

        // Calculate ROI (User specific monthly % / 30, or use global daily rate)
        // Platform requirements say "Daily % reference in admin platform setting"
        const dailyRate = globalDailyRate;
        const interestAmount = (depositBalance * dailyRate) / 100;

        if (interestAmount <= 0) {
          continue;
        }

        // 1. Credit ROI wallet
        await supabase.rpc('add_wallet_balance', {
          p_user_id: user.id,
          p_wallet_type: 'roi',
          p_amount: interestAmount
        });

        // 2. Update last credit time
        await supabase
          .from('profiles')
          .update({ last_roi_credit_at: now.toISOString() })
          .eq('id', user.id);

        // 3. Create transaction record
        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            transaction_type: 'roi_credit',
            amount: interestAmount,
            status: 'completed',
            admin_notes: `Daily ROI credit (${dailyRate}%)`
          });

        successCount++;
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        failCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Interest credited successfully`,
        stats: {
          total: users.length,
          success: successCount,
          failed: failCount,
          date: now.toISOString().split('T')[0]
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in monthly-interest-credit function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
