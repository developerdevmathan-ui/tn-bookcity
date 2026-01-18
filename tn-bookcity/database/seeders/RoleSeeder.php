<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Create a Default Admin User
        User::firstOrCreate(
            ['email' => 'admin@tnbookcity.in'],
            [
                'name' => 'Super Admin',
                'email' => 'admin@tnbookcity.in',
                'password' => bcrypt('admin@123'),
                'is_admin' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create a test customer user
        User::firstOrCreate(
            ['email' => 'customer@tnbookcity.in'],
            [
                'name' => 'Test Customer',
                'email' => 'customer@tnbookcity.in',
                'password' => bcrypt('customer@123'),
                'is_admin' => false,
                'email_verified_at' => now(),
            ]
        );
    }
}
