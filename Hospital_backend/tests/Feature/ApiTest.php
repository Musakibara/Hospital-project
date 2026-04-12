<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;

class ApiTest extends TestCase
{
    /**
     * Test Login, Access Protected Route, and Logout.
     */
    public function test_auth_flow_and_data_access(): void
    {
        // 1. Test Login
        $response = $this->postJson('/api/login', [
            'email' => 'admin@hospital.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'access_token',
                     'token_type',
                     'user',
                 ]);

        $token = $response->json('access_token');

        // 2. Test Access Protected Route (Medecins List)
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/medecins');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         '*' => [
                             'id',
                             'nom_medecin',
                             'email_medecin',
                         ]
                     ]
                 ]);

        // 3. Test Get User Profile
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/user');

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'email' => 'admin@hospital.com',
                 ]);

        // 4. Test Logout
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/logout');

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Déconnexion réussie'
                 ]);
    }

    /**
     * Test Login Failure.
     */
    public function test_login_failure(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'wrong@email.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422); // Validation error or manual throw
    }
}
