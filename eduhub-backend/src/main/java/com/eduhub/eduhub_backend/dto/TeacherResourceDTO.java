package com.eduhub.eduhub_backend.dto;

import com.eduhub.eduhub_backend.entity.Review;
import com.eduhub.eduhub_backend.entity.TeacherResource;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

public class TeacherResourceDTO {
    public Long id;
    public String title;
    public String description;
    public String subject;
    public String grade;
    public String curriculum;
    public String pricing;
    public Double price;
    
    /**
     * This field now holds the direct, public URL from Cloudinary.
     * It can be used directly in the frontend for downloads and image previews.
     */
    public String filePath; 
    
    public String teacherName;
    public String teacherEmail;
    public Double averageRating;
    public List<ReviewDTO> reviews;

    /**
     * Main constructor to map a TeacherResource entity to its DTO representation.
     */
    public TeacherResourceDTO(TeacherResource resource) {
        this.id = resource.getId();
        this.title = resource.getTitle();
        this.description = resource.getDescription();
        this.subject = resource.getSubject();
        this.grade = resource.getGrade();
        this.curriculum = resource.getCurriculum();
        this.pricing = resource.getPricing();
        this.price = resource.getPrice();
        
        // The filePath is now the direct Cloudinary URL. No modification or prefix is needed.
        this.filePath = resource.getFilePath(); 
        
        this.teacherName = resource.getUser() != null ? resource.getUser().getName() : null;
        this.teacherEmail = resource.getUser() != null ? resource.getUser().getEmail() : null;
    }

    /**
     * Overloaded constructor that also processes a list of reviews for the resource.
     */
    public TeacherResourceDTO(TeacherResource resource, List<Review> reviewList) {
        this(resource); // Calls the main constructor to set up the basic fields.
        
        if (reviewList != null && !reviewList.isEmpty()) {
            this.averageRating = reviewList.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            this.reviews = reviewList.stream()
                    .map(ReviewDTO::new)
                    .collect(Collectors.toList());
        } else {
            this.averageRating = 0.0;
            this.reviews = List.of();
        }
    }

    /**
     * Inner DTO for representing a single review.
     */
    public static class ReviewDTO {
        public Long id;
        public String studentName;
        public int rating;
        public String comment;
        public String createdAt;

        public ReviewDTO(Review review) {
            this.id = review.getId();
            this.studentName = review.getStudent() != null ? review.getStudent().getName() : "Anonymous";
            this.rating = review.getRating();
            this.comment = review.getComment();
            
            // Format the date into a more user-friendly string for the frontend.
            if (review.getCreatedAt() != null) {
                this.createdAt = review.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
            } else {
                this.createdAt = null;
            }
        }
    }
}