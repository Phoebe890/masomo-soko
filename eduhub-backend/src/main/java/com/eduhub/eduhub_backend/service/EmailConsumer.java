package com.eduhub.eduhub_backend.service;

import com.eduhub.eduhub_backend.config.RabbitMQConfig;
import com.eduhub.eduhub_backend.dto.EmailRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage; // Import this
import org.springframework.mail.javamail.MimeMessageHelper; // Import this
@Service
public class EmailConsumer {

    // Use SLF4J logger for better logging practices
    private static final Logger logger = LoggerFactory.getLogger(EmailConsumer.class);

    @Autowired
    private JavaMailSender mailSender;

    // Listen for messages on the email_queue
   @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE)
public void receiveMessage(EmailRequest emailRequest) {
    try {
        logger.info("CONSUMER: Received request for: {}", emailRequest.getTo());

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

        helper.setTo(emailRequest.getTo());
        helper.setSubject(emailRequest.getSubject());
        helper.setText(emailRequest.getBody(), false);
        helper.setFrom("chey45634@gmail.com", "Masomo Soko");

        mailSender.send(mimeMessage);
        logger.info("CONSUMER: Email successfully sent to: {}", emailRequest.getTo());
    } catch (Exception e) {
        // This is the most important log
        logger.error("CONSUMER ERROR for {}: Type: {}, Message: {}", 
                     emailRequest.getTo(), e.getClass().getSimpleName(), e.getMessage());
        e.printStackTrace(); 
    }
}
}