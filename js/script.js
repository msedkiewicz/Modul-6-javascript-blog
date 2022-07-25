{
  ('use strict');
  // Handlebars variables

  const templates = {
    articleLink: Handlebars.compile(document.querySelector('#template-article-link').innerHTML),
    articleTag: Handlebars.compile(document.querySelector('#template-article-tags').innerHTML),
    articleAuthor: Handlebars.compile(document.querySelector('#template-article-author').innerHTML),
    tagCloudLink: Handlebars.compile(document.querySelector('#template-tag-cloud-link').innerHTML),
    articleAuthorList: Handlebars.compile(document.querySelector('#template-article-author-list').innerHTML),
  };


  // Other variables
  const opts = {
    tagSizes: {
      count: 4,
      classPrefix: 'tag-size-',
    },
  };

  const select = {
    all: {
      articles: '.post',
      linksTo: {
        tags: 'a[href^="#tag-"]',
        authors: 'a[href^="#author-"]',
      },
    },
    article: {
      tags: '.post-tags .list',
      author: '.post-author',
      title: '.post-title',
    },
    listOf: {
      titles: '.titles',
      tags: '.tags.list',
      authors: '.authors.list',
    },
  };

  // Functions

  const titleClickHandler = function (event) {
    event.preventDefault();
    const clickedElement = this;
    //   console.log("Link was clicked!");
    //   console.log(event);

    /* remove class 'active' from all article links  */

    const activeLinks = document.querySelectorAll('.titles a.active');

    for (let activeLink of activeLinks) {
      activeLink.classList.remove('active');
    }

    /* add class 'active' to the clicked link */
    clickedElement.classList.add('active');

    //   console.log("clickedElement:", clickedElement);

    /* remove class 'active' from all articles */

    const activeArticles = document.querySelectorAll('article.active');

    for (let activeArticle of activeArticles) {
      activeArticle.classList.remove('active');
    }

    /* get 'href' attribute from the clicked link */
    const articleSelector = clickedElement.getAttribute('href');
    // console.log(articleSelector);

    /* find the correct article using the selector (value of 'href' attribute) */
    const targetArticle = document.querySelector(articleSelector);
    // console.log(targetArticle);

    /* add class 'active' to the correct article */
    targetArticle.classList.add('active');
  };

  const clearList = function (element) {
    element.innerHTML = '';
  };
  const generateTitleLinks = function (customSelector = '') {
    /* remove contents of titleList */
    const titleList = document.querySelector(select.listOf.titles);

    clearList(titleList);
    /* find all the articles and save them to variable: articles */

    const articles = document.querySelectorAll(select.all.articles + customSelector);
    // console.log(customSelector);

    let html = '';
    for (let article of articles) {
      /* get the article id */
      const articleId = article.getAttribute('id');
      /* find the title element and get the title from the title element */
      const articleTitle = article.querySelector(select.article.title).innerHTML;
      /* create HTML of the link */
      const linkHTMLData = {id: articleId, title: articleTitle};
      const linkHTML = templates.articleLink(linkHTMLData);
      // console.log(linkHTML);
      /* insert link into html variable */
      html = html + linkHTML;
    }
    // console.log(html)
    titleList.innerHTML = html;
    const links = document.querySelectorAll('.titles a');
    for (let link of links) {
      link.addEventListener('click', titleClickHandler);
    }
  };

  const calculateTagsParams = function(tags) {
    const params = {max:0, min: 999999};
    for(let tag in tags){
      // console.log(tag + ' is used ' + tags[tag] + ' times');
      params.max = tags[tag] > params.max ? tags[tag] : params.max;
      params.min = tags[tag] < params.min ? tags[tag] : params.min;
    }
    return params;
  };


  const calculateTagClass = function(count, params) {
    const normalizedCount = count - params.min;
    const normalizedMax = params.max - params.min;
    const percentage = normalizedCount / normalizedMax;
    const classNumber = Math.floor(percentage * (opts.tagSizes.count - 1) + 1);
    return opts.tagSizes.classPrefix + classNumber;
  };

  const generateTags = function (){
    /* [NEW] create a new variable allTags with an empty object */
    let allTags = {};

    /* find all articles */
    const articles = document.querySelectorAll(select.all.articles);
    // console.log(articles);

    /* START LOOP: for every article: */
    for (let article of articles) {
      /* find tags wrapper */
      const titleList = article.querySelector(select.article.tags);
      // console.log(titleList);
      /* make html variable with empty string */
      let html = '';
      /* get tags from data-tags attribute */
      const articleTags = article.getAttribute('data-tags');
      // console.log(articleTags);
      /* split tags into array */
      const articleTagsArray = articleTags.split(' ');
      // console.log(articleTagsArray);
      /* START LOOP: for each tag */
      for (let tag of articleTagsArray) {
        // console.log(tag);
        /* generate HTML of the link */
        const linkHTMLData = {tagHref: tag, tagName: tag};
        const linkHTML = templates.articleTag(linkHTMLData);
        /* add generated code to html variable */
        html = html + linkHTML;
        /* [NEW] check if this link is NOT already in allTags */
        if(!allTags[tag]) {
          /* [NEW] add generated code to allTags array */
          allTags[tag] = 1;
        } else {
          allTags[tag]++;
        }
        /* END LOOP: for each tag */
      }
      // console.log(html);
      /* insert HTML of all the links into the tags wrapper */
      titleList.innerHTML = html;
      /* END LOOP: for every article: */
      /* [NEW] find list of tags in right column */
      const tagList = document.querySelector(select.listOf.tags);

      /* [NEW] create variable for all links HTML code */
      const allTagsData = {tags: []};

      const tagsParams = calculateTagsParams(allTags);
      // console.log('tagsParams:', tagsParams);

      /* [NEW] START LOOP: for each tag in allTags: */
      for(let tag in allTags){
        /* [NEW] generate code of a link and add it to allTagsHTML */
        allTagsData.tags.push({
          tag: tag,
          count: allTags[tag],
          className: calculateTagClass(allTags[tag], tagsParams)
        });
        /* [NEW] END LOOP: for each tag in allTags: */
        // console.log(allTagsData);
      }
      /*[NEW] add HTML from allTagsHTML to tagList */
      tagList.innerHTML = templates.tagCloudLink(allTagsData);
    }

    function tagClickHandler(event){
      /* prevent default action for this event */
      event.preventDefault();
      /* make new constant named "clickedElement" and give it the value of "this" */
      const clickedElement = this;

      /* make a new constant "href" and read the attribute "href" of the clicked element */
      const href = clickedElement.getAttribute('href');
      /* make a new constant "tag" and extract tag from the "href" constant */
      const tag = href.replace('#tag-', '');

      /* find all tag links with class active */
      const activeTags = document.querySelectorAll('a.active[href^="#tag-"]');
      /* START LOOP: for each active tag link */
      for (let activeTag of activeTags) {
        /* remove class active */
        activeTag.classList.remove('active');
      /* END LOOP: for each active tag link */
      }
      /* find all tag links with "href" attribute equal to the "href" constant */
      const allTags = document.querySelectorAll(`a[href="${href}"]`);
      // console.log(allTags);
      /* START LOOP: for each found tag link */
      for (let singleTag of allTags) {
        /* add class active */
        singleTag.classList.add('active');
      /* END LOOP: for each found tag link */
      }
      /* execute function "generateTitleLinks" with article selector as argument */
      generateTitleLinks('[data-tags~="' + tag + '"]');
    }

    function addClickListenersToTags(){
      /* find all links to tags */
      const tagLinks = document.querySelectorAll(select.all.linksTo.tags);

      /* START LOOP: for each link */
      for (let tagLink of tagLinks) {
        /* add tagClickHandler as event listener for that link */
        tagLink.addEventListener('click', tagClickHandler);
      /* END LOOP: for each link */
      }
    }

    addClickListenersToTags();
  };

  const generateAuthors = function () {
    /* [NEW] create a new variable allAuthorsList with an empty object */
    let allAuthorsList = {};
    /* find all articles */
    const articles = document.querySelectorAll(select.all.articles);
    // console.log(articles);
    /* START LOOP: for every article: */
    for (let article of articles) {
      /* find author wrapper */
      const authorWrapper = article.querySelector(select.article.author);
      // console.log(authorWrapper);
      /* get authors from data-author attribute */
      const author = article.getAttribute('data-author');
      // console.log(authors);
      /* add author a clickable link */
      const linkHTMLData = {authorsTag: author, authorsName: author};
      const linkHTML = templates.articleAuthor(linkHTMLData);

      /* insert author to a paragraph */
      authorWrapper.innerHTML = linkHTML;
      /* [NEW] check if this link is NOT already in allAuthorsList */
      if(!allAuthorsList[author]) {
        /* [NEW] add generated code to allAuthorsList array */
        allAuthorsList[author] = 1;
      } else {
        allAuthorsList[author]++;
      }
      /* END LOOP: for every article*/

      /* [NEW] find list of authors in right column */
      const authorsList = document.querySelector(select.listOf.authors);

      /* [NEW] create variable for all links HTML code */
      const allAuthorsData = {authors: []};
      /* [NEW] START LOOP: for each author in in allAuthorsList: */
      for(let author in allAuthorsList){
        /* [NEW] generate code of a link and add it to allAuthorsListHTML */
        allAuthorsData.authors.push({
          author: author,
          count: allAuthorsList[author],
        });

      /* [NEW] END LOOP: for each author in in allAuthorsList: */
      }
      /*[NEW] add HTML from allAuthorsListHTML to tagList */
      authorsList.innerHTML = templates.articleAuthorList(allAuthorsData);
    }

    function authorClickHandler(event){
      /* prevent default action for this event */
      event.preventDefault();
      /* make new constant named "clickedElement" and give it the value of "this" */
      const clickedElement = this;

      /* make a new constant "href" and read the attribute "href" of the clicked element */
      const href = clickedElement.getAttribute('href');
      /* make a new constant author and extract author from the data-author */
      const author = href.replace('#author-', '');

      /* find all author links with class active */
      const activeAuthors = document.querySelectorAll('.active[href^="#author-"]');
      /* START LOOP: for each active author link */
      for (let activeAuthor of activeAuthors) {
        /* remove class active */
        activeAuthor.classList.remove('active');
      /* END LOOP: for each active tag link */
      }
      /* find all tag links with "href" attribute equal to the "href" constant */
      const allAuthors = document.querySelectorAll(`a[href="${href}"]`);
      /* START LOOP: for each found author link */
      for (let singleAuthor of allAuthors) {
        /* add class active */
        singleAuthor.classList.add('active');
      /* END LOOP: for each found author */
      }
      /* execute function "generateTitleLinks" with article selector as argument */
      generateTitleLinks('[data-author="' + author + '"]');
    }

    function addClickListenersToAuthors(){
      /* find all links to tags */
      const allAuthors = document.querySelectorAll(select.all.linksTo.authors);

      /* START LOOP: for each link */
      for (let singleAuthor of allAuthors) {
        /* add tagClickHandler as event listener for that link */
        singleAuthor.addEventListener('click', authorClickHandler);
      /* END LOOP: for each link */
      }
    }

    addClickListenersToAuthors();
  };

  generateTitleLinks();
  generateTags();
  generateAuthors();
}
