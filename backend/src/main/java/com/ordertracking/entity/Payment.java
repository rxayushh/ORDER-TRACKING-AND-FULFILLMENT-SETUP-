package com.ordertracking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "transaction_ref", nullable = false, unique = true, length = 100)
    private String transactionRef;

    @Builder.Default
    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod = "SIMULATED_GATEWAY";

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Builder.Default
    @Column(name = "payment_status", nullable = false, length = 50)
    private String paymentStatus = "SUCCESS";

    @Column(name = "gateway_response", columnDefinition = "TEXT")
    private String gatewayResponse;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
