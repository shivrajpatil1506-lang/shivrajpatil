-- ==============================================================================
-- 30-Day Auto-Delete Script for Completed Tasks
-- 
-- Run this in your Supabase SQL Editor to enable automatic cleanup
-- of tasks that have been in the "done" status for more than 30 days.
-- ==============================================================================

-- 1. Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Create the cleanup function
-- This function deletes tasks where status is 'done' and completed_at is older than 30 days.
-- Because we set up ON DELETE CASCADE on the Prisma schema, this will automatically 
-- delete the related TaskChecklist, TaskComment, and TaskActivity records.
CREATE OR REPLACE FUNCTION delete_old_completed_tasks()
RETURNS void AS $$
BEGIN
  DELETE FROM "Task"
  WHERE status = 'done' 
    AND completed_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 3. Schedule the cron job to run every night at 2:00 AM
-- Note: 'cleanup-old-tasks' is the job name
SELECT cron.schedule(
  'cleanup-old-tasks', 
  '0 2 * * *', 
  $$SELECT delete_old_completed_tasks();$$
);

-- ==============================================================================
-- Useful commands to manage this cron job later:
-- 
-- View active cron jobs:
-- SELECT * FROM cron.job;
--
-- Unschedule the job:
-- SELECT cron.unschedule('cleanup-old-tasks');
-- ==============================================================================
