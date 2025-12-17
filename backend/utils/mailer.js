// utils/mailer.js
const { Resend } = require("resend");

// Initialize Resend only if API key is available
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn("Warning: RESEND_API_KEY not configured. Email functionality is disabled.");
}

// Brand colors
const COLORS = {
  primary: '#1E376E',
  primaryLight: '#2B4A8C',
  accent: '#E96435',
  accentLight: '#F07B4F',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  textDark: '#1F2937',
  textLight: '#6B7280',
  bgLight: '#F9FAFB',
  bgWhite: '#FFFFFF',
  border: '#E5E7EB',
};

// Modern email layout with enhanced styling
function emailLayout({ title, preheader = '', content, footerText = '' }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: ${COLORS.textDark};
      background-color: ${COLORS.bgLight};
      -webkit-font-smoothing: antialiased;
    }
    
    .btn {
      display: inline-block;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      text-align: center;
      transition: all 0.2s ease;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%);
      color: #ffffff !important;
    }
    
    .btn-accent {
      background: linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentLight} 100%);
      color: #ffffff !important;
    }
    
    .info-box {
      background: #F0F9FF;
      border-left: 4px solid ${COLORS.primary};
      padding: 16px 20px;
      border-radius: 0 8px 8px 0;
      margin: 20px 0;
    }
    
    .warning-box {
      background: #FEF3C7;
      border-left: 4px solid ${COLORS.warning};
      padding: 16px 20px;
      border-radius: 0 8px 8px 0;
      margin: 20px 0;
    }
    
    .error-box {
      background: #FEE2E2;
      border-left: 4px solid ${COLORS.error};
      padding: 16px 20px;
      border-radius: 0 8px 8px 0;
      margin: 20px 0;
      color: #991B1B;
    }
    
    .success-box {
      background: #D1FAE5;
      border-left: 4px solid ${COLORS.success};
      padding: 16px 20px;
      border-radius: 0 8px 8px 0;
      margin: 20px 0;
      color: #065F46;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    
    .data-table td {
      padding: 10px 0;
      border-bottom: 1px solid ${COLORS.border};
    }
    
    .data-table td:first-child {
      color: ${COLORS.textLight};
      width: 140px;
    }
    
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 0 16px !important; }
      .content { padding: 24px 20px !important; }
      .btn { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.bgLight};">
  ${preheader ? `<div style="display:none;font-size:1px;color:${COLORS.bgLight};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>` : ''}
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${COLORS.bgLight};padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" class="container" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:${COLORS.bgWhite};border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${COLORS.primary} 0%,${COLORS.primaryLight} 100%);padding:32px 40px;text-align:center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color:#ffffff;border-radius:12px;padding:12px 20px;">
                          <span style="font-size:20px;font-weight:700;color:${COLORS.primary};font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">GlobalHealth.Works</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;letter-spacing:-0.5px;">${title}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content" style="padding:40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color:${COLORS.bgLight};padding:24px 40px;border-top:1px solid ${COLORS.border};">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="text-align:center;">
                    ${footerText ? `<p style="color:${COLORS.textLight};font-size:13px;margin-bottom:12px;">${footerText}</p>` : ''}
                    <p style="color:${COLORS.textLight};font-size:12px;margin:0;">
                      &copy; ${new Date().getFullYear()} GlobalHealth.Works &middot; Building a stronger global health community
                    </p>
                    <p style="margin-top:12px;">
                      <a href="https://globalhealth.works" style="color:${COLORS.primary};text-decoration:none;font-size:12px;margin:0 8px;">Website</a>
                      <span style="color:${COLORS.border};">|</span>
                      <a href="https://globalhealth.works/privacy" style="color:${COLORS.primary};text-decoration:none;font-size:12px;margin:0 8px;">Privacy</a>
                      <span style="color:${COLORS.border};">|</span>
                      <a href="https://globalhealth.works/terms" style="color:${COLORS.primary};text-decoration:none;font-size:12px;margin:0 8px;">Terms</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Send email using Resend
async function sendMail(to, subject, htmlContent) {
  // If Resend is not configured, log and return success (emails are skipped)
  if (!resend) {
    console.log(`[Email Skipped] To: ${to}, Subject: ${subject} (RESEND_API_KEY not configured)`);
    return { success: true, skipped: true };
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: "GlobalHealth.Works <admin@globalhealth.works>",
      to,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error };
    } else {
      console.log("Email sent:", data.id);
      return { success: true, id: data.id };
    }
  } catch (err) {
    console.error("Email send error:", err);
    return { success: false, error: err.message };
  }
}

