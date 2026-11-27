package com.example.backend.dtos.blockedslot;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBlockedSlotRequest {

    private String courtId;

    private String startAt;

    private String endAt;

    private String reason;
}
