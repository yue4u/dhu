<template>
  <syllabus-layout class="teacher">
    <h1 class="syllabus-page-title">
      All
      <span class="syllabus-page-title-count">{{ teachers.length }}</span
      >Teachers
    </h1>

    <input class="syllabus-input" placeholder="名前検索" v-model="searchText" />

    <!-- <h2 class="syllabus-page-statistics-title">Positions</h2> -->

    <!-- <transition-group name="syllabus-tags" tag="nav">
      <syllabus-button
        v-for="position in positions"
        :class="[
          'position',
          (searchPosition && (position.name !== searchPosition)) 
          ? 'position-inactive'
          : 'position-active'
        ]"
        :link="position"
        :key="position.name"
        @click.native="() => setPosition(position.name)"
      />
    </transition-group> -->

    <h2 class="syllabus-page-statistics-title course-margin">Teachers</h2>
    <transition-group name="syllabus-tags" tag="nav">
      <syllabus-button :link="link" v-for="link in teachers" :key="link.name" />
    </transition-group>
  </syllabus-layout>
</template>

<script>
export default {
  metaInfo: {
    title: "Teachers",
  },
  data() {
    return {
      searchText: "",
      searchPosition: "",
    };
  },
  computed: {
    teachers() {
      let teachers = this.$page.allTeacher.edges.map((edge) => {
        const { name, id, courses, position } = edge.node;
        return {
          extra: courses.totalCount,
          name,
          //  position: position.trim() || "不明",
          url: `/teacher/${id}`,
        };
      });

      teachers = teachers.filter((teacher) => {
        if (this.searchText && !teacher.name.includes(this.searchText)) {
          return false;
        }
        // if (this.searchPosition && teacher.position !== this.searchPosition) {
        //   return false;
        // }
        return true;
      });

      return teachers;
    },
    // positions() {
    //   let count = {};
    //   let positions = this.$page.allTeacher.edges.map((edge) => {
    //     const position = edge.node.position.trim() || "不明";

    //     if (position) {
    //       count[position] = (count[position] || 0) + 1;
    //     }
    //   });
    //   return Object.entries(count).map(([k, v]) => ({
    //     name: k,
    //     extra: v,
    //     url: "#",
    //   }));
    // },
  },
  methods: {
    setPosition(p) {
      this.searchPosition = this.searchPosition === p ? "" : p;
    },
  },
};
</script>

<page-query>
query {
  allTeacher {
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

<style lang="scss" scoped>
.position {
  background-color: #f2f6f5;
  cursor: pointer;
  /* &-active {
  } */
  &-inactive {
    opacity: 0.5;
  }
}
</style>
