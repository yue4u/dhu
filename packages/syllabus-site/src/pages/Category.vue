<template>
  <syllabus-layout>
    <h2 class="syllabus-page-title">
      All
      <span class="syllabus-page-title-count">{{ categories.length }}</span>
      Categories
    </h2>

    <input
      class="syllabus-input"
      placeholder="カテゴリ検索"
      v-model="searchText"
    />

    <transition-group name="syllabus-tags" tag="nav">
      <syllabus-button :link="link" v-for="link in categories" :key="link.id" />
    </transition-group>
  </syllabus-layout>
</template>

<script>
export default {
  metaInfo: {
    title: "Categories",
  },
  data() {
    return {
      searchText: "",
    };
  },
  computed: {
    categories() {
      let items = this.$page.allCategory.edges.map((edge) => {
        const { name, id, courses } = edge.node;
        return {
          id,
          name,
          extra: courses.totalCount,
          url: `/category/${id}`,
        };
      });

      if (this.searchText) {
        items = items.filter((item) => item.name.includes(this.searchText));
      }
      return items;
    },
  },
};
</script>

<page-query>
query {
  allCategory {
    edges {
      node {
        id
        name
        courses {
          totalCount
        }
      }
    }
  }
}
</page-query>

<style lang="scss" scoped></style>
