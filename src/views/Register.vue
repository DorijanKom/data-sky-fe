<template>
    <section class="d-flex loginCointainer bg-primary" style="flex: max-content; width: 100%; height: 100%;">
        <div class="container mainLayout d-flex justify-content-center align-items-center">
            <div class="row ">
                <div class="card shadow-2-strong" style="border-radius: 1rem;">
                    <div class="card-body p-5 text-center">

                        <h3 class="mb-5">Register</h3>

                        <div class="form-outline mb-4">
                            <input v-model="email" type="email" id="typeEmailX-2" class="form-control form-control-lg" />
                            <label class="form-label" for="typeEmailX-2">Email</label>
                        </div>

                        <div class="form-outline mb-4">
                            <input v-model="password" type="password" id="typePasswordX-2"
                                class="form-control form-control-lg" />
                            <label class="form-label" for="typePasswordX-2">Password</label>
                        </div>

                        <div class="form-outline mb-4">
                            <input v-model="repeatPassword" type="password" id="typePasswordX-2"
                                class="form-control form-control-lg" />
                            <label class="form-label" for="typePasswordX-2">Repeat your password</label>
                        </div>

                        <button class="btn btn-primary btn-lg btn-block" @click="register" type="button">Done</button>

                    </div>
                    <div class="card-footer">
                        <div class="text-center">
                        <p>Already have an account? <router-link to="/login">Login</router-link></p>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import axios from 'axios';


export default {
    data() {
        return {
            email: '',
            password: '',
            repeatPassword: '',
        };
    },

    methods: {
        async register() {
            if (this.password === this.repeatPassword) {
                try {
                    const response = await axios.post('api/user/register', {
                        email: this.email,
                        password: this.password,
                    })
                    if (response.status === 200) {
                        alert("Registration successful");
                        this.$router.push('/login');
                    } else {
                        alert('Invalid credentials. Please try again.');
                    }
                } catch (error) {
                    alert("User already exists!");
                    console.error('Register error:', error)
                }
            } else {
                alert("Passwords do not match")
            }
        }
    }
}

</script>
