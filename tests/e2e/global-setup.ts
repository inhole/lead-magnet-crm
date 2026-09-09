import { seedLocalDatabase } from "../helpers/local-supabase"
export default async function globalSetup() { await seedLocalDatabase() }
