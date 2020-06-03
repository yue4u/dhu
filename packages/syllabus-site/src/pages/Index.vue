<template>
  <syllabus-layout>
    <div class="home">
      <h1 class="home-title">Syllabus</h1>
      <div class="syllabus-container">
        <syllabus-button
          class="home-button"
          :link="link"
          v-for="link in links"
          :key="link.name"
        />
      </div>
    </div>
  </syllabus-layout>
</template>

<script>
export default {
  data() {
    return {
      links: [
        { name: "講義", url: "/course" },
        { name: "先生", url: "/teacher" },
        { name: "分類", url: "/category" },
        { name: "分野", url: "/field" },
      ],
    };
  },
};
</script>

<style lang="scss">
.home {
  flex: 1;
  display: flex;
  justify-content: center;
  flex-direction: column;
  &-title {
    margin-top: 0;
    font-size: 5rem;
    color: $theme-green;
    text-align: center;
  }
  &-button {
    font-size: 2rem;
    margin: 1rem;
  }
}
</style>
