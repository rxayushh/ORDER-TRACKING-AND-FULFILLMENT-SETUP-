package com.ordertracking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @Column(name = "transaction_type", nullable = false, length = 50)
    private String transactionType; // STOCK_IN, STOCK_OUT, RESERVED, RELEASED, ADJUSTMENT

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "reference_id", length = 100)
    private String referenceId; // e.g., Order number or adjustment ref

    @Column(name = "reference_type", length = 50)
    private String referenceType; // ORDER, MANUAL_AUDIT, RETURN

    @Column(length = 255)
    private String notes;

    @Column(name = "performed_by", length = 150)
    private String performedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
