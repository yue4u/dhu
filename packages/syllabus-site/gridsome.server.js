// Server API makes it possible to hook into various parts of Gridsome
// on server-side and add custom data to the GraphQL data layer.
// Learn more: https://gridsome.org/docs/server-api

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`
const syllabus = require("./data/syllabus.json");
const search = require("./data/search.json");
const { createHash } = require("crypto");

const hash = (text) => {
  return createHash("md5").update(text).digest("hex").slice(0, 8);
};

const hashStore = {};

const uniqueHash = (text) => {
  let hashString = "";
  while (true) {
    hashString = hash(text);

    if (hashString in hashStore) {
      hashString = hash(hashString);
    } else {
      hashStore[text] = hashString;
      hashStore[hashString] = text;
      break;
    }
  }
  return hashString;
};

const upper = (text) => text.slice(0, 1).toUpperCase() + text.slice(1);

module.exports = function (api) {
  api.loadSource(({ addCollection, createReference, _addReference }) => {
    const courseType = addCollection({
      typeName: "Course",
    });
    // const detailType = addCollection({
    //   typeName: "Detail",
    // });

    const teacherType = addCollection({
      typeName: "Teacher",
    });

    const categoryType = addCollection({
      typeName: "Category",
    });

    const fieldType = addCollection({
      typeName: "Field",
    });

    const yearType = addCollection({
      typeName: "Year",
    });

    const teachers = {};
    const categories = {};
    const years = {};
    const fields = {};

    const gather = (_name, collection, key, course) => {
      if (key in collection) {
        collection[key].courses.push(course.code);
        return;
      }

      collection[key] = {
        courses: [course.code],
      };

      // if (name === "teacher") {
      //   collection[key]["position"] = course.detail.teacherPosition;
      // }
    };

    const create = (contentTypeName, contentType, collection) => {
      Object.entries(collection).map(([key, val]) => {
        const hash = uniqueHash(`${contentTypeName}:${key}`);
        collection[key].id = hash;

        contentType.addNode({
          id: hash,
          name: key || "不明",
          ...val,
          courses: {
            totalCount: val.courses.length,
            node: createReference("Course", val.courses),
          },
        });
      });
    };

    syllabus.map((course) => {
      gather("teacher", teachers, course.teacher, course);
      gather("category", categories, course.category, course);
      gather("year", years, course.year, course);
      gather("field", fields, course.field, course);
    });

    create("teacher", teacherType, teachers);
    create("category", categoryType, categories);
    create("year", yearType, years);
    create("field", fieldType, fields);

    syllabus.map((course) => {
      // const detail = { ...course.detail };
      // delete course.detail;
      //
      // const detailNode = detailType.addNode({
      //   ...detail,
      //   path: `course/${course.code}/detail`,
      // });

      const courseRef = Object.fromEntries(
        ["teacher", "category", "year", "field"].map((typeName) => {
          const hash = hashStore[`${typeName}:${course[typeName]}`];
          const typeNameUpper = upper(typeName);
          return [typeName, createReference(typeNameUpper, hash)];
        })
      );

      courseType.addNode({
        ...course,
        ...courseRef,
        id: course.code,
        // detail: createReference(detailNode),
        teacher: createReference("Teacher", teachers[course.teacher].id),
        categories: createReference("Category", categories[course.category].id),
        year: createReference("Year", years[course.year].id),
      });
    });

    const emailType = addCollection({
      typeName: "Email",
    });
    const emailMap = {};

    search.map((item) => {
      /**
       * @see https://stackoverflow.com/a/1373724
       */
      const emailMatched = [
        ...item.text.matchAll(
          /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
        ),
      ].map((match) => match[1]);

      const course = syllabus.find((course) => item.id === course.code);

      if (course && emailMatched.length) {
        for (let email of emailMatched) {
          if (!Array.isArray(emailMap[course.teacher])) {
            emailMap[course.teacher] = [];
          }
          if (!emailMap[course.teacher].includes(email)) {
            emailMap[course.teacher].push({
              link: email,
              course: createReference("Course", course.code),
            });
          }
        }
      }
    });

    Object.entries(emailMap).map(([teacher, item]) => {
      const teacherID = hashStore[`teacher:${teacher}`];

      emailType.addNode({
        id: hash(`email:${teacher}`),
        teacher: createReference("Teacher", teacherID),
        addresses: item,
      });
    });
  });

  //api.createPages(({ createPage }) => {
  //   Use the Pages API here: https://gridsome.org/docs/pages-api
  //});
};
