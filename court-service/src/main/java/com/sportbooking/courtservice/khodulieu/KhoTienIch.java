package com.sportbooking.courtservice.khodulieu;

import com.sportbooking.courtservice.thucthe.TienIch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KhoTienIch extends JpaRepository<TienIch, Long> {
    @Query(value = "SELECT a.* FROM amenities a JOIN venue_amenities va ON va.amenity_id = a.id WHERE va.venue_id = :venueId", nativeQuery = true)
    List<TienIch> findByVenueId(@Param("venueId") Long venueId);
}
