package org.church.backend.controller;

import org.church.backend.dto.TallyResponse;
import org.church.backend.dto.TallyUpsertRequest;
import org.church.backend.service.TallyService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/odata/Tally")
@Validated
@RequiredArgsConstructor
public class TallyController {

    private final TallyService tallyService;

    @GetMapping
    public TallyResponse getTally(
            @RequestParam(name = "financialYearId") Long financialYearId,
            @RequestParam(name = "month") String month) {
        return tallyService.getByYearAndMonth(financialYearId, month);
    }

    @PutMapping
    public TallyResponse upsert(@RequestBody @Valid TallyUpsertRequest request) {
        return tallyService.upsert(request);
    }
}