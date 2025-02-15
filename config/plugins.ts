module.exports = ({ env }) => ({
    email: {
      config: {
        provider: "nodemailer",
        providerOptions: {
          host: env("SMTP_HOST", "smtp.example.com"),
          port: env("SMTP_PORT", 587),
          auth: {
            user: env("SMTP_USER", "your-email@example.com"),
            pass: env("SMTP_PASS", "your-email-password"),
          },
        },
        settings: {
          defaultFrom: "noreply@example.com",
          defaultReplyTo: "noreply@example.com",
        },
      },
    },
  });
  