// Email Templates
const Templates = {
  newUserAdminAlert: (user) =>
    emailLayout({
      title: "New User Registration",
      preheader: `New ${user.role} registration requires your review`,
      content: `
        <p style="font-size:16px;color:${COLORS.textDark};margin-bottom:20px;">Hello Admin,</p>
        <p style="color:${COLORS.textLight};margin-bottom:24px;">A new <strong style="color:${COLORS.textDark};">${user.role}</strong> has registered and requires your approval.</p>
        
        <table class="data-table">
          <tr>
            <td><strong>Name</strong></td>
            <td style="font-weight:500;">${user.firstName} ${user.lastName}</td>
          </tr>
          <tr>
            <td><strong>Email</strong></td>
            <td>${user.email}</td>
          </tr>
          <tr>
            <td><strong>Organisation</strong></td>
            <td>${user.organisationName || "Not specified"}</td>
          </tr>
          <tr>
            <td><strong>Country</strong></td>
            <td>${user.country || "Not specified"}</td>
          </tr>
        </table>
        
        <div style="text-align:center;margin-top:32px;">
          <a href="https://globalhealth.works/admin/users/${user._id}" class="btn btn-primary">
            Review User
          </a>
        </div>
      `,
    }),

  userApprovalNotice: (user) =>
    emailLayout({
      title: "Welcome to GlobalHealth.Works!",
      preheader: "Your account has been approved - you can now log in",
      content: `
        <p style="font-size:16px;color:${COLORS.textDark};margin-bottom:20px;">Dear ${user.firstName},</p>
        
        <div class="success-box">
          <strong>Great news!</strong> Your account has been approved by our admin team.
        </div>
        
        <p style="color:${COLORS.textLight};margin-bottom:24px;">You now have full access to GlobalHealth.Works. Log in to start connecting with global health professionals, browse opportunities, and make an impact.</p>
        
        <div style="text-align:center;margin-top:32px;">
          <a href="https://globalhealth.works/login" class="btn btn-accent">
            Log In to Your Account
          </a>
        </div>
        
        <p style="color:${COLORS.textLight};margin-top:32px;font-size:14px;">
          Welcome aboard,<br>
          <strong style="color:${COLORS.textDark};">The GlobalHealth.Works Team</strong>
        </p>
      `,
    }),

  approvalConfirmedAdminNotice: (admin, user) =>
    emailLayout({
      title: "User Approved",
      preheader: `You approved ${user.firstName} ${user.lastName}'s account`,
      content: `
        <p style="font-size:16px;color:${COLORS.textDark};margin-bottom:20px;">Hello ${admin.firstName},</p>
        <p style="color:${COLORS.textLight};margin-bottom:24px;">You have successfully approved the following user:</p>
        
        <div class="info-box">
          <p style="margin:0;"><strong>${user.firstName} ${user.lastName}</strong></p>
          <p style="margin:4px 0 0;color:${COLORS.textLight};font-size:14px;">${user.email} &middot; ${user.role}</p>
        </div>
        
        <p style="color:${COLORS.textLight};font-size:14px;">Thank you for helping maintain our community standards.</p>
      `,
    }),

  welcomePending: (user) =>
    emailLayout({
      title: "Welcome to GlobalHealth.Works",
      preheader: "Your registration is being reviewed",
      content: `
        <p style="font-size:16px;color:${COLORS.textDark};margin-bottom:20px;">Dear ${user.firstName},</p>
        <p style="color:${COLORS.textLight};margin-bottom:24px;">Thank you for joining the <strong style="color:${COLORS.textDark};">GlobalHealth.Works</strong> community!</p>
        
        <div class="info-box">
          <strong>Account Under Review</strong>
          <p style="margin:8px 0 0;font-size:14px;">Our admin team is reviewing your registration. You'll receive a confirmation email once approved.</p>
        </div>
        
        <p style="color:${COLORS.textLight};margin-bottom:24px;">In the meantime, feel free to explore our platform and learn about how we connect global health professionals worldwide.</p>
        
        <div style="text-align:center;margin-top:32px;">
          <a href="https://globalhealth.works" class="btn btn-primary">
            Explore Platform
          </a>
        </div>
        
        <p style="color:${COLORS.textLight};margin-top:32px;font-size:14px;">
          Warm regards,<br>
          <strong style="color:${COLORS.textDark};">The GlobalHealth.Works Team</strong>
        </p>
      `,
    }),

  rejectionNotice: (user, reason) =>
    emailLayout({
      title: "Registration Update",
      preheader: "An update regarding your GlobalHealth.Works registration",
      content: `
        <p style="font-size:16px;color:${COLORS.textDark};margin-bottom:20px;">Dear ${user.firstName},</p>
        <p style="color:${COLORS.textLight};margin-bottom:24px;">Thank you for your interest in joining GlobalHealth.Works.</p>
        <p style="color:${COLORS.textLight};margin-bottom:24px;">After reviewing your details, our team was unable to approve your account at this time.</p>
        
        <div class="error-box">
          <strong>Reason:</strong>
          <p style="margin:8px 0 0;">${reason}</p>
        </div>
        
        <p style="color:${COLORS.textLight};margin-bottom:24px;">If you believe this was a mistake or would like to provide additional information, you're welcome to register again with updated details.</p>
        
        <p style="color:${COLORS.textLight};font-size:14px;">
          Best regards,<br>
          <strong style="color:${COLORS.textDark};">The GlobalHealth.Works Team</strong>
        </p>
      `,
    }),

  rejectionConfirmedAdminNotice: (admin, user, reason) =>
    emailLayout({
      title: "User Rejected",
      preheader: `You rejected ${user.firstName} ${user.lastName}'s account`,
      content: `
        <p style="font-size:16px;color:${COLORS.textDark};margin-bottom:20px;">Hello ${admin.firstName},</p>
        <p style="color:${COLORS.textLight};margin-bottom:24px;">You have rejected the following user's registration:</p>
        
        <table class="data-table">
          <tr>
            <td><strong>Name</strong></td>
            <td>${user.firstName} ${user.lastName}</td>
          </tr>
          <tr>
            <td><strong>Email</strong></td>
            <td>${user.email}</td>
          </tr>
          <tr>
            <td><strong>Role</strong></td>
            <td>${user.role}</td>
          </tr>
        </table>
        
        <div class="error-box">
          <strong>Reason for rejection:</strong>
          <p style="margin:8px 0 0;">${reason}</p>
        </div>
        
        <p style="color:${COLORS.textLight};font-size:14px;">This action has been logged in the system.</p>
      `,
    }),

  newTaskAdminAlert: (task, owner) =>
    emailLayout({
      title: "New Task Submitted",
      preheader: `${owner.firstName} ${owner.lastName} created a new task`,
      content: `
        <p style="font-size:16px;color:${COLORS.textDark};margin-bottom:20px;">Hello Admin,</p>
        <p style="color:${COLORS.textLight};margin-bottom:24px;">A new task has been created on the platform.</p>
        
        <div style="background:linear-gradient(135deg,${COLORS.bgLight} 0%,#E0E7FF 100%);border-radius:12px;padding:24px;margin-bottom:24px;">
          <h2 style="color:${COLORS.textDark};font-size:18px;margin:0 0 12px;">${task.title}</h2>
          <p style="color:${COLORS.textLight};margin:0;font-size:14px;">${task.summary}</p>
        </div>
        
        <table class="data-table">
          <tr>
            <td><strong>Created By</strong></td>
            <td>${owner.firstName} ${owner.lastName}</td>
          </tr>
          <tr>
            <td><strong>Role</strong></td>
            <td>${owner.role}</td>
          </tr>
        </table>
        
        <div style="text-align:center;margin-top:32px;">
          <a href="https://globalhealth.works/admin/tasks/${task._id}" class="btn btn-primary">
            View Task
          </a>
        </div>
      `,
    }),

  taskCreatedUserNotice: (user, task) =>
    emailLayout({
      title: "Task Created Successfully",
      preheader: `Your task "${task.title}" is now live`,
      content: `
        <p style="font-size:16px;color:${COLORS.textDark};margin-bottom:20px;">Dear ${user.firstName},</p>
        
        <div class="success-box">
          <strong>Your task has been created!</strong>
        </div>
        
        <div style="background:${COLORS.bgLight};border-radius:12px;padding:24px;margin:24px 0;">
          <h3 style="color:${COLORS.textDark};font-size:16px;margin:0 0 16px;">${task.title}</h3>
          <p style="color:${COLORS.textLight};margin:0 0 16px;font-size:14px;">${task.summary}</p>
          
          <table style="width:100%;font-size:13px;">
            <tr>
              <td style="color:${COLORS.textLight};padding:4px 0;">Focus Areas</td>
              <td style="color:${COLORS.textDark};padding:4px 0;">${task.focusAreas?.join(", ") || "N/A"}</td>
            </tr>
            <tr>
              <td style="color:${COLORS.textLight};padding:4px 0;">Required Skills</td>
              <td style="color:${COLORS.textDark};padding:4px 0;">${task.requiredSkills?.join(", ") || "N/A"}</td>
            </tr>
          </table>
        </div>
        
        <p style="color:${COLORS.textLight};margin-bottom:24px;">You can view and manage your task from your dashboard at any time.</p>
        
        <div style="text-align:center;margin-top:32px;">
          <a href="https://globalhealth.works/dashboard" class="btn btn-accent">
            Go to Dashboard
          </a>
        </div>
        
        <p style="color:${COLORS.textLight};margin-top:32px;font-size:14px;">
          Thank you for contributing to the global health community.<br>
          <strong style="color:${COLORS.textDark};">The GlobalHealth.Works Team</strong>
        </p>
      `,
    }),

  newMessageNotification: (receiver, sender, message, conversationId) =>
    emailLayout({
      title: "New Message",
      preheader: `${sender.firstName} ${sender.lastName} sent you a message`,
      content: `
        <p style="font-size:16px;color:${COLORS.textDark};margin-bottom:20px;">Dear ${receiver.firstName},</p>
        <p style="color:${COLORS.textLight};margin-bottom:24px;">You have a new message from <strong style="color:${COLORS.textDark};">${sender.firstName} ${sender.lastName}</strong>.</p>
        
        <div class="info-box">
          <p style="margin:0;font-style:italic;color:${COLORS.textDark};">
            "${message ? message.substring(0, 200) + (message.length > 200 ? '...' : '') : 'Sent an attachment'}"
          </p>
        </div>
        
        <div style="text-align:center;margin-top:32px;">
          <a href="https://globalhealth.works/chat/${conversationId}" class="btn btn-primary">
            Open Conversation
          </a>
        </div>
        
        <p style="color:${COLORS.textLight};margin-top:32px;font-size:14px;">
          Warm regards,<br>
          <strong style="color:${COLORS.textDark};">The GlobalHealth.Works Team</strong>
        </p>
      `,
    }),

  proposalSubmitted: (taskOwner, applicant, task, proposal) =>
    emailLayout({
      title: "New Proposal Received",
      preheader: `${applicant.firstName} submitted a proposal for "${task.title}"`,
      content: `
        <p style="font-size:16px;color:${COLORS.textDark};margin-bottom:20px;">Hello ${taskOwner.firstName},</p>
        <p style="color:${COLORS.textLight};margin-bottom:24px;">Great news! You've received a new proposal for your task.</p>
        
        <div style="background:${COLORS.bgLight};border-radius:12px;padding:24px;margin-bottom:24px;">
          <p style="color:${COLORS.textLight};font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Task</p>
          <h3 style="color:${COLORS.textDark};font-size:16px;margin:0;">${task.title}</h3>
        </div>
        
        <div style="border:1px solid ${COLORS.border};border-radius:12px;padding:24px;margin-bottom:24px;">
          <div style="display:flex;align-items:center;margin-bottom:16px;">
            <div style="width:48px;height:48px;background:linear-gradient(135deg,${COLORS.primary},${COLORS.primaryLight});border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:600;font-size:18px;margin-right:16px;">
              ${applicant.firstName.charAt(0)}${applicant.lastName.charAt(0)}
            </div>
            <div>
              <p style="margin:0;font-weight:600;color:${COLORS.textDark};">${applicant.firstName} ${applicant.lastName}</p>
              <p style="margin:4px 0 0;color:${COLORS.textLight};font-size:13px;">Solution Provider</p>
            </div>
          </div>
          
          <p style="color:${COLORS.textDark};margin-bottom:16px;">${proposal.message}</p>
          
          ${proposal.proposedBudget ? `<p style="color:${COLORS.textLight};font-size:14px;margin:8px 0;"><strong>Budget:</strong> $${proposal.proposedBudget}</p>` : ''}
          ${proposal.proposedDuration ? `<p style="color:${COLORS.textLight};font-size:14px;margin:8px 0;"><strong>Duration:</strong> ${proposal.proposedDuration}</p>` : ''}
        </div>
        
        <div style="text-align:center;margin-top:32px;">
          <a href="https://globalhealth.works/tasks/${task._id}" class="btn btn-accent">
            View Proposal
          </a>
        </div>
      `,
    }),

  proposalSubmissionConfirmation: (applicant, task, proposal) =>
    emailLayout({
      title: "Proposal Submitted",
      preheader: `Your proposal for "${task.title}" has been sent`,
      content: `
        <p style="font-size:16px;color:${COLORS.textDark};margin-bottom:20px;">Dear ${applicant.firstName},</p>
        
        <div class="success-box">
          <strong>Your proposal has been submitted successfully!</strong>
        </div>
        
        <p style="color:${COLORS.textLight};margin-bottom:24px;">The task owner will review your proposal and get back to you soon.</p>
        
        <div style="background:${COLORS.bgLight};border-radius:12px;padding:24px;margin-bottom:24px;">
          <p style="color:${COLORS.textLight};font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Task</p>
          <h3 style="color:${COLORS.textDark};font-size:16px;margin:0 0 16px;">${task.title}</h3>
          
          <p style="color:${COLORS.textLight};font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Your Message</p>
          <p style="color:${COLORS.textDark};margin:0;font-size:14px;">${proposal.message}</p>
          
          ${proposal.proposedBudget ? `<p style="color:${COLORS.textLight};font-size:14px;margin:12px 0 0;"><strong>Proposed Budget:</strong> $${proposal.proposedBudget}</p>` : ''}
          ${proposal.proposedDuration ? `<p style="color:${COLORS.textLight};font-size:14px;margin:4px 0 0;"><strong>Proposed Duration:</strong> ${proposal.proposedDuration}</p>` : ''}
        </div>
        
        <div style="text-align:center;margin-top:32px;">
          <a href="https://globalhealth.works/dashboard" class="btn btn-primary">
            View My Proposals
          </a>
        </div>
        
        <p style="color:${COLORS.textLight};margin-top:32px;font-size:14px;">
          Best of luck!<br>
          <strong style="color:${COLORS.textDark};">The GlobalHealth.Works Team</strong>
        </p>
      `,
    }),

  passwordReset: (user, resetLink) =>
    emailLayout({
      title: "Reset Your Password",
      preheader: "You requested a password reset for your account",
      content: `
        <p style="font-size:16px;color:${COLORS.textDark};margin-bottom:20px;">Dear ${user.firstName},</p>
        <p style="color:${COLORS.textLight};margin-bottom:24px;">We received a request to reset your password. Click the button below to create a new password.</p>
        
        <div class="warning-box">
          <strong>This link expires in 1 hour.</strong>
          <p style="margin:8px 0 0;font-size:14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
        
        <div style="text-align:center;margin-top:32px;">
          <a href="${resetLink}" class="btn btn-accent">
            Reset Password
          </a>
        </div>
        
        <p style="color:${COLORS.textLight};margin-top:32px;font-size:13px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetLink}" style="color:${COLORS.primary};word-break:break-all;">${resetLink}</a>
        </p>
      `,
    }),

  taskMatch: (provider, task, matchScore) =>
    emailLayout({
      title: "New Task Match",
      preheader: `A new task matches your profile - ${matchScore.percentage}% match`,
      content: `
        <p style="font-size:16px;color:${COLORS.textDark};margin-bottom:20px;">Hi ${provider.firstName},</p>
        <p style="color:${COLORS.textLight};margin-bottom:24px;">We found a task that matches your skills and expertise!</p>
        
        <div style="background:linear-gradient(135deg,${COLORS.bgLight} 0%,#D1FAE5 100%);border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
          <p style="color:${COLORS.success};font-weight:700;font-size:32px;margin:0;">${matchScore.percentage}%</p>
          <p style="color:${COLORS.textLight};margin:4px 0 0;font-size:14px;">Match Score</p>
        </div>
        
        <div style="border:1px solid ${COLORS.border};border-radius:12px;padding:24px;margin-bottom:24px;">
          <h3 style="color:${COLORS.textDark};font-size:18px;margin:0 0 12px;">${task.title}</h3>
          <p style="color:${COLORS.textLight};margin:0 0 16px;font-size:14px;">${task.summary}</p>
          
          ${matchScore.matchedSkills?.length > 0 ? `
            <p style="color:${COLORS.textLight};font-size:13px;margin:0 0 8px;"><strong>Matching Skills:</strong></p>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
              ${matchScore.matchedSkills.map(skill => `<span style="background:${COLORS.bgLight};color:${COLORS.textDark};padding:4px 12px;border-radius:20px;font-size:12px;">${skill}</span>`).join('')}
            </div>
          ` : ''}
        </div>
        
        <div style="text-align:center;margin-top:32px;">
          <a href="https://globalhealth.works/tasks/${task._id}" class="btn btn-accent">
            View Task Details
          </a>
        </div>
      `,
    }),

  genericNotification: (user, message, link) =>
    emailLayout({
      title: "New Notification",
      preheader: message.substring(0, 100),
      content: `
        <p style="font-size:16px;color:${COLORS.textDark};margin-bottom:20px;">Hi ${user.firstName},</p>
        
        <div class="info-box">
          <p style="margin:0;color:${COLORS.textDark};">${message}</p>
        </div>
        
        ${link ? `
          <div style="text-align:center;margin-top:32px;">
            <a href="https://globalhealth.works${link}" class="btn btn-primary">
              View Details
            </a>
          </div>
        ` : ''}
        
        <p style="color:${COLORS.textLight};margin-top:32px;font-size:14px;">
          Best regards,<br>
          <strong style="color:${COLORS.textDark};">The GlobalHealth.Works Team</strong>
        </p>
      `,
    }),

  proposalAccepted: (applicant, task) =>
    emailLayout({
      title: "Proposal Accepted!",
      preheader: `Great news! Your proposal for "${task.title}" has been accepted`,
      content: `
        <p style="font-size:16px;color:${COLORS.textDark};margin-bottom:20px;">Dear ${applicant.firstName},</p>
        
        <div class="success-box">
          <strong>Congratulations!</strong> Your proposal has been accepted by the task owner.
        </div>
        
        <div style="background:${COLORS.bgLight};border-radius:12px;padding:24px;margin:24px 0;">
          <p style="color:${COLORS.textLight};font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Task</p>
          <h3 style="color:${COLORS.textDark};font-size:16px;margin:0;">${task.title}</h3>
        </div>
        
        <p style="color:${COLORS.textLight};margin-bottom:24px;">You can now start working on this task. The task owner may reach out to you with further details.</p>
        
        <div style="text-align:center;margin-top:32px;">
          <a href="https://globalhealth.works/tasks/${task._id}" class="btn btn-accent">
            View Task
          </a>
        </div>
      `,
    }),

  proposalRejected: (applicant, task) =>
    emailLayout({
      title: "Proposal Update",
      preheader: `Update regarding your proposal for "${task.title}"`,
      content: `
        <p style="font-size:16px;color:${COLORS.textDark};margin-bottom:20px;">Dear ${applicant.firstName},</p>
        
        <p style="color:${COLORS.textLight};margin-bottom:24px;">Thank you for your interest in the task below. Unfortunately, the task owner has decided to proceed with another solution provider.</p>
        
        <div style="background:${COLORS.bgLight};border-radius:12px;padding:24px;margin:24px 0;">
          <p style="color:${COLORS.textLight};font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 8px;">Task</p>
          <h3 style="color:${COLORS.textDark};font-size:16px;margin:0;">${task.title}</h3>
        </div>
        
        <p style="color:${COLORS.textLight};margin-bottom:24px;">Don't be discouraged! There are many other opportunities waiting for you on GlobalHealth.Works.</p>
        
        <div style="text-align:center;margin-top:32px;">
          <a href="https://globalhealth.works/browse-tasks" class="btn btn-primary">
            Browse Other Tasks
          </a>
        </div>
      `,
    }),
};

module.exports = { sendMail, Templates, emailLayout };
