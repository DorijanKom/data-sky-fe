<template>
    <section class="d-flex loginCointainer bg-primary" style="flex: max-content; width: 100%; height: 100%;">
        <div class="container mainLayout d-flex justify-content-center align-items-center">
            <div class="row ">
                <div class="card shadow-2-strong" style="border-radius: 1rem;">
                    <div class="card-body p-5 text-center">

                        <h3 class="mb-5">Register</h3>

                        <div class="form-outline mb-4">
                            <input v-model="email" type="email" @input="validateEmail" id="typeEmailX-2"
                                class="form-control form-control-lg" :class="{ 'is-invalid': !emailValid }" />
                            <div v-if="!emailValid" class="invalid-feedback">Invalid email format.</div>
                            <label class="form-label" for="typeEmailX-2">Email</label>
                        </div>

                        <div class="form-outline mb-4">
                            <input v-model="password" @input="validatePassword" type="password" id="typePasswordX-2"
                                class="form-control form-control-lg" :class="{ 'is-invalid': !emailValid }" />
                            <div v-if="!passwordValid" class="invalid-feedback">Password must be at least 6 characters.
                            </div>
                            <label class="form-label" for="typePasswordX-2">Password</label>
                        </div>

                        <div class="form-outline mb-4">
                            <input v-model="repeatPassword" @input="checkPasswords" type="password" id="typePasswordX-2"
                                class="form-control form-control-lg" :class="{ 'is-invalid': !repeatPasswordValid }" />
                            <div v-if="!repeatPasswordValid" class="invalid-feedback">Passwords do not match.</div>
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
            emailValid: true,
            passwordValid: true,
            repeatPasswordValid: true
        };
    },

    methods: {

        validateEmail() {
            const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
            this.emailValid = emailRegex.test(this.email);
        },

        validatePassword() {
            this.passwordValid = this.password.length >= 5;
        },

        checkPasswords() {
            this.repeatPasswordValid = this.repeatPassword === this.password || this.repeatPassword === '';
        },


        async register() {
            if (this.emailValid && this.passwordValid && this.repeatPasswordValid) {
                try {
                    const response = await axios.post('api/user/register', {
                        email: this.email,
                        password: this.password,
                    })
                    if (response.status === 200) {
                        this.$router.push('/login');
                        alert("Registration successful");
                    } else {
                        alert('Invalid credentials. Please try again.');
                    }
                } catch (error) {
                    alert("User already exists!");
                    console.error('Register error:', error)
                }
            } else {
                alert("Provided information is not valid!")
            }
        },

    }
}

</script>
