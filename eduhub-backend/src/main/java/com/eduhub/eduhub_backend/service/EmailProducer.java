package com.eduhub.eduhub_backend.service;

import com.eduhub.eduhub_backend.config.RabbitMQConfig;
import com.eduhub.eduhub_backend.dto.EmailRequest;
import org.slf4j.Logger; // <--- ADD THIS
import org.slf4j.LoggerFactory; 
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmailProducer {
private static final Logger logger = LoggerFactory.getLogger(EmailProducer.class);
     @Autowired
    private RabbitTemplate rabbitTemplate;

    public void sendEmail(String to, String subject, String body) {
        try {
            EmailRequest request = new EmailRequest(to, subject, body);
            rabbitTemplate.convertAndSend(RabbitMQConfig.EMAIL_QUEUE, request);
            logger.info("PRODUCER: Successfully queued email for: {}", to);
        } catch (Exception e) {
            logger.error("PRODUCER ERROR: Failed to send to RabbitMQ. Message: {}", e.getMessage());
        }
    }
}