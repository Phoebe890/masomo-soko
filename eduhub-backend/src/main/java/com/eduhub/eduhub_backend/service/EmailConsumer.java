package com.eduhub.eduhub_backend.service;

import com.eduhub.eduhub_backend.config.RabbitMQConfig;
import com.eduhub.eduhub_backend.dto.EmailRequest;
import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailConsumer {

    private static final Logger logger = LoggerFactory.getLogger(EmailConsumer.class);

    // Pulls the Resend API Key (re_...) from environment variables
    // Added a default "dummy_key" to prevent local crashes
    @Value("${EMAIL_PASSWORD:dummy_key}")
    private String resendApiKey;

    @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE)
    public void receiveMessage(EmailRequest emailRequest) {
        try {
            logger.info("RESEND API: Attempting to send email to: {}", emailRequest.getTo());

            // 1. Initialize Resend Client
            Resend resend = new Resend(resendApiKey);

            // 2. Format Body: Convert plain text newlines (\n) to HTML breaks (<br/>)
            // This prevents the "squeezed" look
            String formattedBody = emailRequest.getBody().replace("\n", "<br/>");

            // 3. Wrap in Professional HTML Template
            String htmlContent = "<div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;\">" +
                    "    <h2 style=\"color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;\">" + emailRequest.getSubject() + "</h2>" +
                    "    <div style=\"padding: 20px 0; font-size: 16px;\">" +
                             formattedBody +
                    "    </div>" +
                    "    <p style=\"margin-top: 30px; font-size: 14px; color: #7f8c8d; border-top: 1px solid #eee; padding-top: 20px;\">" +
                    "        Regards,<br/>" +
                    "        <strong>The Masomo Soko Team</strong><br/>" +
                    "        <a href=\"https://masomosoko.co.ke\" style=\"color: #3498db; text-decoration: none;\">masomosoko.co.ke</a>" +
                    "    </p>" +
                    "</div>";

            // 4. Build Email Options
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from("Masomo Soko <info@masomosoko.co.ke>")
                    .to(emailRequest.getTo())
                    .subject(emailRequest.getSubject())
                    .html(htmlContent) // Setting content as HTML
                    .build();

            // 5. Execute Send
            CreateEmailResponse response = resend.emails().send(params);
            
            logger.info("RESEND API: Success! Email sent to {}. ID: {}", emailRequest.getTo(), response.getId());

        } catch (Exception e) {
            logger.error("RESEND API ERROR: Failed to send email to {}. Error: {}", 
                         emailRequest.getTo(), e.getMessage());
            // Log the stack trace locally for debugging
            e.printStackTrace();
        }
    }
}