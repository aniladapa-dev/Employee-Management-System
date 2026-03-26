package com.ak.ems.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private String fileName;

    private String fileType;

    private String fileUrl; 
    
    @Column(name = "file_path")
    private String filePath;

    private LocalDateTime uploadedAt = LocalDateTime.now();
}
