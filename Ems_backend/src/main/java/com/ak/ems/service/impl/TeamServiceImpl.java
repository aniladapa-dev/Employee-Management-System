package com.ak.ems.service.impl;

import com.ak.ems.dto.TeamDto;
import com.ak.ems.entity.Department;
import com.ak.ems.entity.Employee;
import com.ak.ems.entity.Team;
import com.ak.ems.exception.ResourceNotFoundException;
import com.ak.ems.repository.DepartmentRepository;
import com.ak.ems.repository.EmployeeRepository;
import com.ak.ems.repository.TeamRepository;
import com.ak.ems.response.PageResponse;
import com.ak.ems.service.TeamService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import java.util.stream.Collectors;
import com.ak.ems.entity.Role;
import com.ak.ems.repository.RoleRepository;
import com.ak.ems.repository.UserRepository;

@Service
@AllArgsConstructor
@Transactional
public class TeamServiceImpl implements TeamService {

    private TeamRepository teamRepository;
    private DepartmentRepository departmentRepository;
    private EmployeeRepository employeeRepository;
    private RoleRepository roleRepository;
    private UserRepository userRepository;

    @Override
    public TeamDto createTeam(TeamDto teamDto) {
        if (teamRepository.existsByName(teamDto.getName())) {
            throw new IllegalArgumentException("Team Name already exists");
        }

        Team team = new Team();
        team.setId(null); // Ensure ID is auto-generated
        team.setName(teamDto.getName());
        team.setDescription(teamDto.getDescription());

        if (teamDto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(teamDto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + teamDto.getDepartmentId()));
            team.setDepartment(department);
        }

        if (teamDto.getTeamLeaderId() != null) {
            Employee teamLeader = employeeRepository.findById(teamDto.getTeamLeaderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team Leader employee not found with id: " + teamDto.getTeamLeaderId()));
            team.setTeamLeader(teamLeader);

            if (teamLeader.getUser() != null) {
                Role tlRole = roleRepository.findByName("ROLE_TEAM_LEADER")
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found: ROLE_TEAM_LEADER"));
                teamLeader.getUser().getRoles().add(tlRole);
                userRepository.save(teamLeader.getUser());
            }
        }

        Team savedTeam = teamRepository.save(team);
        return mapToDto(savedTeam);
    }

    @Override
    public TeamDto getTeamById(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));
        return mapToDto(team);
    }

    @Override
    public PageResponse<TeamDto> getAllTeams(String query, Long departmentId, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // If query is empty string, convert to null
        if (query != null && query.trim().isEmpty()) query = null;

        Page<Team> teams = teamRepository.searchTeamsWithFilters(query, departmentId, pageable);

        List<TeamDto> content = teams.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        PageResponse<TeamDto> pageResponse = new PageResponse<>();
        pageResponse.setContent(content);
        pageResponse.setPageNo(teams.getNumber());
        pageResponse.setPageSize(teams.getSize());
        pageResponse.setTotalElements(teams.getTotalElements());
        pageResponse.setTotalPages(teams.getTotalPages());
        pageResponse.setLast(teams.isLast());

        return pageResponse;
    }

    @Override
    public TeamDto updateTeam(Long teamId, TeamDto teamDto) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));

        team.setName(teamDto.getName());
        team.setDescription(teamDto.getDescription());

        if (teamDto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(teamDto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + teamDto.getDepartmentId()));
            team.setDepartment(department);
        } else {
            team.setDepartment(null);
        }

        if (teamDto.getTeamLeaderId() != null) {
            Employee teamLeader = employeeRepository.findById(teamDto.getTeamLeaderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team Leader employee not found with id: " + teamDto.getTeamLeaderId()));
            team.setTeamLeader(teamLeader);

            if (teamLeader.getUser() != null) {
                Role tlRole = roleRepository.findByName("ROLE_TEAM_LEADER")
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found: ROLE_TEAM_LEADER"));
                teamLeader.getUser().getRoles().add(tlRole);
                userRepository.save(teamLeader.getUser());
            }
        } else {
            team.setTeamLeader(null);
        }

        Team updatedTeam = teamRepository.save(team);
        return mapToDto(updatedTeam);
    }

    @Override
    public void deleteTeam(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + teamId));
        teamRepository.delete(team);
    }

    private TeamDto mapToDto(Team team) {
        TeamDto dto = new TeamDto();
        dto.setId(team.getId());
        dto.setName(team.getName());
        dto.setDescription(team.getDescription());
        if (team.getDepartment() != null) {
            dto.setDepartmentId(team.getDepartment().getId());
            dto.setDepartmentName(team.getDepartment().getName());
        }
        if (team.getTeamLeader() != null) {
            dto.setTeamLeaderId(team.getTeamLeader().getId());
            String leaderName = team.getTeamLeader().getFirstName() + " " + (team.getTeamLeader().getLastName() != null ? team.getTeamLeader().getLastName() : "");
            dto.setTeamLeaderName(leaderName.trim());
        }
        return dto;
    }
}
