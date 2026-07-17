package com.ak.ems.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public void sendCredentialsEmail(String toEmail, String name, String username, String password) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            if (fromEmail != null && !fromEmail.isEmpty()) {
                helper.setFrom(fromEmail);
            }
            helper.setTo(toEmail);
            helper.setSubject("Welcome to EMS - Your Login Credentials");

            String htmlContent = String.format(
                "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "  <style>" +
                "    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; color: #334155; margin: 0; padding: 0; }" +
                "    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); overflow: hidden; border: 1px solid #e2e8f0; }" +
                "    .header { background-color: #0f172a; padding: 32px; text-align: center; }" +
                "    .logo { color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.05em; display: inline-block; background-color: #2563eb; padding: 8px 16px; border-radius: 12px; margin-bottom: 8px; }" +
                "    .title { color: #ffffff; font-size: 20px; font-weight: 700; margin: 8px 0 0 0; }" +
                "    .content { padding: 40px 32px; line-height: 1.6; }" +
                "    .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }" +
                "    .credentials-box { background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0; }" +
                "    .cred-row { margin-bottom: 12px; font-size: 15px; }" +
                "    .cred-row:last-child { margin-bottom: 0; }" +
                "    .label { font-weight: 600; color: #64748b; display: inline-block; width: 100px; }" +
                "    .value { font-family: monospace; font-size: 16px; font-weight: 700; color: #0f172a; background-color: #e2e8f0; padding: 2px 8px; border-radius: 4px; }" +
                "    .btn-container { text-align: center; margin-top: 32px; }" +
                "    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; font-size: 15px; padding: 14px 28px; text-decoration: none; border-radius: 10px; transition: background-color 0.2s; }" +
                "    .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }" +
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>" +
                "      <div class='logo'>E</div>" +
                "      <div class='title'>Employee Management System</div>" +
                "    </div>" +
                "    <div class='content'>" +
                "      <div class='greeting'>Hello %s,</div>" +
                "      <p>Welcome to the EMS portal! An administrator has created an account for you. Below are your dynamic login credentials to access your secure dashboard:</p>" +
                "      <div class='credentials-box'>" +
                "        <div class='cred-row'><span class='label'>Username:</span> <span class='value'>%s</span></div>" +
                "        <div class='cred-row'><span class='label'>Password:</span> <span class='value'>%s</span></div>" +
                "      </div>" +
                "      <p>For security purposes, please make sure to log in and change your password immediately upon your first sign in.</p>" +
                "      <div class='btn-container'>" +
                "        <a href='https://employment-management-system-gamma.vercel.app/login' class='btn'>Log In To Your Account</a>" +
                "      </div>" +
                "    </div>" +
                "    <div class='footer'>" +
                "      This is an automated security email. Please do not reply directly to this message.<br/>" +
                "      &copy; 2025 EMS Platform. All rights reserved." +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>",
                name, username, password
            );

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
            logger.info("Credentials HTML email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send HTML email to: {}. Error: {}", toEmail, e.getMessage());
            // We don't throw exception here to prevent user creation from failing if email fails
        }
    }
}
