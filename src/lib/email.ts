import nodemailer from 'nodemailer'
import { prisma } from './prisma'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Lumi Billing <noreply@lumisolutions.tech>',
      to,
      subject,
      html,
    })

    await prisma.emailLog.create({
      data: {
        to,
        subject,
        body: html,
        sent: true,
        sentAt: new Date(),
      },
    })

    return info
  } catch (error: any) {
    await prisma.emailLog.create({
      data: {
        to,
        subject,
        body: html,
        sent: false,
        error: error.message,
      },
    })
    throw error
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Lumi Billing!</h1>
        </div>
        <div class="content">
          <p>Thank you for registering with Lumi Billing.</p>
          <p>Please verify your email address by clicking the button below:</p>
          <center>
            <a href="${verifyUrl}" class="button">Verify Email Address</a>
          </center>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #3b82f6;">${verifyUrl}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Lumi Solutions. All rights reserved.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail(email, 'Verify Your Email - Lumi Billing', html)
}

export async function sendWelcomeEmail(email: string, firstName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Lumi Billing, ${firstName}!</h1>
        </div>
        <div class="content">
          <p>Your account has been successfully verified and is now active.</p>
          <p>You can now:</p>
          <ul>
            <li>Browse and order services</li>
            <li>Manage your services</li>
            <li>View and pay invoices</li>
            <li>Open support tickets</li>
          </ul>
          <p>Visit your dashboard at: <a href="${process.env.NEXTAUTH_URL}/client">${process.env.NEXTAUTH_URL}/client</a></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Lumi Solutions. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail(email, 'Welcome to Lumi Billing!', html)
}

export async function sendInvoiceEmail(email: string, invoiceNumber: string, total: number, dueDate: Date) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .invoice-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Invoice</h1>
        </div>
        <div class="content">
          <p>A new invoice has been generated for your account.</p>
          <div class="invoice-details">
            <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
            <p><strong>Amount Due:</strong> $${total.toFixed(2)}</p>
            <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
          </div>
          <center>
            <a href="${process.env.NEXTAUTH_URL}/client/invoices" class="button">View Invoice</a>
          </center>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Lumi Solutions. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail(email, `New Invoice ${invoiceNumber}`, html)
}
