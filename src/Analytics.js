import { Analytics, ScreenHit } from 'expo-analytics';

class GoogleAnalytics {
    constructor() {}

    initialize() {
        this._analytics = new Analytics('UA-127094492-1');
    }

    get analytics() {
        return this._analytics;
    }

    sendScreenView(screenName) {
        this._analytics.hit(new ScreenHit(screenName));
    }
}

analytics = new GoogleAnalytics();

export default analytics;