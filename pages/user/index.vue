<template>
 <div class="page">
    <form @submit.prevent="onSubmit">
      <AppControlInput type="email" v-model="email">E-Mail Address</AppControlInput>
      <AppControlInput type="password" v-model="password">Password</AppControlInput>
      <AppButton type="submit">{{ isLogin ? 'Login' : 'Sign Up' }}</AppButton>
      <AppButton
        type="button"
        btn-style="inverted"
        style="margin-left: 10px"
        @click="isLogin = !isLogin">Switch to {{ isLogin ? 'Signup' : 'Login' }}</AppButton>
    </form>
 </div>
</template>

<script>

export default {
  data() {
    return {
      isLogin: false,
      email: "",
      password: ""
    };
  },
 methods : {
  onSubmit() {
    this.$store.dispatch("authenticateUser", {
      isLogin: this.isLogin,
      email: this.email,
      password: this.password
    })
    .then(() => {
      this.$router.push('/admin');
    });
  }
 }
}
</script>
