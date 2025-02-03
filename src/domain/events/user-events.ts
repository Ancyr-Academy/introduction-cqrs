export type UserCreatedEvent = {
  userId: string;
};

export type UserUpdatedEvent = {
  userId: string;
  firstName: string;
  lastName: string;
};
