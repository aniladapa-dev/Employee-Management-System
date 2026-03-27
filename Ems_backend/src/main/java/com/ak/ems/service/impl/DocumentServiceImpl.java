package com.ak.ems.service.impl;

import com.ak.ems.dto.DocumentDto;
import com.ak.ems.entity.Document;
import com.ak.ems.repository.DocumentRepository;
import com.ak.ems.service.DocumentService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentServiceImpl.class);
    private final DocumentRepository documentRepository;
    private final Cloudinary cloudinary;

    @Override
    public DocumentDto uploadDocument(Long employeeId, MultipartFile file) {
        try {
            logger.info("Attempting to upload file: {} for employeeId: {}", file.getOriginalFilename(), employeeId);

            // Upload to Cloudinary
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "auto",
                            "access_mode", "public"));

            String fileUrl = uploadResult.get("secure_url").toString();
            logger.info("Cloudinary upload successful. URL: {}", fileUrl);

            // Save metadata in DB
            Document document = new Document();
            document.setEmployeeId(employeeId);
            document.setFileName(file.getOriginalFilename());
            document.setFileType(file.getContentType());
            document.setFileUrl(fileUrl);
            document.setFilePath(fileUrl);
            document.setPublicId(uploadResult.get("public_id").toString());
            document.setResourceType(uploadResult.get("resource_type").toString());
            
            // Defensively get format
            String format = null;
            if (uploadResult.containsKey("format") && uploadResult.get("format") != null) {
                format = uploadResult.get("format").toString();
            } else {
                // Fallback: Extract from secure_url (e.g., ".../abc.pdf")
                if (fileUrl.contains(".")) {
                    format = fileUrl.substring(fileUrl.lastIndexOf(".") + 1);
                    logger.info("Format not in result, extracted from URL: {}", format);
                }
            }
            document.setFormat(format);
            document.setUploadedAt(LocalDateTime.now());

            Document saved = documentRepository.save(document);
            return mapToDto(saved);

        } catch (Exception e) {
            logger.error("Cloudinary upload failed for employeeId: {}. Error: {}", employeeId, e.getMessage(), e);
            throw new RuntimeException(
                    "Cloudinary upload failed: " + e.getMessage() + ". Check Render logs for full stack trace.");
        }
    }

    @Override
    public List<DocumentDto> getDocumentsByEmployee(Long employeeId) {
        return documentRepository.findByEmployeeId(employeeId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public DocumentDto getDocumentInfo(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        return mapToDto(document);
    }

    // Mapper
    private DocumentDto mapToDto(Document document) {
        return new DocumentDto(
                document.getId(),
                document.getEmployeeId(),
                document.getFileName(),
                document.getFileType(),
                document.getFileUrl(),
                document.getUploadedAt());
    }

    @Override
    public String getDownloadUrl(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getPublicId() != null && document.getResourceType() != null) {
            // Generate a signed URL for secure access
            // Corrected: Include the format (extension) in the public ID if available
            String publicIdWithFormat = document.getPublicId();
            if (document.getFormat() != null && !document.getFormat().isEmpty()) {
                // Only append if it's not already there (raw resources include it in publicId)
                if (!publicIdWithFormat.endsWith("." + document.getFormat())) {
                    publicIdWithFormat += "." + document.getFormat();
                }
            }

            String signedUrl = cloudinary.url()
                    .resourceType(document.getResourceType())
                    .secure(true)
                    .signed(true)
                    .generate(publicIdWithFormat);
            
            logger.info("Generated Signed Download URL: {}", signedUrl);
            return signedUrl;
        }

        return document.getFileUrl();
    }
}