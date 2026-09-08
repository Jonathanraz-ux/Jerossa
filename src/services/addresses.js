import { supabase } from '../lib/supabase';

export const fetchMyAddresses = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[addresses] fetchMyAddresses', error);
    return [];
  }
  return (data || []).map((row) => ({
    id: row.id,
    label: row.label,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    city: row.city,
    postalCode: row.postal_code,
    country: row.country,
    isDefault: row.is_default,
    createdAt: row.created_at,
  }));
};

export const createAddress = async ({ label, firstName, lastName, email, phone, address, city, postalCode, country }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: { message: 'Non connecté' } };
  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: user.id,
      label: label || '',
      first_name: firstName || '',
      last_name: lastName || '',
      email: email || '',
      phone: phone || '',
      address,
      city: city || '',
      postal_code: postalCode || '',
      country: country || 'MG',
      is_default: false,
    })
    .select()
    .single();
  if (error) {
    console.error('[addresses] createAddress', error);
    return { ok: false, error };
  }
  return { ok: true, data: mapAddress(data) };
};

export const updateAddress = async (id, updates) => {
  const { error } = await supabase
    .from('addresses')
    .update({
      label: updates.label,
      first_name: updates.firstName,
      last_name: updates.lastName,
      email: updates.email,
      phone: updates.phone,
      address: updates.address,
      city: updates.city,
      postal_code: updates.postalCode,
      country: updates.country,
      is_default: updates.isDefault,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) {
    console.error('[addresses] updateAddress', error);
    return { ok: false, error };
  }
  return { ok: true };
};

export const deleteAddress = async (id) => {
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('[addresses] deleteAddress', error);
    return { ok: false, error };
  }
  return { ok: true };
};

export const setDefaultAddress = async (id) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  const { data: all } = await supabase
    .from('addresses')
    .select('id')
    .eq('user_id', user.id);
  if (!all) return { ok: false };
  for (const addr of all) {
    await supabase
      .from('addresses')
      .update({ is_default: addr.id === id, updated_at: new Date().toISOString() })
      .eq('id', addr.id);
  }
  return { ok: true };
};

const mapAddress = (row) => ({
  id: row.id,
  label: row.label,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  phone: row.phone,
  address: row.address,
  city: row.city,
  postalCode: row.postal_code,
  country: row.country,
  isDefault: row.is_default,
  createdAt: row.created_at,
});
