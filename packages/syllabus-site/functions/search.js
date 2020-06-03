const data = require("./search.json");

exports.handler = function (event, context, callback) {
  const params = event.queryStringParameters;
  const { q: searchText } = params;

  let result = {
    more: false,
    data: [],
  };
  if (!searchText) {
    callback(undefined, {
      statusCode: 200,
      body: JSON.stringify(result),
    });
  }

  const searchTextLower = searchText.toLowerCase();
  let results = data.filter((item) => {
    item.index = item.text.toLowerCase().indexOf(searchTextLower);

    return item.index !== -1;
  });

  result.more = results.length > 15;

  result.data = results.splice(0, 15).map((item) => {
    const text = item.text.substring(
      item.index - 10,
      item.index + searchText.length + 15
    );
    return {
      text: `...${text}...`,
      title: item.title,
      url: `/${item.type}/${item.id}`,
    };
  });

  callback(undefined, {
    statusCode: 200,
    body: JSON.stringify(result),
  });
};
