Build / Deploy Instructions
1. Update version number in app.json
2. Merge development changes into master
3. Create new release on GitHub
4. expo build:ios
5. Download and archive build in release folder as "bpclient-yymmdd.ipa"
6. Upload to Xcode -> Application Loader
7. On App Store Connect: Wait for Processing to finish
8. Fix Missing Compliance issue -> Start Internal Testing

For External Release:
1. App Store Conenct -> Block Party Testers -> Add Build -> Select new build
