/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const ID = 'disableaddons@clear-code.com';

const BLOCKED_URIS = [
  "about:addons"
];

const Cc = Components.classes;
const Ci = Components.interfaces;
Components.utils.import('resource://gre/modules/XPCOMUtils.jsm');

const kCID  = Components.ID('{0d55570e-1de3-4b38-b4f9-01e2ef7afbd1}');
const kID   = '@clear-code.com/disableaddons/addonmanagerblocker;1';
const kNAME = "DisableAddonsAddonManagerBlocker";

const ObserverService = Cc['@mozilla.org/observer-service;1']
  .getService(Ci.nsIObserverService);

// const Application = Cc['@mozilla.org/steel/application;1']
//     .getService(Ci.steelIApplication);

// let { console } = Application;

// function dir(obj) console.log(Object.getOwnPropertyNames(obj).join("\n"));

function DisableAddonsAddonManagerBlocker() {}

DisableAddonsAddonManagerBlocker.prototype = {
  QueryInterface: function (aIID) {
    if (!aIID.equals(Ci.nsIContentPolicy) &&
        !aIID.equals(Ci.nsISupportsWeakReference) &&
        !aIID.equals(Ci.nsISupports))
      throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
  },

  TYPE_OTHER       : Ci.nsIContentPolicy.TYPE_OTHER,
  TYPE_SCRIPT      : Ci.nsIContentPolicy.TYPE_SCRIPT,
  TYPE_IMAGE       : Ci.nsIContentPolicy.TYPE_IMAGE,
  TYPE_STYLESHEET  : Ci.nsIContentPolicy.TYPE_STYLESHEET,
  TYPE_OBJECT      : Ci.nsIContentPolicy.TYPE_OBJECT,
  TYPE_DOCUMENT    : Ci.nsIContentPolicy.TYPE_DOCUMENT,
  TYPE_SUBDOCUMENT : Ci.nsIContentPolicy.TYPE_SUBDOCUMENT,
  TYPE_REFRESH     : Ci.nsIContentPolicy.TYPE_REFRESH,
  ACCEPT           : Ci.nsIContentPolicy.ACCEPT,
  REJECT_REQUEST   : Ci.nsIContentPolicy.REJECT_REQUEST,
  REJECT_TYPE      : Ci.nsIContentPolicy.REJECT_TYPE,
  REJECT_SERVER    : Ci.nsIContentPolicy.REJECT_SERVER,
  REJECT_OTHER     : Ci.nsIContentPolicy.REJECT_OTHER,

  shouldLoad: function (aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess, aExtra) {
    if (BLOCKED_URIS.some(function(aURI) {
          return aContentLocation.spec.indexOf(aURI) == 0;
        })) {
      this.processBlockedContext(aContext);
      Components.utils.reportError(new Error(ID + ': ' + aContentLocation.spec + ' is blocked!'));
      return this.REJECT_REQUEST;
    }

    return this.ACCEPT;
  },

  shouldProcess: function (aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess, aExtra) {
    return this.ACCEPT;
  },

  processBlockedContext: function (aContext) {
    try {
      if (aContext instanceof Ci.nsIDOMElement && aContext.localName == 'browser') {
        aContext.stop();
        let doc = aContext.ownerDocument;
        let chrome = doc.defaultView;
        if (chrome &&
            chrome.gBrowser &&
            chrome.gBrowser.selectedBrowser == aContext &&
            chrome.gBrowser.visibleTabs.length == 1)
          return;
      }
      let win = aContext.contentWindow;
      win.close();
    } catch (error) {}

    // XXX: does not work
    // win.setTimeout(function () {
    //   win.close();
    // }, 0);
  },

  classID           : kCID,
  contractID        : kID,
  classDescription  : kNAME,
  QueryInterface    : XPCOMUtils.generateQI([Ci.nsIContentPolicy]),
  _xpcom_categories : [
    { category : 'content-policy', service : true }
  ]
};

if (XPCOMUtils.generateNSGetFactory)
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([DisableAddonsAddonManagerBlocker]);
else
  var NSGetModule = XPCOMUtils.generateNSGetModule([DisableAddonsAddonManagerBlocker]);
