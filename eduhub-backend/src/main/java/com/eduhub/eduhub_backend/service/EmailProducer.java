package com.eduhub.eduhub_backend.service;

import com.eduhub.eduhub_backend.config.RabbitMQConfig;
import com.eduhub.eduhub_backend.dto.EmailRequest;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmailProducer {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void sendEmail(String to, String subject, String body) {
        EmailRequest request = new EmailRequest(to, subject, body);
        rabbitTemplate.convertAndSend(RabbitMQConfig.EMAIL_QUEUE, request);
        System.out.println("Email Queued: " + to);
    }
}