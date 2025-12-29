package com.eduhub.eduhub_backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class FileUploadService {

    @Autowired
    private Cloudinary cloudinary;

    public Map uploadFile(MultipartFile file) throws IOException {
        
        // 1. Get original filename and extension
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        
        // Extract extension (e.g., ".pdf")
        if (originalFilename != null && originalFilename.contains(".")) {
             extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        // 2. Create a unique Public ID but KEEP the extension
        // e.g. "550e8400-e29b-41d4-a716-446655440000.pdf"
        // Cloudinary needs the extension in the public_id for RAW files to work as links
        String publicId = UUID.randomUUID().toString() + extension;

        Map params = ObjectUtils.asMap(
            "resource_type", "auto",
            "folder", "eduhub_resources",
            "public_id", publicId,   // Use our custom ID with extension
            "use_filename", true,    // Use the filename provided
            "unique_filename", false // Don't let Cloudinary add random chars, we already used UUID
        );

        return cloudinary.uploader().upload(file.getBytes(), params);
    }

    public String generatePreviewImageUrl(Map uploadResult) {
        String publicId = (String) uploadResult.get("public_id");
        String format = (String) uploadResult.get("format");

        if (publicId == null) {
            return null;
        }

        // Generate thumbnail for Documents (PDF, DOC, PPT)
        if ("pdf".equals(format) || "doc".equals(format) || "docx".equals(format) || "ppt".equals(format) || "pptx".equals(format)) {
            return cloudinary.url()
                    .transformation(new Transformation<>()
                            .page("1")
                            .width(400)
                            .crop("limit")
                            .fetchFormat("jpg")
                    )
                    .generate(publicId);
        }

        // Just return URL for Images
        if ("jpg".equals(format) || "jpeg".equals(format) || "png".equals(format) || "gif".equals(format)) {
            return (String) uploadResult.get("secure_url");
        }
        
        return null;
    }
}