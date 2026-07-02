import { supabase } from '../lib/supabase'

export async function getCustomers() {
    const {data, error} = await supabase
    .from('customers')
    .select('*')
    
    if(error) throw error
    
    return data.map(c => ({
        id: c.id,
        nama: c.nama,
        noHp: c.no_hp,
        alamat: c.alamat,
        totalServis: c.total_servis,
        terakhirServis: c.terakhir_servis
    }))
}

export async function createCustomer(customer: {
    nama: string
    noHp: string
    alamat?: string
    
}) {
    const { data, error } = await supabase
    .from('customers')
    .insert({
        id: `c${Date.now()}`,
        nama: customer.nama,
        no_hp: customer.noHp,
        alamat: customer.alamat,
        total_servis: 0,
        terakhir_servis: new Date().toISOString()
    })
    .select()
    .single()
    if (error) throw error
    return data
}
export async function updateCustomerDB(
    id: string,
    updates: {
        nama: string,
        noHp: string,
        alamat?: string
    }
) {
    const { error } = await supabase
    .from('customers')
    .update({
        nama: updates.nama,
        no_hp: updates.noHp,
        alamat: updates.alamat
    })
    .eq('id', id)
    if (error) throw error
}

export async function deleteCustomerDB(id: string) {
    const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)

    if (error) throw error
}