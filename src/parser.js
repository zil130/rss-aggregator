export default (xmlString) => {
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(xmlString, 'application/xml');

  try {
    const feed = {
      title: xmlDocument.querySelector('title').textContent.trim(),
      description: xmlDocument.querySelector('description').textContent.trim(),
    };
    const xmlDocumentItems = xmlDocument.querySelectorAll('item');
    const posts = Array.from(xmlDocumentItems).map((xmlDocumentItem) => {
      const link = xmlDocumentItem.querySelector('link').textContent.trim();
      const title = xmlDocumentItem.querySelector('title').textContent.trim();
      const description = xmlDocumentItem.querySelector('description').textContent.trim();

      return {
        link, title, description,
      };
    });

    return { feed, posts };
  } catch {
    throw new Error('feedback.failure.notContainValidRSS');
  }
};
