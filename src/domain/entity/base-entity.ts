type Event = {
  name: string;
  payload: Record<string, any>;
};
export abstract class BaseEntity {
  private events: Event[] = [];

  public addEvent<T>(name: string, payload: T) {
    if (!this.events) {
      this.events = [];
    }

    this.events.push({ name, payload });
  }

  public getAndClearEvents() {
    const events = this.events;
    this.events = [];

    return events;
  }
}
