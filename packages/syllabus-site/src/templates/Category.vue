<template>
  <syllabus-layout class="teacher">
    <h1 class="syllabus-page-title">{{ $page.category.name }}</h1>
    <p class="teacher-courses-count">
      講義数
      <span class="syllabus-page-title-count">{{ courses.length }}</span>
    </p>

    <syllabus-statistics
      :courses="$page.category.courses"
      :keys="['teacher']"
    />

    <syllabus-list :items="courses" />
  </syllabus-layout>
</template>

<page-query>
query Category($id: ID!) {
  category: category(id: $id) {
    name
    courses {
      node {
        id
        title
        teacher {
          id
          name
        }
      }
    }
  }
}
</page-query>

<script>
export default {
  metaInfo() {
    return {
      title: this.$page.category.name,
    };
  },
  computed: {
    courses() {
      let items = this.$page.category.courses.node.map(({ title, id }) => {
        return {
          id,
          name: title,
          url: `/course/${id}`,
        };
      });
      return items;
    },
  },
};
</script>

<style lang="scss" scoped>
.teacher {
  &-courses {
    &-count {
      color: $theme-green;
      text-align: center;
    }
  }
}
</style>
