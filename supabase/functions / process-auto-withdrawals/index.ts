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
    const currentDay = now.getDate();

    // Only run on the 20th of the month
    if (currentDay !== 20) {
      return new Response(
        JSON.stringify({ message: 'Not today (scheduled for 20th)' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all users with auto-withdrawal enabled and their ROI balances
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, auto_withdrawal_enabled, withdrawal_wallet_address')
      .eq('auto_withdrawal_enabled', true);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users with auto-withdrawal enabled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let successCount = 0;
    let failCount = 0;
    const withdrawalFeePercent = 5; // 5% withdrawal fee

    // Process each user's auto-withdrawal
    for (const user of users) {
      try {
        // Get ROI wallet balance
        const { data: roiWallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .eq('wallet_type', 'roi')
          .maybeSingle();

        const roiBalance = roiWallet?.balance || 0;
        
        if (roiBalance <= 0) {
          console.log(`Skipping user ${user.id}: No ROI balance`);
          continue;
        }

        // Calculate withdrawal amount after fee
        const feeAmount = (roiBalance * withdrawalFeePercent) / 100;
        const netAmount = roiBalance - feeAmount;

        // Start transaction-like process
        // 1. Deduct from ROI wallet
        await supabase.from('wallets').update({ balance: 0 }).eq('user_id', user.id).eq('wallet_type', 'roi');
        
        // 2. Add to Withdrawal wallet
        await supabase.rpc('add_wallet_balance', {
          p_user_id: user.id,
          p_wallet_type: 'withdrawal',
          p_amount: netAmount
        });

        // 3. Create withdrawal record (as pending, for admin final approval if needed, or completed)
        // Platform requirement says "Auto credit on referral's completed deposit"
        // But auto-withdrawal usually means automated.
        // Let's create a COMPLETED withdrawal record.
        await supabase.from('withdrawals').insert({
          user_id: user.id,
          amount: roiBalance,
          fee: feeAmount,
          net_amount: netAmount,
          status: 'approved',
          wallet_address: user.withdrawal_wallet_address || 'Auto-withdrawal',
          network: 'BEP20',
          completed_at: new Date().toISOString()
        });

        // 4. Create transaction record
        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            transaction_type: 'withdrawal',
            amount: roiBalance,
            fee: feeAmount,
            net_amount: netAmount,
            status: 'completed',
            admin_notes: `Auto-withdrawal processed on 20th (${withdrawalFeePercent}% fee applied)`
          });

        // 5. Update next auto-withdrawal date
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(20);

        await supabase
          .from('profiles')
          .update({
            next_auto_withdrawal_date: nextMonth.toISOString().split('T')[0]
          })
          .eq('id', user.id);

        successCount++;
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        failCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Auto-withdrawals processed successfully`,
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
    console.error('Error in process-auto-withdrawals function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
