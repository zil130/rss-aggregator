export default (url) => {
  const query = new URL('https://allorigins.hexlet.app/get');
  query.searchParams.set('disableCache', 'true');
  query.searchParams.set('url', url);

  return query;
};
