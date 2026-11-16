-- Migration: Standardize user roles to strictly 'customer', 'manager', and 'admin'
-- 1. Update any existing 'staff' roles to 'manager'
update public.profiles
set role = 'manager'
where role = 'staff';

-- 2. Drop legacy profiles_role_check constraint if it exists
alter table public.profiles
drop constraint if exists profiles_role_check;

-- 3. Add clean constraint strictly enforcing customer, manager, admin
alter table public.profiles
add constraint profiles_role_check check (role in ('customer', 'manager', 'admin'));
