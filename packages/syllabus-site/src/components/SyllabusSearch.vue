<template>
  <div class="syllabus-search">
    <input
      @focus="open"
      @input="fetchResultList"
      class="syllabus-search-input"
      type="text"
      v-model="searchText"
      placeholder="search..."
    />
    <ul v-if="isOpen && resultList.length" class="syllabus-search-result">
      <li v-for="(result,id) in resultList" :key="id" @click="close">
        <router-link :to="result.url">
          <p class="syllabus-search-result-item">
            <span class="syllabus-search-result-title">{{result.title}}</span>
            <span class="syllabus-search-result-content" v-html="result.text"></span>
          </p>
        </router-link>
      </li>
      <li class="syllabus-search-more" v-if="more">
        <g-link class="syllabus-search-more-link" :to="`/search?q=${searchText}`">~ more ~</g-link>
      </li>
    </ul>
  </div>
</template>

<script>
//const { data } = require("../../../data/search.json");

export default {
  data() {
    return {
      searchText: "",
      isOpen: false,
      more: false,
      resultList: []
    };
  },
  methods: {
    open() {
      this.isOpen = true;
    },
    close() {
      this.isOpen = false;
    },
    async fetchResultList() {
      if (!this.searchText) {
        return;
      }

      const searchText = this.searchText.toLowerCase();
      let response = await fetch(`/.netlify/functions/search?q=${searchText}`);
      if (!response) {
        return;
      }

      let { more, data } = await response.json();

      this.more = more;

      const result = data.map(item => {
        const text = item.text.replace(
          new RegExp(`(${searchText})`, "i"),
          `<span class="syllabus-search-highlight">$1</span>`
        );
        return {
          ...item,
          text
        };
      });
      this.resultList = result;
    }
  }
};
</script>


<style lang="scss">
.syllabus-search {
  width: 50%;
  text-align: right;
  position: relative;
  &-input {
    font-size: 1.2rem;
    width: 30%;
    transition: 0.3s all ease-in-out;
    border: 0;
    border-bottom: 1px solid #c8dad3;
    &:focus {
      width: 100%;
      outline: none;
      border-bottom: 1px solid slategrey;
    }
  }
  &-highlight {
    background-color: yellow;
    color: #000;
  }
  &-result {
    background-color: #fff;
    width: 100%;
    padding: 10px;
    z-index: 100;
    position: absolute;
    top: 100%;
    left: 0;
    box-shadow: 0 0 5px #aaa;
    border-radius: 5px;
    text-align: left;
    &-item {
      transition: 0.3s all ease-in-out;
      border-collapse: collapse;
      //display: flex;
      margin: 0;
      padding: 0 5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      &:hover {
        background-color: #f2f6f5;
      }
    }
    &-title {
      width: 6rem;
      overflow: hidden;
      display: inline-block;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 5px;
      padding-right: 5px;
      border-right: 1px solid slategrey;
    }
    &-content {
      vertical-align: super;
      // display: inline-block;
    }
  }
  &-more {
    transition: 0.3s all ease-in-out;
    text-align: center;
    background-color: $theme-pale-green;
    &:hover {
      background-color: $theme-light-green;
    }
    &-link {
      display: block;
    }
  }
}
@media screen and (max-width: 640px) {
  .syllabus-search {
    &-result {
      position: fixed;
      left: 0;
      top: 3rem;
    }
  }
}
</style>
