<template>
  <syllabus-layout class="course">
    <h1 class="syllabus-page-title">{{ $page.course.title }}</h1>
    <p class="course-teacher">
      <g-link :to="`/teacher/${$page.course.teacher.id}`">
        {{ $page.course.teacher.name }}
      </g-link>
    </p>

    <div class="syllabus-page-statistics-wrapper">
      <h2 class="syllabus-page-statistics-title course-margin">Tags</h2>

      <syllabus-button :link="link" v-for="(link, id) in tags" :key="id" />

      <syllabus-section title="Purpose" :content="$page.course.purpose" />
      <syllabus-section title="Target" :content="$page.course.target" />
      <!-- <syllabus-section
        title="Teaching Style"
        :content="$page.course.teachingStyle"
      /> -->
      <syllabus-section
        title="Grade Policy"
        :content="$page.course.gradePolicy"
      />
      <syllabus-section title="Final Test" :content="$page.course.finalTest" />
      <syllabus-section title="Message" :content="$page.course.message" />
      <syllabus-section title="Keywords" :content="$page.course.keywords" />
      <syllabus-section title="Contents" :content="$page.course.contents" />
    </div>
  </syllabus-layout>
</template>

<page-query>
query Course($id: ID!) {
  course: course(id: $id) {
    title
    time
    purpose
    target
    message
    contents
    finalTest
    gradePolicy
    category {
      id
      name
    }
    field {
      name
      id
    }
    year {
      name
    }
    teacher {
      id
      name
    }
  }
}
</page-query>

<script>
export default {
  metaInfo() {
    return {
      title: this.$page.course.title,
    };
  },
  computed: {
    tags() {
      const course = this.$page.course;
      return [
        {
          name: course.time,
          url: `#`,
        },
        {
          name: course.location,
          url: `#`,
        },
        {
          name: course.type,
          url: `#`,
        },
        {
          name: course.category.name,
          url: `/category/${course.category.id}`,
        },
        {
          name: course.field.name,
          url: `/field/${course.field.id}`,
        },
        {
          name:
            course.year.name === "不明" ? "年: 不明" : course.year.name + "年",
          url: `#`,
        },
        {
          name: course.compulsory,
          url: `#`,
        },
      ].filter((tag) => tag.name && tag.name !== "不明");
    },
  },
};
</script>

<style lang="scss" scoped>
.course {
  &-title {
    &-sub {
      text-align: center;
      color: $theme-green;
      font-size: 1.4rem;
    }
  }

  &-teacher {
    font-size: 1.6rem;
    color: $theme-grey;
    text-align: center;
  }
}
@media screen and (max-width: 640px) {
  .course {
    &-txt {
      padding-left: 0;
      font-size: 1.1rem;
    }
  }
}
</style>
