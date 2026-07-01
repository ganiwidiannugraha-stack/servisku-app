import { seedBackendDataIfEmpty } from '../services/backendServices'

export async function seedCostumers() {
    await seedBackendDataIfEmpty()
}