<template>
  <syllabus-layout>
    <h2 class="syllabus-page-title">
      All
      <span class="syllabus-page-title-count">{{ courses.length }}</span>
      Courses
    </h2>

    <input
      class="syllabus-input"
      placeholder="講義名検索"
      v-model="searchText"
    />

    <transition-group name="syllabus-tags" tag="nav">
      <syllabus-button :link="link" v-for="link in courses" :key="link.id" />
    </transition-group>
  </syllabus-layout>
</template>

<script>
export default {
  metaInfo: {
    title: "Subjects",
  },
  data() {
    return {
      searchText: "",
    };
  },
  computed: {
    courses() {
      let courses = this.$page.allCourse.edges.map((edge) => {
        const { title, id } = edge.node;
        return {
          id,
          name: title,
          url: `/course/${id}`,
        };
      });

      if (this.searchText) {
        courses = courses.filter((subject) =>
          subject.name.includes(this.searchText)
        );
      }
      return courses.reverse();
    },
  },
};
</script>

<page-query>
query {
  allCourse {
    edges {
      node {
        id
        title
      }
    }
  }
}
</page-query>

<style lang="scss" scoped></style>
