-- Initialize database for Smart Attendance System
-- This script creates basic database structure and initial data

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS smart_attendance;

-- Use the database
\c smart_attendance;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Initial data will be created by Hibernate on application startup
-- This file is mainly for database initialization
