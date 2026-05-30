package org.church.backend.common.odata;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@AllArgsConstructor
public class ODataCollectionResponse<T> {

    private final List<T> value;

    @JsonProperty("@odata.count")
    private final Long count;
}

