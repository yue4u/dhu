<template>
  <div class="layout">
    <div class="top">
      <syllabus-header />
      <transition name="fade" mode="out-in" appear>
        <main class="main">
          <slot />
        </main>
      </transition>
    </div>
    <syllabus-footer />
  </div>
</template>

<static-query>
query {
  metadata {
    siteName
  }
}
</static-query>

<script>
import SyllabusFooter from "../components/SyllabusFooter";
import SyllabusHeader from "../components/SyllabusHeader";

export default {
  components: {
    SyllabusHeader,
    SyllabusFooter
  }
};
</script>


<style lang="scss">
* {
  box-sizing: border-box;
}
html {
  height: 100%;
}
body {
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  margin: 0;
  padding: 0;
  line-height: 1.5;
  height: 100%;
}
ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
a {
  text-decoration: none;
  color: inherit;
}
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
.top {
  margin: 0 auto;
  width: 100%;
  padding-left: 20px;
  padding-right: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.fade-enter-active {
  transition: all 0.5s;
}
.fade-enter {
  opacity: 0;
  transform: translateY(-3px);
}
</style>
