<template>
  <span
    :class="[
      'syllabus-button',
      {'syllabus-button-not-allowed': link.url === '#'}
    ]"
  >
    <g-link
      :class="[
        'syllabus-button-link',
        { 'syllabus-button-link--padding': link.extra },
      ]"
      :to="link.url === '#' ? null: link.url"
    >
      {{ link.name }}
      <span class="syllabus-button-extra">{{ link.extra }}</span>
    </g-link>
  </span>
</template>

<script>
export default {
  props: ["link"]
};
</script>

<style lang="scss">
.syllabus-button {
  transition: 0.3s all ease-in-out;
  font-size: 1rem;
  margin: 5px;
  border-radius: 5px;
  display: inline-block;
  background-color: $theme-pale-green;
  border-bottom: 2px solid $theme-light-green;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  &:hover {
    background-color: $theme-light-green;
  }
  &-link {
    color: $theme-grey;
    padding: 5px 1rem;
    &--padding {
      padding-right: 2.5rem;
    }
  }
  &-extra {
    background-color: slategrey;
    color: #fff;
    position: absolute;
    right: 0;
    top: 0;
    width: 2rem;
    text-align: center;
    z-index: 5;
  }
  &-not-allowed {
    background-color: transparent;
    cursor: unset;
    a {
      cursor: unset;
    }
    &:hover {
      background-color: transparent;
    }
  }
}
</style>
