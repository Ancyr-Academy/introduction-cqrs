export type ArticleCreatedEvent = {
  articleId: string;
  userId: string;
  title: string;
  content: string;
};

export type ArticleUpdatedEvent = {
  articleId: string;
  userId: string; // irrelevant to the update, necessary for the update
  title: string;
  content: string;
};

export type ArticleDeletedEvent = {
  articleId: string;
  userId: string;
};
