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
    public String filePath;
    public String teacherName;
    public String teacherEmail;
    public Double averageRating;
    public List<ReviewDTO> reviews;
    public String previewImageUrl;
    public boolean hasPreview;
    public int salesCount;
    public TeacherResourceDTO(TeacherResource resource) {
        this.id = resource.getId();
        this.title = resource.getTitle();
        this.description = resource.getDescription();
        this.subject = resource.getSubject();
        this.grade = resource.getGrade();
        this.curriculum = resource.getCurriculum();
        this.pricing = resource.getPricing();
        this.price = resource.getPrice();
        this.filePath = resource.getFilePath();
        this.teacherName = resource.getUser() != null ? resource.getUser().getName() : null;
        this.teacherEmail = resource.getUser() != null ? resource.getUser().getEmail() : null;
        this.previewImageUrl = resource.getPreviewImageUrl();
        this.hasPreview = resource.isHasPreview();
         this.salesCount = resource.getSalesCount();
    }

    public TeacherResourceDTO(TeacherResource resource, List<Review> reviewList) {
        this(resource);

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

            if (review.getCreatedAt() != null) {
                this.createdAt = review.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));
            } else {
                this.createdAt = null;
            }
        }
    }
}