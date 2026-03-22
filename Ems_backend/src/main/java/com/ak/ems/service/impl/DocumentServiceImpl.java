package com.ak.ems.service.impl;

import com.ak.ems.dto.DocumentDto;
import com.ak.ems.entity.Document;
import com.ak.ems.repository.DocumentRepository;
import com.ak.ems.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public DocumentDto uploadDocument(Long employeeId, MultipartFile file) {
        try {
            Path root = Paths.get(uploadDir);
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            String originalFileName = file.getOriginalFilename();
            String fileName = UUID.randomUUID().toString() + "_" + originalFileName;
            Path destination = root.resolve(fileName);
            
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            Document document = new Document();
            document.setEmployeeId(employeeId);
            document.setFileName(originalFileName);
            document.setFileType(file.getContentType());
            document.setFilePath(destination.toString());
            document.setUploadedAt(LocalDateTime.now());

            Document saved = documentRepository.save(document);
            return mapToDto(saved);
        } catch (IOException e) {
            throw new RuntimeException("Could not store file. Error: " + e.getMessage());
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
    public Resource downloadDocument(Long documentId) {
        try {
            Document document = documentRepository.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));
            
            Path file = Paths.get(document.getFilePath());
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file!");
            }
        } catch (Exception e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }

    @Override
    public DocumentDto getDocumentInfo(Long documentId) {
        return documentRepository.findById(documentId)
                .map(this::mapToDto)
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }

    private DocumentDto mapToDto(Document document) {
        return new DocumentDto(
                document.getId(),
                document.getEmployeeId(),
                document.getFileName(),
                document.getFileType(),
                "/api/documents/download/" + document.getId(),
                document.getUploadedAt()
        );
    }
}
