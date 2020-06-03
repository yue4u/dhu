<template>
  <section class="course-section" v-if="isNotEmpty">
    <h2 class="syllabus-page-statistics-title course-margin">{{ title }}</h2>
    <div class="course-section-txt">
      <p
        v-if="typeof content === 'string'"
        class="syllabus-txt"
        v-html="eval(content)"
      ></p>
      <ul class="course-content-list" v-else-if="Array.isArray(content)">
        <li v-for="line in content" :key="line">
          <p class="syllabus-txt" v-html="eval(line)"></p>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
export default {
  props: ["title", "content"],
  computed: {
    isNotEmpty() {
      if (Array.isArray(this.content)) {
        return this.content.length;
      } else {
        return this.content;
      }
    },
  },
  methods: {
    eval(txt) {
      return this.evalEmail(this.evalURL(txt.trim()));
    },
    evalEmail(txt) {
      return txt.replace(
        /**
         * @see https://stackoverflow.com/a/1373724
         */
        /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi,
        '<a class="syllabus-txt-link" href="mailto:$1">$1</a>'
      );
    },
    evalURL(txt) {
      return txt.replace(
        /**
         * @see https://stackoverflow.com/a/17773849
         */
        /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g,
        `<a class="syllabus-txt-link" target="_blank" href="$1" ref="noreferrer noopener">$1</a>`
      );
    },
  },
};
</script>

<style lang="scss">
.course {
  &-margin:not(:first-child) {
    margin-top: 4rem;
  }
  &-content {
    &-list {
      list-style: cjk-ideographic;
      padding-left: 2rem;
      li {
        margin-bottom: 1rem;
      }
    }
  }
  &-section {
    &-txt {
      color: #555;
      border-radius: 5px;
      padding: 1rem;
      background-color: #f2f6f5;
      font-size: 1.2rem;
    }
    .syllabus-txt-link {
      color: deeppink;
    }
  }
}

@media screen and (max-width: 640px) {
  .course {
    &-txt {
      font-size: 1rem;
    }
  }
}
</style>
