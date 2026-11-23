package com.ordertracking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "fulfillment_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FulfillmentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_user_id")
    private User assignedTo;

    @Builder.Default
    @Column(name = "fulfillment_status", nullable = false, length = 50)
    private String fulfillmentStatus = "AWAITING_PROCESSING"; // AWAITING_PROCESSING, PICKED, PACKED, READY_FOR_DISPATCH, DISPATCHED, COMPLETED

    @Column(name = "picked_at")
    private LocalDateTime pickedAt;

    @Column(name = "packed_at")
    private LocalDateTime packedAt;

    @Column(name = "dispatched_at")
    private LocalDateTime dispatchedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
