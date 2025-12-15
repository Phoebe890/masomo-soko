package com.eduhub.eduhub_backend.service;

// ... imports ...
import com.eduhub.eduhub_backend.service.ZoomService; // The service you already built
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import com.eduhub.eduhub_backend.repository.BookingRepository;
import com.eduhub.eduhub_backend.repository.TeacherAvailabilityRepository;
import com.eduhub.eduhub_backend.repository.UserRepository;
import com.eduhub.eduhub_backend.repository.TeacherProfileRepository;
import com.eduhub.eduhub_backend.entity.Booking;
import com.eduhub.eduhub_backend.entity.TeacherAvailability;
import com.eduhub.eduhub_backend.entity.User;
import com.eduhub.eduhub_backend.entity.TeacherProfile;
import com.eduhub.eduhub_backend.dto.BookingRequest;
import com.eduhub.eduhub_backend.entity.CoachingService;
import com.eduhub.eduhub_backend.entity.BookingStatus;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@Service
public class BookingService {

        @Autowired
        private BookingRepository bookingRepository;
        @Autowired
        private TeacherAvailabilityRepository availabilityRepository;
        @Autowired
        private UserRepository userRepository;
        @Autowired
        private TeacherProfileRepository teacherProfileRepository;
        @Autowired
        private ZoomService zoomService; // Your service that calls the Zoom API

        @Transactional // This is important! The whole operation should succeed or fail together.
        public Booking confirmBookingAndCreateMeeting(BookingRequest request, UserDetails userDetails) {
                // 1. Find the student, teacher, service, and availability slot from the
                // database.
                User student = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("Student not found."));
                User teacher = userRepository.findById(request.getTeacherId())
                                .orElseThrow(() -> new RuntimeException("Teacher not found."));
                CoachingService service = null;
                if (request.getServiceId() != null) {
                        // You may need a CoachingServiceRepository to fetch this
                        // service =
                        // coachingServiceRepository.findById(request.getServiceId()).orElseThrow(...);
                }
                TeacherAvailability slot = availabilityRepository.findById(request.getAvailabilitySlotId())
                                .orElseThrow(() -> new RuntimeException("Slot not found."));
                if (slot.isBooked()) {
                        throw new RuntimeException("This slot has already been booked.");
                }
                slot.setBooked(true);
                availabilityRepository.save(slot);

                // 3. Call the ZoomService to create the meeting.
                TeacherProfile teacherProfile = teacherProfileRepository.findByUserId(teacher.getId())
                                .orElseThrow(() -> new RuntimeException("Teacher profile not found."));
                Map<String, Object> meetingDetails = new HashMap<>();
                meetingDetails.put("topic", "Coaching Session");
                meetingDetails.put("start_time", slot.getStartTime().toString());
                meetingDetails.put("duration", 60); // or calculate from slot
                meetingDetails.put("type", 2); // Scheduled meeting
                String zoomMeetingUrl = (String) zoomService.createMeetingForTeacher(teacherProfile, meetingDetails)
                                .get("join_url");

                // 4. Create and save the new Booking entity.
                Booking newBooking = new Booking();
                newBooking.setStudent(student);
                newBooking.setTeacher(teacher);
                newBooking.setService(service); // if service is not null
                newBooking.setStartTime(slot.getStartTime());
                newBooking.setEndTime(slot.getEndTime());
                newBooking.setPricePaid(0.0); // Set actual price if available
                newBooking.setZoomMeetingUrl(zoomMeetingUrl);
                newBooking.setStatus(BookingStatus.CONFIRMED);

                return bookingRepository.save(newBooking);

                // 5. (In a real app) After this method returns successfully, trigger
                // notification emails.
        }

        public List<Booking> getBookingsForStudent(UserDetails userDetails) {
                User student = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("Student not found."));
                return bookingRepository.findByStudentId(student.getId());
        }

        public List<Booking> getBookingsForTeacher(UserDetails userDetails) {
                User teacher = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("Teacher not found."));
                return bookingRepository.findByTeacherId(teacher.getId());
        }
}