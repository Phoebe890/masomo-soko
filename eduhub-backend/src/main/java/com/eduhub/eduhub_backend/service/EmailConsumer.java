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
            logger.info("Attempting to send email to: {}", emailRequest.getTo());

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(emailRequest.getTo());
            message.setSubject(emailRequest.getSubject());
            message.setText(emailRequest.getBody());
            
            message.setFrom("Masomo Soko <chey45634@gmail.com>");

            mailSender.send(message);
            logger.info("Email successfully sent to: {}", emailRequest.getTo());
        } catch (Exception e) {
            // Log the full error stack trace for effective debugging
            logger.error("Failed to send email to {}. Error: {}", emailRequest.getTo(), e.getMessage(), e);
        }
    }
}