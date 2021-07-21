const algoliasearch = require('algoliasearch')
const path = require(`path`);
const { SearchResults, SearchParameters } = require('algoliasearch-helper');

exports.createPages = async (
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
        search_params: page.search_params,
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

  const templatePath = path.resolve(template);

  await Promise.all(
    pages.map(page => {
      let searchParams = Object.assign({}, search_params[0], {params: {
        hitsPerPage: hitsPerPage,
        facets: facets,
        ...page.search_params
      }})
      return client.search([searchParams]).then(response => {
        return createPageWithResults(page, response, state, templatePath)
      })
    })
  )
};
