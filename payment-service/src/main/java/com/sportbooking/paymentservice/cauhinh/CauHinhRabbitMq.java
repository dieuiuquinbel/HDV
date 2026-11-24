/**
 * File: CauHinhRabbitMq.java
 * Muc dich: Cau hinh Producer RabbitMQ (Exchange + JSON MessageConverter) de ban su kien thong bao vi bat dong bo.
 */
package com.sportbooking.paymentservice.cauhinh;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CauHinhRabbitMq {

    public static final String NOTIFICATION_EXCHANGE = "sportbooking.notification.exchange";

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(NOTIFICATION_EXCHANGE, true, false);
    }

    @Bean
    public MessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
