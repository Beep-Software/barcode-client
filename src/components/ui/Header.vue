<template>
    <div class="container">
        <router-link to="/">DASHBOARD</router-link>
        <router-link to="/scanner">SCANNER</router-link>
        <router-link to="/inventory">INVENTORY</router-link>
    </div>
</template>

<script lang="ts">

</script>

<style scoped>
.container {
    display: flex;
    gap: 20px;
    padding: 10px;
    background-color: #f0f0f0;
    border-bottom: 2px solid #ccc;
}

a {
    text-decoration: none;
    color: #333;
    font-weight: bold;
}

a.router-link-active {
    color: #57bc8f;
}

a:hover {
    color: #349067;
}
</style>
