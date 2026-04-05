declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_PORT: number
      POSTGRES_USER: string
      POSTGRES_PASSWORD: string
      POSTGRES_DB: string
      DATABASE_URL: string
    }
  }
}

export {}
