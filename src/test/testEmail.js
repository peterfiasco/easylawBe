import mg, { MAILGUN_DOMAIN, USE_SANDBOX } from '../config/mailgun.config.js';

async function testMailgunConfig() {
  try {
    console.log('🔧 Testing Mailgun Configuration...');
    console.log('Domain:', MAILGUN_DOMAIN);
    console.log('Sandbox mode:', USE_SANDBOX);
    console.log('API Key configured:', process.env.MAILGUN_API_KEY ? 'Yes' : 'No');
    
    // Test with the configured domain
    const emailData = {
      from: USE_SANDBOX 
        ? `Mailgun Sandbox <postmaster@${MAILGUN_DOMAIN}>`
        : `EasyLaw Solutions <noreply@${MAILGUN_DOMAIN}>`,
      to: ["wazobia.nigeri@gmail.com"],
      subject: "Hello from EasyLaw - Mailgun Test",
      text: "Congratulations! Your Mailgun configuration is working!",
      html: `
        <h1>🎉 Success!</h1>
        <p>Congratulations! Your Mailgun configuration is working!</p>
        <p>Domain: ${MAILGUN_DOMAIN}</p>
        <p>Sandbox mode: ${USE_SANDBOX}</p>
      `
    };

    const response = await mg.messages.create(MAILGUN_DOMAIN, emailData);
    console.log('✅ Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    if (error.status === 403) {
      console.log('💡 Possible solutions:');
      console.log('   1. Verify your domain in Mailgun dashboard');
      console.log('   2. Check if domain DNS records are configured');
      console.log('   3. Use sandbox domain for testing');
    }
    throw error;
  }
}

testMailgunConfig();
