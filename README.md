# Toast Wallet core
This contains the core javascript and css of the wallet. Each specific platform has a repo that wraps the html5 app.
# Minimalist wallet.
We'll be building from the functionality of https://github.com/jatchili/minimalist-ripple-client
# Ripple Js Lib
https://github.com/ripple/bower-ripple/blob/master/ripple.js
# Git usage
Warning! Releases will be under release branches. The main branch is the development branch.
# Phone builds
We use Adobe Phonegap's cloud build service. The most recent phone builds can be found here. Warning these may be development builds.
https://build.phonegap.com/apps/2733163/share
# Manual compilation for browser build
Clone the repo.
Install phonegap https://phonegap.com/
Run:
	- phonegap platform add browser
	- phonegap build browser

# Manual building of electron packages
- Perform the steps above for the browser version.
More instructions shortly
