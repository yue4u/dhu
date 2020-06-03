<template>
  <syllabus-layout>
    <h1 class="syllabus-page-title">
      All
      <span class="syllabus-page-title-count">{{ resultList.length }}</span>Results
    </h1>

    <input class="syllabus-input" placeholder="検索" v-model="searchText" />

    <ul class="syllabus-list">
      <li class="syllabus-list-item search-item" v-for="result in resultList" :key="result.url">
        <g-link class="search-link" :to="result.url">
          <span class="search-title">{{result.title}}</span>
          <span class="search-content" v-html="result.text"></span>
        </g-link>
      </li>
    </ul>
  </syllabus-layout>
</template>

<script>
const { data } = require("../../data/search.json");

export default {
  data() {
    return {
      searchText: ""
    };
  },
  computed: {
    resultList() {
      if (!this.searchText) {
        return [];
      }

      const searchText = this.searchText.toLowerCase();
      let result = data
        .filter(item => {
          item.index = item.text.toLowerCase().indexOf(searchText);

          return item.index !== -1;
        })
        .map(item => {
          const text = item.text
            .substring(
              item.index - 10,
              item.index + this.searchText.length + 15
            )
            .replace(
              new RegExp(`(${searchText})`, "i"),
              `<span class="syllabus-search-highlight">$1</span>`
            );
          return {
            text: `...${text}...`,
            title: item.title,
            url: `/${item.type}/${item.id}`
          };
        });

      return result;
    }
  },
  mounted() {
    const { q } = this.$route.query;
    this.searchText = q ? q : "";
  }
};
</script>

<style lang="scss" scoped>
.search {
  &-link {
    padding: 1rem;
    display: flex;
    align-items: center;
  }
  &-title {
    width: 30%;
    color: slategrey;
    font-weight: bold;
    display: inline-block;
  }
  &-content {
    width: 70%;
    display: inline-block;
    color: $theme-green;
  }
}

@media screen and (max-width: 640px) {
  .search {
    &-link {
      flex-wrap: wrap;
    }
  }
  .search {
    &-title {
      width: 100%;
      margin-bottom: 1rem;
    }
    &-content {
      width: 100%;
    }
  }
}
</style>