// Geofence functionality has been consolidated into LocationTrackingService.
// Please import from './location-tracking.service' instead.
export { LocationTrackingService as GeofenceService } from './location-tracking.service';
export type {
    GeofenceZoneDto,
    CreateGeofenceZoneRequest,
    UpdateGeofenceZoneRequest,
    GeofenceEventDto,
    GeofenceEventHistoryDto,
    AssignWorkersToZoneRequest,
    WorkerZoneAssignmentDto,
    WorkerAssignedZoneDto,
    WorkerZoneStatusDto,
    WorkersZoneSummaryDto
} from './location-tracking.service';
export { ZoneType, GeofenceEventType } from './location-tracking.service';
