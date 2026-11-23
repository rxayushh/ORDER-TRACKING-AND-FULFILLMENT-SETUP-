package com.ordertracking.service;

import com.ordertracking.dto.AddressCreateRequest;
import com.ordertracking.dto.CustomerAddressDto;
import com.ordertracking.dto.CustomerProfileDto;
import com.ordertracking.dto.CustomerSummaryDto;
import com.ordertracking.dto.ProfileUpdateRequest;
import com.ordertracking.entity.CustomerAddress;
import com.ordertracking.entity.RoleName;
import com.ordertracking.entity.User;
import com.ordertracking.exception.ResourceNotFoundException;
import com.ordertracking.repository.CustomerAddressRepository;
import com.ordertracking.repository.OrderRepository;
import com.ordertracking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final UserRepository userRepository;
    private final CustomerAddressRepository addressRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public CustomerProfileDto getProfile(Long userId) {
        return mapProfile(loadUser(userId));
    }

    @Transactional
    public CustomerProfileDto updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = loadUser(userId);
        user.setFullName(request.getFullName().trim());
        String phone = request.getPhoneNumber();
        user.setPhoneNumber(phone == null || phone.isBlank() ? null : phone.trim());
        return mapProfile(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<CustomerAddressDto> getCustomerAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).stream()
                .map(this::mapAddressToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomerAddressDto addAddress(Long userId, AddressCreateRequest request) {
        User user = loadUser(userId);

        List<CustomerAddress> existing = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
        boolean isFirst = existing.isEmpty();

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            existing.forEach(a -> a.setIsDefault(false));
            addressRepository.saveAll(existing);
        }

        CustomerAddress address = CustomerAddress.builder()
                .user(user)
                .recipientName(request.getRecipientName().trim())
                .phoneNumber(request.getPhoneNumber().trim())
                .streetAddress(request.getStreetAddress().trim())
                .city(request.getCity().trim())
                .state(request.getState().trim())
                .postalCode(request.getPostalCode().trim())
                .country(request.getCountry() != null ? request.getCountry() : "India")
                .addressType(request.getAddressType() != null ? request.getAddressType() : "HOME")
                .isDefault(isFirst || Boolean.TRUE.equals(request.getIsDefault()))
                .build();

        return mapAddressToDto(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        CustomerAddress address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));
        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());
        addressRepository.delete(address);

        if (wasDefault) {
            List<CustomerAddress> remaining = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
            if (!remaining.isEmpty() && remaining.stream().noneMatch(a -> Boolean.TRUE.equals(a.getIsDefault()))) {
                remaining.get(0).setIsDefault(true);
                addressRepository.save(remaining.get(0));
            }
        }
    }

    @Transactional
    public CustomerAddressDto setDefaultAddress(Long userId, Long addressId) {
        List<CustomerAddress> addresses = addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
        CustomerAddress selected = addresses.stream()
                .filter(a -> a.getId().equals(addressId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        addresses.forEach(a -> a.setIsDefault(a.getId().equals(selected.getId())));
        addressRepository.saveAll(addresses);
        return mapAddressToDto(selected);
    }

    @Transactional(readOnly = true)
    public Page<CustomerSummaryDto> getCustomersForAdmin(String search, Pageable pageable) {
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        return userRepository.findByRoleAndSearch(RoleName.ROLE_CUSTOMER, cleanSearch, pageable)
                .map(this::mapSummary);
    }

    private User loadUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private CustomerProfileDto mapProfile(User user) {
        return CustomerProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .enabled(user.getEnabled())
                .roles(user.getRoles().stream().map(r -> r.getName().name()).sorted().collect(Collectors.toList()))
                .createdAt(user.getCreatedAt())
                .build();
    }

    private CustomerSummaryDto mapSummary(User user) {
        return CustomerSummaryDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .enabled(user.getEnabled())
                .orderCount(orderRepository.countByUserId(user.getId()))
                .roles(user.getRoles().stream().map(r -> r.getName().name()).sorted().collect(Collectors.toList()))
                .createdAt(user.getCreatedAt())
                .build();
    }

    public CustomerAddressDto mapAddressToDto(CustomerAddress address) {
        if (address == null) return null;
        return CustomerAddressDto.builder()
                .id(address.getId())
                .recipientName(address.getRecipientName())
                .phoneNumber(address.getPhoneNumber())
                .streetAddress(address.getStreetAddress())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .addressType(address.getAddressType())
                .isDefault(address.getIsDefault())
                .createdAt(address.getCreatedAt())
                .build();
    }
}
