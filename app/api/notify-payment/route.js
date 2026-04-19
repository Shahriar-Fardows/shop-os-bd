import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

        if (!webhookUrl) {
            return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
        }

        const { userName, userEmail, userPhone, planName, amount, transactionId, submittedAt } = body;

        const embed = {
            title: '💳 নতুন পেমেন্ট সাবমিট হয়েছে!',
            color: 0x1e6bd6,
            fields: [
                { name: '👤 ইউজার', value: `${userName || 'N/A'}\n${userEmail || 'N/A'}`, inline: true },
                { name: '📱 মোবাইল', value: userPhone || 'N/A', inline: true },
                { name: '📦 প্ল্যান', value: planName || 'N/A', inline: true },
                { name: '💰 পরিমাণ', value: `৳${amount || 0}`, inline: true },
                { name: '🔖 ট্র্যান্সেকশন আইডি', value: `\`${transactionId || 'N/A'}\``, inline: true },
                { name: '🕐 সময়', value: submittedAt || new Date().toLocaleString('en-BD'), inline: true },
            ],
            footer: { text: 'ShopOS BD · Payment Notification' },
            timestamp: new Date().toISOString(),
        };

        const discordRes = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'ShopOS BD Payments',
                avatar_url: 'https://i.imgur.com/AfFp7pu.png',
                embeds: [embed],
            }),
        });

        if (!discordRes.ok) {
            console.error('Discord webhook failed:', discordRes.status, await discordRes.text());
            return NextResponse.json({ error: 'Discord notification failed' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('notify-payment error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
