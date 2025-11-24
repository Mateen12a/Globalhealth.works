// utils/mailer.js
const { Resend } = require("resend");

// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: "smtppro.zoho.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: "admin@globalhealth.works",
//     pass: "nkCpKAmMpvzL",
//   },
// });

const resend = new Resend(process.env.RESEND_API_KEY);



// ✅ Base email layout template with GlobalHealth.Works branding
function emailLayout({ title, content }) {
  return `
  <div style="background-color:#F9FAFB;padding:40px 0;font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.05);">
      
      <div style="background-color:#1E376E;padding:24px;text-align:center;">
        <img src="https://globalhealth.works/assets/logo-CiSW-R40.png" alt="GlobalHealth.Works" style="height:50px;margin-bottom:6px;">
        <h1 style="color:#fff;font-size:22px;margin:0;">${title}</h1>
      </div>

      <div style="padding:32px 28px;color:#333;line-height:1.6;">
        ${content}
      </div>

      <div style="background-color:#F1F5F9;padding:16px;text-align:center;font-size:13px;color:#6B7280;">
        © ${new Date().getFullYear()} GlobalHealth.Works<br>
        Building a stronger global health community.
      </div>
    </div>
  </div>
  `;
}

// RESEND sendMail function
async function sendMail(to, subject, htmlContent) {
  try {
    const { data, error } = await resend.emails.send({
      from: "GlobalHealth.Works <admin@globalhealth.works>",
      to,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error("Email send error:", error);
    } else {
      console.log("📧 Email sent:", data.id);
    }
  } catch (err) {
    console.error("Email send error:", err);
  }
}



// ✅ Templates for reuse
const Templates = {
  newUserAdminAlert: (user) =>
    emailLayout({
      title: "New User Registration Pending Approval",
      content: `
        <p>Hello Admin,</p>
        <p>A new <strong>${user.role}</strong> has registered on <strong>GlobalHealth.Works</strong>.</p>
        <table style="border-collapse:collapse;margin-top:12px;">
          <tr><td style="padding:4px 8px;"><strong>Name:</strong></td><td>${user.firstName} ${user.lastName}</td></tr>
          <tr><td style="padding:4px 8px;"><strong>Email:</strong></td><td>${user.email}</td></tr>
          <tr><td style="padding:4px 8px;"><strong>Organisation:</strong></td><td>${user.organisationName || "N/A"}</td></tr>
          <tr><td style="padding:4px 8px;"><strong>Country:</strong></td><td>${user.country || "N/A"}</td></tr>
        </table>
        <p style="margin-top:20px;">Login to your admin dashboard to review and approve this user.</p>
        <a href="https://globalhealth.works/login?redirect=/admin/review/${user._id}" style="display:inline-block;background-color:#357FE9;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:12px;">
           Review User
        </a>
      `,
    }),

  userApprovalNotice: (user) =>
    emailLayout({
      title: "Your Account Has Been Approved",
      content: `
        <p>Dear ${user.firstName},</p>
        <p>We’re happy to let you know your <strong>GlobalHealth.Works</strong> account has been approved by our admin team.</p>
        <p>You can now log in to your dashboard and start connecting with others in the global health community.</p>
        <a href="https://globalhealth.works/login" 
           style="display:inline-block;background-color:#E96435;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:12px;">
           Log In Now
        </a>
        <p style="margin-top:20px;">Welcome aboard,<br><strong>The GlobalHealth.Works Team</strong></p>
      `,
    }),

  approvalConfirmedAdminNotice: (admin, user) =>
    emailLayout({
      title: "User Account Approved",
      content: `
        <p>Hello ${admin.firstName},</p>
        <p>You successfully approved the account of:</p>
        <ul style="line-height:1.8;">
          <li><strong>Name:</strong> ${user.firstName} ${user.lastName}</li>
          <li><strong>Email:</strong> ${user.email}</li>
          <li><strong>Role:</strong> ${user.role}</li>
        </ul>
        <p>Thank you for keeping the community verified and secure.</p>
      `,
    }),

    welcomePending: (user) =>
  emailLayout({
    title: "Welcome to GlobalHealth.Works",
    content: `
      <p>Dear ${user.firstName},</p>
      <p>Thank you for joining the <strong>GlobalHealth.Works</strong> community!</p>
      <p>Your account is currently under review by our admin team. You will receive a confirmation email once your account has been approved.</p>
      <p>In the meantime, feel free to explore our platform and learn more about how we connect global health professionals, task owners, and solution providers.</p>
      <a href="https://globalhealth.works" 
         style="display:inline-block;background-color:#357FE9;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:12px;">
         Visit Platform
      </a>
      <p style="margin-top:20px;">Warm regards,<br><strong>The GlobalHealth.Works Team</strong></p>
    `,
  }),
  rejectionNotice: (user, reason) =>
  emailLayout({
    title: "Your Account Could Not Be Approved",
    content: `
      <p>Dear ${user.firstName},</p>
      <p>Thank you for your interest in joining <strong>GlobalHealth.Works</strong>.</p>
      <p>After reviewing your details, our admin team could not approve your account at this time.</p>

      <p><strong>Reason for rejection:</strong></p>
      <div style="background:#F8D7DA;color:#842029;padding:12px;border-radius:6px;margin:10px 0;border-left:4px solid #842029;">
        ${reason}
      </div>

      <p>If you believe this was a mistake or would like to update your information, you may register again.</p>

      <p>Warm regards,<br><strong>The GlobalHealth.Works Team</strong></p>
    `,
  }),
rejectionConfirmedAdminNotice: (admin, user, reason) =>
  emailLayout({
    title: "User Rejected",
    content: `
      <p>Hello ${admin.firstName},</p>
      <p>You rejected the account of:</p>

      <ul style="line-height:1.8;">
        <li><strong>Name:</strong> ${user.firstName} ${user.lastName}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Role:</strong> ${user.role}</li>
      </ul>

      <p><strong>Reason for rejection:</strong></p>
      <div style="background:#F8D7DA;color:#842029;padding:12px;border-radius:6px;margin-top:10px;border-left:4px solid #842029;">
        ${reason}
      </div>

      <p>This has been logged in the system.</p>
    `,
  }),
  newTaskAdminAlert: (task, owner) =>
  emailLayout({
    title: "New Task Submitted",
    content: `
      <p>Hello Admin,</p>
      <p>A new task has been created on <strong>GlobalHealth.Works</strong>.</p>

      <table style="border-collapse:collapse;margin-top:12px;">
        <tr>
          <td style="padding:4px 8px;"><strong>Title:</strong></td>
          <td>${task.title}</td>
        </tr>
        <tr>
          <td style="padding:4px 8px;"><strong>Summary:</strong></td>
          <td>${task.summary}</td>
        </tr>
        <tr>
          <td style="padding:4px 8px;"><strong>Created By:</strong></td>
          <td>${owner.firstName} ${owner.lastName}</td>
        </tr>
        <tr>
          <td style="padding:4px 8px;"><strong>Role:</strong></td>
          <td>${owner.role}</td>
        </tr>
      </table>

      <p style="margin-top:20px;">You can review the task details in the admin dashboard.</p>

      <a href="https://globalhealth.works/admin/tasks/${task._id}"
        style="display:inline-block;background-color:#357FE9;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:12px;">
        View Task
      </a>
    `,
  }),
  taskCreatedUserNotice: (user, task) =>
  emailLayout({
    title: "Your Task Has Been Created",
    content: `
      <p>Dear ${user.firstName},</p>

      <p>Your task <strong>${task.title}</strong> has been successfully created on <strong>GlobalHealth.Works</strong>.</p>

      <p>Here are the details:</p>

      <table style="border-collapse:collapse;margin-top:12px;">
        <tr>
          <td style="padding:4px 8px;"><strong>Title:</strong></td>
          <td>${task.title}</td>
        </tr>
        <tr>
          <td style="padding:4px 8px;"><strong>Summary:</strong></td>
          <td>${task.summary}</td>
        </tr>
        <tr>
          <td style="padding:4px 8px;"><strong>Focus Areas:</strong></td>
          <td>${task.focusAreas?.join(", ") || "N/A"}</td>
        </tr>
        <tr>
          <td style="padding:4px 8px;"><strong>Required Skills:</strong></td>
          <td>${task.requiredSkills?.join(", ") || "N/A"}</td>
        </tr>
      </table>

      <p style="margin-top:18px;">You can view or manage your task at any time from your dashboard.</p>

      <a href="https://globalhealth.works/dashboard/tasks"
         style="display:inline-block;background-color:#357FE9;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:12px;">
         Go to My Tasks
      </a>

      <p style="margin-top:20px;">Thank you for contributing to the global health community.<br><strong>The GlobalHealth.Works Team</strong></p>
    `,
  }),
  newMessageNotification: (receiver, sender, message, conversationId) =>
  emailLayout({
    title: "New Message Received",
    content: `
      <p>Dear ${receiver.firstName},</p>

      <p>You have a new message from <strong>${sender.firstName} ${sender.lastName}</strong> on <strong>GlobalHealth.Works</strong>.</p>

      <p style="margin-top:12px;"><strong>Message preview:</strong></p>
      <div style="background:#F1F5F9;padding:12px;border-radius:6px;border-left:4px solid #1E376E; font-style:italic;">
        ${message ? message.substring(0, 160) : "New attachment received"}
      </div>

      <p style="margin-top:20px;">Click below to continue the conversation.</p>

      <a href="https://globalhealth.works/chat/${conversationId}"
         style="display:inline-block;background-color:#357FE9;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:12px;">
         Open Chat
      </a>

      <p style="margin-top:20px;">
        Warm regards,<br>
        <strong>The GlobalHealth.Works Team</strong>
      </p>
    `,
  }),
  proposalSubmitted: (taskOwner, applicant, task, proposal) =>
  emailLayout({
    title: "New Proposal Received",
    content: `
      <p>Hello ${taskOwner.firstName},</p>
      <p>You have received a new proposal for your task <strong>${task.title}</strong>.</p>

      <p><strong>From:</strong> ${applicant.firstName} ${applicant.lastName}</p>
      <p><strong>Message:</strong></p>
      <p>${proposal.message}</p>

      ${proposal.proposedBudget ? `<p><strong>Budget:</strong> $${proposal.proposedBudget}</p>` : ""}
      ${proposal.proposedDuration ? `<p><strong>Duration:</strong> ${proposal.proposedDuration}</p>` : ""}

      <p>View the proposal in your dashboard to respond.</p>

      <a href="https://globalhealth.works/tasks/68e42135aa06fbcb4fff50a9" 
         style="display:inline-block;background-color:#357FE9;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:12px;">
         View Proposal
      </a>
    `,
  }),
  proposalSubmissionConfirmation: (applicant, task, proposal) =>
  emailLayout({
    title: "Proposal Submitted Successfully",
    content: `
      <p>Dear ${applicant.firstName},</p>
      <p>Thank you for submitting your proposal for the task <strong>${task.title}</strong>.</p>

      <p><strong>Your Proposal Details:</strong></p>
      <p><strong>Message:</strong> ${proposal.message}</p>
      ${proposal.proposedBudget ? `<p><strong>Proposed Budget:</strong> $${proposal.proposedBudget}</p>` : ""}
      ${proposal.proposedDuration ? `<p><strong>Proposed Duration:</strong> ${proposal.proposedDuration}</p>` : ""}

      <p>The task owner will review your proposal and notify you once a decision has been made.</p>

      <a href="https://globalhealth.works/" 
         style="display:inline-block;background-color:#357FE9;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:12px;">
         View My Proposals
      </a>

      <p style="margin-top:20px;">Best regards,<br><strong>The GlobalHealth.Works Team</strong></p>
    `,
  }),







};

module.exports = { sendMail, Templates };
