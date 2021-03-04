class Observable {
  constructor(subscribe) {
    this._subscribe = subscribe;
  }

  subscribe(observer) {
    this._subscribe(observer);
  }

  /**
   * Cold Observable
   */
  static timeout(time) {
    return new Observable(function subscribe(observer) {
      let handle = setTimeout(() => {
        observer.next();
        observer.complete();
      }, time);

      return {
        unsubscribe() {
          clearTimeout(handle);
        },
      };
    });
  }

  /**
   *
   * Hot Observable
   */
  static fromEvent(dom, eventName) {
    return new Observable(function subscribe(observer) {
      const handler = (evt) => {
        observer.next(evt);
      };

      dom.addEventListener(eventName, handler);
      return {
        unsubscribe() {
          dom.removeEventListener(eventName, handler);
        },
      };
    });
  }

  map(projection) {
    let self = this;
    return new Observable(function subscribe(observer) {
      const subscription = self.subscribe({
        next(v) {
          observer.next(projection(v));
        },
        error(err) {
          observer.error(err);
        },
        complete() {
          observer.complete();
        },
      });

      return subscription;
    });
  }

  filter(predicate) {
    let self = this;
    return new Observable(function subscribe(observer) {
      const subscription = self.subscribe({
        next(v) {
          if (predicate(v)) {
            observer.next(v);
          }
        },
        error(err) {
          observer.error(err);
        },
        complete() {
          observer.complete();
        },
      });

      return subscription;
    });
  }
}

const button = document.getElementById("button");
const clicks = Observable.fromEvent(button, "click");

clicks
  .map((evt) => evt.offsetX)
  .filter((offsetX) => offsetX > 10)
  .subscribe({
    next(evt) {
      console.log("Next!", { evt });
    },
    complete() {
      console.log("Complete!");
    },
  });

export default Observable;
