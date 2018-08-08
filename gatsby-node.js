const algoliasearch = require('algoliasearch')
const path = require(`path`);
const { SearchResults, SearchParameters } = require('algoliasearch-helper');

exports.createPages = (
  { graphql, boundActionCreators },
  {appId, apiKey, index, hitsPerPage, facets, pages}
) => {
  const client = algoliasearch(
    appId,
    apiKey
  );

  const search_params = [
    {
      indexName: index,
      query: ''
    }
  ]

  const state = SearchParameters.make({
    hitsPerPage: hitsPerPage,
    facets: facets
  });

  const { createPage } = boundActionCreators
  return new Promise((resolve, reject) => {
    const carTemplate = path.resolve(`src/templates/carsIndex.js`);
    pages.map((type) => {
      let typeParams = Object.assign({}, search_params[0], {params: {hitsPerPage: 21, filters: `car_type:${type}`}})
      client.search([typeParams]).then(response => {
        createPage({
          path: `${type}-cars`,
          component: carTemplate,
          context: {
            car_type: type,
            resultsState: {
              content: new SearchResults(state, response.results),
              _originalResponse: response,
              state,
            },
          },
        })
      })
    })
    resolve()
  })
};
