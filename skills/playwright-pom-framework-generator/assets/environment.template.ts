function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable ${name}`)
  }
  return value
}

export const e2eEnv = {
  baseUrl: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
  role: (role: string) => ({
    email: process.env[`E2E_${role.toUpperCase()}_EMAIL`],
    password: process.env[`E2E_${role.toUpperCase()}_PASSWORD`],
  }),
  requireRole: (role: string) => ({
    email: required(`E2E_${role.toUpperCase()}_EMAIL`),
    password: required(`E2E_${role.toUpperCase()}_PASSWORD`),
  }),
}
