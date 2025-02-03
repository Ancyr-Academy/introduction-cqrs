export type ClapCreatedEvent = {
  articleId: string;
  articleUserId: string;
  clapId: string;
  clapsCount: number;
};

export type ClapUpdatedEvent = {
  articleId: string;
  articleUserId: string;
  before: number;
  after: number;
  clapId: string;
};

export type ClapDeletedEvent = {
  articleId: string;
  articleUserId: string;
  clapsCount: number;
};
