<template>
  <syllabus-layout>
    <h2 class="syllabus-page-title">
      All
      <span class="syllabus-page-title-count">{{
        $page.allEmail.totalCount
      }}</span>
      Records
    </h2>
    <input placeholder="名前検索" class="syllabus-input" v-model="searchText" />
    <div class="email-simplify-wrapper">
      <label class="email-simplify-label" for="simplify">simplify</label>
      <input type="checkbox" name="simplify" v-model="simplify" />
    </div>
    <ul class="syllabus-list">
      <li class="syllabus-list-item" v-for="email in emails" :key="email.id">
        <g-link
          class="syllabus-button-link email-teacher"
          :to="`/teacher/${email.teacher.id}`"
        >
          {{ email.teacher.name }}
        </g-link>
        <div class="email-wrapper">
          <span
            class="email-item"
            v-for="(address, id) in email.addresses"
            :key="id"
          >
            <a :href="`mailto:${address.link}`" class="email-address">{{
              address.link
            }}</a>
            <span v-if="!simplify" class="email-course">
              <g-link :to="`/course/${address.course.id}`"
                >({{ address.course.title }})</g-link
              >
            </span>
          </span>
        </div>
      </li>
    </ul>
  </syllabus-layout>
</template>

<page-query>
query {
  allEmail {
    totalCount
    edges {
      node {
        teacher {
          id
          name
        }
        addresses {
          link
          course {
            id
            title
          }
        }
      }
    }
  }
}

</page-query>

<script>
export default {
  data() {
    return {
      searchText: "",
      simplify: false,
    };
  },
  computed: {
    emails() {
      let emails = JSON.parse(
        JSON.stringify(this.$page.allEmail.edges.map(({ node }) => node))
      );

      if (this.simplify) {
        emails = emails.map((item) => {
          const addressLinks = [];

          const addresses = item.addresses.filter((address) => {
            if (!addressLinks.includes(address.link)) {
              addressLinks.push(address.link);
              return true;
            }
          });
          item.addresses = addresses;
          return item;
        });
      }
      if (this.searchText) {
        emails = emails.filter((item) => {
          return item.teacher.name.includes(this.searchText);
        });
      }

      return emails;
    },
  },
};
</script>

<style lang="scss" scoped>
.email {
  &-teacher {
    width: 40%;
  }
  &-wrapper {
    width: 60%;
    text-align: left;
  }
  &-simplify {
    &-label {
      color: slategrey;
    }
    &-wrapper {
      font-weight: bold;
      padding: 1rem;
      font-size: 1.6rem;
    }
  }
  &-item {
    display: flex;
    width: fit-content;
    align-items: center;
    flex-wrap: wrap;
  }
  &-address {
    text-decoration: underline;
    color: inherit;
    width: fit-content;
  }
  &-course {
    font-size: 0.8rem;
    color: #888;
  }
}
@media screen and (max-width: 640px) {
  .syllabus {
    &-list {
      &-item {
        flex-wrap: wrap;
      }
    }
  }
  .email {
    &-teacher {
      width: 100%;
    }
    &-wrapper {
      width: 100%;
    }
  }
}
</style>
