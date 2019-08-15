// Credit to meteor faster render https://github.com/kadirahq/fast-render/blob/master/lib/client/auth.js
import { Meteor } from 'meteor/meteor';
import { Cookie } from 'meteor/chuangbo:cookie';

// Getting tokens for the first time
// Meteor calls Meteor._localStorage.setItem() on the boot
// But we can do it ourselves also with this
const setToken = (loginToken, expires) => {
  Cookie.set('meteor_login_token', loginToken, {
    path: '/',
    expires
  });
};

const resetToken = () => {
  const loginToken = Meteor._localStorage.getItem('Meteor.loginToken');
  const loginTokenExpires = new Date(
    Meteor._localStorage.getItem('Meteor.loginTokenExpires')
  );

  if (loginToken) {
    setToken(loginToken, loginTokenExpires);
  } else {
    setToken(null, -1);
  }
};

// override Meteor._localStorage methods and resetToken accordingly
const originalSetItem = Meteor._localStorage.setItem;
Meteor._localStorage.setItem = (key, value) => {
  if (key === 'Meteor.loginToken') {
    Meteor.defer(resetToken);
  }
  originalSetItem.call(Meteor._localStorage, key, value);
};

const originalRemoveItem = Meteor._localStorage.removeItem;
Meteor._localStorage.removeItem = key => {
  if (key === 'Meteor.loginToken') {
    Meteor.defer(resetToken);
  }
  originalRemoveItem.call(Meteor._localStorage, key);
};

Meteor.startup(() => {
  resetToken();
});
