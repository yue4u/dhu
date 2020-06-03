<template>
  <syllabus-layout>
    <h2 class="syllabus-page-title">
      All
      <span class="syllabus-page-title-count">{{ fields.length }}</span> Fields
    </h2>

    <input class="syllabus-input" placeholder="分野名検索" v-model="searchText" />

    <transition-group name="syllabus-tags" tag="nav">
      <syllabus-button :link="link" v-for="link in fields" :key="link.id" />
    </transition-group>
  </syllabus-layout>
</template>

<script>
export default {
  metaInfo: {
    title: "Fields"
  },
  data() {
    return {
      searchText: ""
    };
  },
  computed: {
    fields() {
      let items = this.$page.allField.edges.map(edge => {
        const { name, id, courses } = edge.node;
        return {
          id,
          name: name,
          extra: courses.totalCount,
          url: `/field/${id}`
        };
      });

      if (this.searchText) {
        items = items.filter(item => item.name.includes(this.searchText));
      }
      return items;
    }
  }
};
</script>

<page-query>
query {
  allField {
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
