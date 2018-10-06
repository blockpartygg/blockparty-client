import { Analytics, ScreenHit, Event } from 'expo-analytics';

class GoogleAnalytics {
    constructor() {}

    initialize() {
        let trackingId = process.env.NODE_ENV === 'production' ? 'UA-127047083-1' : 'UA-127094492-1';
        this._analytics = new Analytics(trackingId);
    }

    get analytics() {
        return this._analytics;
    }

    sendScreenView(screenName) {
        this._analytics.hit(new ScreenHit(screenName));
    }

    sendEvent(category, action, label, value) {
        this._analytics.event(new Event(category, action, label, value));
    }
}

analytics = new GoogleAnalytics();

export default analytics;