package com.ak.ems.controller;

import com.ak.ems.dto.TeamDto;
import com.ak.ems.response.ApiResponse;
import com.ak.ems.response.PageResponse;
import com.ak.ems.service.TeamService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private TeamService teamService;

    // Build Create Team REST API
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<TeamDto>> createTeam(@Valid @RequestBody TeamDto teamDto){
        TeamDto team = teamService.createTeam(teamDto);
        return new ResponseEntity<>(ApiResponse.success("Team created successfully", team), HttpStatus.CREATED);
    }

    // Build Get Team REST API
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER')")
    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<TeamDto>> getTeamById(@PathVariable("id") Long teamId){
        TeamDto teamDto = teamService.getTeamById(teamId);
        return ResponseEntity.ok(ApiResponse.success("Team fetched successfully", teamDto));
    }

    // Build Get All Teams REST API
    // Note: Everyone might need to see the teams list
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'EMPLOYEE')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TeamDto>>> getAllTeams(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "departmentId", required = false) Long departmentId,
            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "10", required = false) int size,
            @RequestParam(value = "sortBy", defaultValue = "id", required = false) String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "asc", required = false) String sortDir
    ){
        PageResponse<TeamDto> teams = teamService.getAllTeams(query, departmentId, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success("Teams fetched successfully", teams));
    }

    // Build Update Team REST API
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("{id}")
    public ResponseEntity<ApiResponse<TeamDto>> updateTeam(@PathVariable("id") Long teamId,
                                                           @Valid @RequestBody TeamDto updatedTeam){
        TeamDto teamDto = teamService.updateTeam(teamId, updatedTeam);
        return ResponseEntity.ok(ApiResponse.success("Team updated successfully", teamDto));
    }

    // Build Delete Team REST API
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("{id}")
    public ResponseEntity<ApiResponse<String>> deleteTeam(@PathVariable("id") Long teamId){
        teamService.deleteTeam(teamId);
        return ResponseEntity.ok(ApiResponse.success("Team deleted successfully", null));
    }
}
