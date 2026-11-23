package com.ordertracking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(name = "tracking_number", nullable = false, unique = true, length = 100)
    private String trackingNumber;

    @Builder.Default
    @Column(nullable = false, length = 100)
    private String carrier = "LogiTrack Express";

    @Builder.Default
    @Column(name = "shipping_status", nullable = false, length = 50)
    private String shippingStatus = "PREPARING"; // PREPARING, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED

    @Column(name = "estimated_delivery")
    private LocalDateTime estimatedDelivery;

    @Column(name = "dispatched_at")
    private LocalDateTime dispatchedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "shipping_notes", columnDefinition = "TEXT")
    private String shippingNotes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
