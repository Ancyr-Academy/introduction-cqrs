export type UserViewModel = {
  id: string;
  firstName: string;
  lastName: string;
  articles: Array<{
    id: string;
    title: string;
    content: string;
    clapsCount: number;
  }>;
};
