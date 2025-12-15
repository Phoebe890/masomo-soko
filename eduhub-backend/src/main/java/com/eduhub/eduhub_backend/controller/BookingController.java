package com.eduhub.eduhub_backend.controller;

// ... imports ...
import com.eduhub.eduhub_backend.service.BookingService; // You will create this service
import com.eduhub.eduhub_backend.entity.Booking;
import com.eduhub.eduhub_backend.dto.BookingRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class BookingController {

    private final BookingService bookingService;

    @Autowired
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Endpoint for a student to INITIATE a booking
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Booking confirmedBooking = bookingService.confirmBookingAndCreateMeeting(request, userDetails);
            return ResponseEntity.ok(confirmedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Endpoint for a student to see their bookings
    @GetMapping("/my-bookings/student")
    public ResponseEntity<List<Booking>> getMyStudentBookings(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<Booking> bookings = bookingService.getBookingsForStudent(userDetails);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Endpoint for a teacher to see their bookings
    @GetMapping("/my-bookings/teacher")
    public ResponseEntity<List<Booking>> getMyTeacherBookings(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<Booking> bookings = bookingService.getBookingsForTeacher(userDetails);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}