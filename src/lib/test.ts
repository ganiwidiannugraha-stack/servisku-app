import {supabase} from './supabase'

export async function testConnection() {
    const { data, error } = await supabase
    .from("customers")
    // .insert([
    //     {
    //     id: 'c99',
    //     nama: 'Test Customer',
    //     no_hp: "08132546",
    //     alamat: 'Jakarta',
    //     total_servis: 0,
    //     terakhir_servis: new Date().toISOString()
    // }
    // ])
    .select("*")
    console.log(data);
    console.log(error);
    console.log("koneksi supabase berhasil!")
}