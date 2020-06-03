<template>
  <syllabus-layout class="teacher">
    <h1 class="syllabus-page-title">
      <a
        class="teacher-search"
        :href="`https://www.google.com/search?q=${$page.teacher.name}`"
        rel="noopener"
        target="_blank"
        >{{ $page.teacher.name }}</a
      >
      <!-- <span class="syllabus-page-title-sub">{{$page.teacher.position}}</span> -->
    </h1>

    <p class="teacher-courses-count">
      講義数
      <span class="syllabus-page-title-count">{{ courses.length }}</span>
    </p>

    <syllabus-statistics
      :courses="$page.teacher.courses"
      :keys="['field', 'category']"
    />

    <syllabus-list :items="courses" />
  </syllabus-layout>
</template>

<page-query>
query Teacher($id: ID!) {
  teacher: teacher(id: $id) {
    name
    courses {
      node {
        id
        title
        field {
          id
          name
        }
        category {
          name
          id
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
      title: this.$page.teacher.name,
    };
  },
  computed: {
    courses() {
      let courses = this.$page.teacher.courses.node.map(({ title, id }) => {
        return {
          id,
          name: title,
          url: `/course/${id}`,
        };
      });
      return courses;
    },
  },
};
</script>

<style lang="scss" scoped>
.teacher {
  &-search {
    cursor: help;
  }
  &-courses {
    &-count {
      color: $theme-green;
      text-align: center;
    }
  }
}
</style>
