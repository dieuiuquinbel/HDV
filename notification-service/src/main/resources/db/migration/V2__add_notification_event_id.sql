ALTER TABLE notifications
    ADD COLUMN event_id VARCHAR(255) NULL;

CREATE UNIQUE INDEX uk_notifications_event_id ON notifications (event_id);
