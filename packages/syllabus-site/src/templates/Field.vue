<template>
  <syllabus-layout class="teacher">
    <h1 class="syllabus-page-title">{{ $page.field.name }}</h1>
    <p class="teacher-courses-count">
      講義数
      <span class="syllabus-page-title-count">{{ courses.length }}</span>
    </p>
    <syllabus-statistics :courses="$page.field.courses" :keys="['teacher']" />

    <syllabus-list :items="courses" />
  </syllabus-layout>
</template>

<page-query>
query Field($id: ID!) {
  field: field(id: $id) {
    name
    courses {
      totalCount
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
      title: this.$page.field.name,
    };
  },
  computed: {
    courses() {
      let items = this.$page.field.courses.node.map(({ title, id }) => {
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
