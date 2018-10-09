const algoliasearch = require('algoliasearch')
const path = require(`path`);
const { SearchResults, SearchParameters } = require('algoliasearch-helper');

exports.createPages = (
  {
    graphql,
    boundActionCreators
  },
  {
    appId,
    apiKey,
    index,
    hitsPerPage,
    facets,
    pages,
    template
  }
) => {
  function createPageWithResults(type, response, state, templatePath) {
    createPage({
      path: `${type}-cars`,
      component: templatePath,
      context: {
        car_type: type,
        resultsState: {
          content: new SearchResults(state, response.results),
          _originalResponse: response,
          state,
        },
      },
    })
  }

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
    const templatePath = path.resolve(template);
    pages.map((type) => {
      let typeParams = Object.assign({}, search_params[0], {params: {
        hitsPerPage: hitsPerPage,
        filters: `car_type:${type}`,
        facets: facets
      }})
      resolve(
        client.search([typeParams]).then(response => {
          createPageWithResults(type, response, state, templatePath)
        })
      )
    })
  })
};
