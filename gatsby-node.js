const algoliasearch = require('algoliasearch')
const path = require(`path`);
const { SearchResults, SearchParameters } = require('algoliasearch-helper');

exports.createPages = (
  {
    graphql,
    actions
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
  function createPageWithResults(page, response, state, templatePath) {
    createPage({
      path: page.path,
      component: templatePath,
      context: {
        ...page.context,
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

  const { createPage } = actions

  return new Promise((resolve, reject) => {
    const templatePath = path.resolve(template);
    pages.map((page) => {
      let searchParams = Object.assign({}, search_params[0], {params: {
        hitsPerPage: hitsPerPage,
        facets: facets,
        ...page.search_params
      }})
      resolve(
        client.search([searchParams]).then(response => {
          createPageWithResults(page, response, state, templatePath)
        })
      )
    })
  })
};
