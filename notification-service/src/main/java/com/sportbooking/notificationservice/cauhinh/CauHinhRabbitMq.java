/**
 * File: CauHinhRabbitMq.java
 * Muc dich: Khai bao Exchange, Queue, Binding va bo chuyen doi JSON cho luong thong bao bat dong bo (RabbitMQ).
 */
package com.sportbooking.notificationservice.cauhinh;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CauHinhRabbitMq {

    public static final String NOTIFICATION_EXCHANGE = "sportbooking.notification.exchange";
    public static final String NOTIFICATION_QUEUE = "sportbooking.notification.queue";
    public static final String NOTIFICATION_ROUTING_PATTERN = "notification.#";

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(NOTIFICATION_EXCHANGE, true, false);
    }

    @Bean
    public Queue notificationQueue() {
        return new Queue(NOTIFICATION_QUEUE, true);
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(notificationQueue)
                .to(notificationExchange)
                .with(NOTIFICATION_ROUTING_PATTERN);
    }

    @Bean
    public MessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
