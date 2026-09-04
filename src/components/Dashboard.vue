<template>
  <div class="title">
    <h3>Caldwell Inventory Management System</h3>
  </div>

  <div class="dashboard_container">

    <div class="news">
      <h4>System News</h4>
      <p>No updates available at the moment.</p>
    </div>

    <div class="stats">
      <h4>System Statistics</h4>
      <ul>
        <li>Total Items: {{ 0 }}</li>
        <li>Items Scanned Today: {{ 0 }}</li>
        <li>Issues: {{ 0 }}</li>
        <li>Productivity: {{ 100 }}%</li>
      </ul>
    </div>

    <div class="tasks">
      <h4>Pending Tasks</h4>
      <ul>
        <li>No pending tasks.</li>
      </ul>
    </div>

    <div class="error">
      <h4>Report Errors</h4>
      <form>
        <label for="error_desc">Describe the issue:</label>
        <textarea id="error_desc" rows="4" cols="50"></textarea>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>

  </div>
</template>

<script>
</script>

<style scoped>
ul {
  list-style-type: none;
  padding-left: 20px;
}

li {
  margin-bottom: 2px;
}

.dashboard_container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.news, .stats, .tasks, .error {
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

button {
  width: 100px;
  padding: 5px;
  background-color: #57bc8f;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

button:hover {
  background-color: #349067;
}
</style>