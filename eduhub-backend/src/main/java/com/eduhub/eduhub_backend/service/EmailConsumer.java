package com.eduhub.eduhub_backend.service;

import com.eduhub.eduhub_backend.dto.EmailRequest;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
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

   // If EMAIL_PASSWORD isn't found, it will use "dummy_key" instead of crashing
@Value("${EMAIL_PASSWORD:dummy_key}")
private String resendApiKey;

    @RabbitListener(queues = "eduhub_email_queue")
    public void receiveMessage(EmailRequest emailRequest) {
        try {
            logger.info("API ATTEMPT: Sending email to: {}", emailRequest.getTo());

            // 1. Initialize Resend Client (Uses HTTPS Port 443)
            Resend resend = new Resend(resendApiKey);

            // 2. Build the Email
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from("Masomo Soko <info@masomosoko.co.ke>")
                    .to(emailRequest.getTo())
                    .subject(emailRequest.getSubject())
                    .html(emailRequest.getBody()) // or .text() for plain text
                    .build();

            // 3. Send via API
            CreateEmailResponse response = resend.emails().send(params);
            
            logger.info("API SUCCESS: Email sent! ID: {}", response.getId());

        } catch (ResendException e) {
            logger.error("RESEND API ERROR: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("GENERAL ERROR: {}", e.getMessage());
        }
    }
}