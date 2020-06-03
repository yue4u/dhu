<template>
  <header class="header">
    <nav>
      <g-link class="header-link" to="/">Syllabus</g-link>
      <g-link class="header-link" to="/course">Course</g-link>
      <g-link class="header-link" to="/teacher">Teacher</g-link>
      <g-link class="header-link" to="/category">Category</g-link>
      <g-link class="header-link" to="/field">Field</g-link>
      <g-link class="header-link" to="/email">Email</g-link>
    </nav>
    <syllabus-search />
  </header>
</template>

<script>
import SyllabusSearch from "./SyllabusSearch";
export default {
  components: {
    SyllabusSearch
  }
};
</script>

<style lang="scss" scoped>
.header {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  &-link {
    color: $theme-green;
    font-size: 1.2rem;
    &:not(:last-child):after {
      content: " / ";
      color: $theme-light-green;
    }
  }
}
</style>
