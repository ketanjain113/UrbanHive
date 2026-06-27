/**
 * FastAPI Backend Configuration
 * Centralizes all FastAPI connection settings and axios instance creation.
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

export const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000';

/**
 * Axios instance configured for FastAPI communication.
 * Includes timeout and error handling.
 */
export const fastAPIClient = axios.create({
  baseURL: FASTAPI_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
