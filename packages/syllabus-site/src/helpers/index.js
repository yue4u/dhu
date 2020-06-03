export function getListCount(list) {
  let map = {};
  for (let val of list) {
    map[val] = (map[val] || 0) + 1;
  }
  return map;
}

export function collectSubjectInfo(courses, fieldList) {
  let fieldMap = Object.fromEntries(fieldList.map((field) => [field, {}]));
  let fieldCount = Object.fromEntries(fieldList.map((field) => [field, {}]));

  let returnMap = {};
  courses.node.map((node) => {
    fieldList.map((field) => {
      const name = node[field].name || "不明";
      const count = (fieldCount[field][node[field].name] || 0) + 1;
      fieldCount[field][node[field].name] = count;
      fieldMap[field][name] = {
        name,
        count,
        id: node[field].id,
      };
    });
  });

  Object.entries(fieldMap).map(([field, fieldInfo]) => {
    returnMap[field] = [];
    Object.values(fieldInfo).map((val) => {
      returnMap[field].push({
        extra: val.count,
        name: val.name || "不明",
        url: `/${field}/${val.id}`,
      });
    });
  });

  return returnMap;
}
