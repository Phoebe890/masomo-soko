package com.eduhub.eduhub_backend.dto;

public class BookingRequest {
    private Long teacherId;
    private Long serviceId;
    private Long availabilitySlotId;

    public Long getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public Long getAvailabilitySlotId() {
        return availabilitySlotId;
    }

    public void setAvailabilitySlotId(Long availabilitySlotId) {
        this.availabilitySlotId = availabilitySlotId;
    }
}