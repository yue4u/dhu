<template>
  <div>
    <div
      class="syllabus-page-statistics-wrapper"
      v-for="(field, index) of Object.keys(info)"
      :key="`${field}-${index}`"
    >
      <h2 class="syllabus-page-statistics-title">{{ field }}</h2>
      <syllabus-button
        :link="link"
        v-for="link in info[field]"
        :key="link.id"
      />
    </div>
  </div>
</template>

<script>
import { collectSubjectInfo } from "../helpers";
export default {
  props: ["courses", "keys"],
  computed: {
    info() {
      return collectSubjectInfo(this.courses, this.keys);
    },
  },
};
</script>
