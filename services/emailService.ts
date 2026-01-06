// REPLACE THIS WITH YOUR ACTUAL API KEY FROM ELASTIC EMAIL
// NOTE: Since you stored the key in Supabase Secrets, the Frontend CANNOT read it directly securely.
// In a production app, you would fetch a Supabase Edge Function here.
// For this prototype, if you want to test from localhost, you might temporarily paste it here or use the mock.
const ELASTIC_EMAIL_API_KEY = 'YOUR_API_KEY_HERE'; 

const API_URL = 'https://api.elasticemail.com/v2/email/send';

// HARD REQUIREMENT: Always send from this address to match Elastic Email verification
const SENDER_EMAIL = 'register@kosma.io';

interface EmailResponse {
  success: boolean;
  error?: string;
  data?: any;
}

export const emailService = {
  /**
   * Generic send function using Elastic Email API
   */
  sendEmail: async (to: string, subject: string, bodyHtml: string): Promise<EmailResponse> => {
    // Safety check for prototype
    if (ELASTIC_EMAIL_API_KEY === 'YOUR_API_KEY_HERE') {
      console.log('📧 [SIMULATION] Email would be sent to:', to);
      console.log('📧 From:', SENDER_EMAIL);
      console.log('📧 Subject:', subject);
      return { success: true }; // Pretend it worked
    }

    try {
      const formData = new FormData();
      formData.append('apikey', ELASTIC_EMAIL_API_KEY);
      formData.append('subject', subject);
      formData.append('from', SENDER_EMAIL); // Enforced sender
      formData.append('to', to);
      formData.append('bodyHtml', bodyHtml);
      formData.append('isTransactional', 'true');

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success === false) {
        console.error('Elastic Email Error:', result.error);
        return { success: false, error: result.error };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('Network Error sending email:', error);
      return { success: false, error: 'Network error' };
    }
  },

  /**
   * Specific template for Verification Emails
   */
  sendVerificationEmail: async (email: string, name: string) => {
    const subject = "Verify your KOSMA Account";
    
    // Simple HTML Template matching the CI
    const htmlBody = `
      <div style="font-family: sans-serif; color: #1F2937; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0093D0;">Welcome to KOSMA, ${name}!</h1>
        <p>Thank you for registering. To start your free trial and unlock the full potential of our software, please verify your email address.</p>
        
        <div style="margin: 30px 0;">
          <a href="http://localhost:3000/#/dashboard?verified=true" style="background-color: #0093D0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        
        <p style="font-size: 12px; color: #9CA3AF;">If you did not create an account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
        <p style="font-size: 10px; color: #9CA3AF;">Headstart Media - MEDIA EUROPE LOVES CINEMA<br/>
        Sent from: ${SENDER_EMAIL}</p>
      </div>
    `;

    return emailService.sendEmail(email, subject, htmlBody);
  }
};