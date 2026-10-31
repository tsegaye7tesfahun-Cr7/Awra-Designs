import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

interface EnvVarSpec {
  name: string
  required: boolean
  description: string
}

const requiredEnvVars: EnvVarSpec[] = [
  { name: 'DATABASE_URL', required: true, description: 'PostgreSQL database connection string' },
  { name: 'JWT_SECRET', required: true, description: 'Secret key for JWT token signing' },
  { name: 'RESEND_API_KEY', required: true, description: 'Resend API key for email sending' },
  { name: 'CLOUDINARY_CLOUD_NAME', required: true, description: 'Cloudinary cloud name' },
  { name: 'CLOUDINARY_API_KEY', required: true, description: 'Cloudinary API key' },
  { name: 'CLOUDINARY_API_SECRET', required: true, description: 'Cloudinary API secret' },
  { name: 'NODE_ENV', required: false, description: 'Environment (development/production)' },
  { name: 'FRONTEND_URL', required: false, description: 'Frontend application URL' },
  { name: 'ADMIN_URL', required: false, description: 'Admin application URL' },
]

export function validateEnvVars(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const spec of requiredEnvVars) {
    const value = process.env[spec.name]

    if (spec.required && !value) {
      errors.push(`Missing required environment variable: ${spec.name} (${spec.description})`)
    }

    // Validate specific variables
    if (spec.name === 'DATABASE_URL' && value && !value.startsWith('postgresql://')) {
      errors.push(`DATABASE_URL must start with 'postgresql://'`)
    }

    if (spec.name === 'JWT_SECRET' && value && value.length < 32) {
      errors.push(`JWT_SECRET must be at least 32 characters for security`)
    }

    if (spec.name === 'NODE_ENV' && value && !['development', 'production', 'test'].includes(value)) {
      errors.push(`NODE_ENV must be 'development', 'production', or 'test'`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Validate on import
const validation = validateEnvVars()

if (!validation.valid) {
  console.error('❌ Environment Variable Validation Failed:')
  validation.errors.forEach(error => console.error(`  - ${error}`))
  console.error('\nPlease set the required environment variables and restart the server.')
  
  if (process.env.NODE_ENV === 'production') {
    process.exit(1)
  } else {
    console.warn('\n⚠️  Continuing in development mode with missing environment variables...')
  }
} else {
  console.log('✅ Environment variables validated successfully')
}
