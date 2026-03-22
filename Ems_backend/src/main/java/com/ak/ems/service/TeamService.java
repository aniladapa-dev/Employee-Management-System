package com.ak.ems.service;

import com.ak.ems.dto.TeamDto;
import com.ak.ems.response.PageResponse;

public interface TeamService {
    TeamDto createTeam(TeamDto teamDto);
    TeamDto getTeamById(Long teamId);
    PageResponse<TeamDto> getAllTeams(String query, Long departmentId, int page, int size, String sortBy, String sortDir);
    TeamDto updateTeam(Long teamId, TeamDto teamDto);
    void deleteTeam(Long teamId);
}
