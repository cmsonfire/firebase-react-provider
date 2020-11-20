## firebase-react-provider

This library is a React component (provider) using React Hooks and requires some dependencies:

- react (>=16.13.0)
- firebase (>=7.23.0 recommended)

Although the library is named `FirebaseProvider`, you should be aware **this library is using: firebase/app, firebase/auth**. If you are going to use other parts of firebase (i.e. storage or firestore), you can `import { firebase }` from `firebase-react-provider` and then dynamically import the extensions. Do this prior to using the FirebaseProvider in your app and within the scope of the same module.

```js
// firebase here is the equivalent of the 'firebase/app' import
import { firebase, FirebaseProvider } from "firebase-react-provider";
import "firebase/firestore";
import "firebase/storage";
```

## Setting up your project with FirebaseProvider

```bash
npm install firebase firebase-react-provider
```

Or

```bash
yarn add firebase firebase-react-provider
```

Once the dependencies are installed, you can now setup the react app to use the provider and you are ready to import the hooks in your components to access the items you need.

```js
import { FirebaseProvider } from "firebase-react-provider";

const config = {
  apiKey: "AIza...................................",
  authDomain: "your-app-name.firebaseapp.com",
  databaseURL: "https://your-app-name.firebaseio.com",
  projectId: "your-app-name",
  storageBucket: "your-app-name.appspot.com",
};

ReactDOM.render(
  <FirebaseProvider
    config={config}
    name={/* optional, defaults to [DEFAULT] */}
  >
    <App />
  </FirebaseProvider>,
  document.getElementById("root")
);
```

**FirebaseProvider** also allows for multiple apps and would be used by wrapping the providers.

```js
import { FirebaseProvider } from "firebase-react-provider";

const config = {
  apiKey: "AIza...................................",
  authDomain: "default-app-name.firebaseapp.com",
  databaseURL: "https://default-app-name.firebaseio.com",
  projectId: "default-app-name",
  storageBucket: "default-app-name.appspot.com",
};

const adminConfig = {
  apiKey: "PXiFa.................................",
  authDomain: "admin-app-name.firebaseapp.com",
  databaseURL: "https://admin-app-name.firebaseio.com",
  projectId: "admin-app-name",
  storageBucket: "admin-app-name.appspot.com",
};

ReactDOM.render(
  <FirebaseProvider
    config={config}
    name={/* optional, defaults to [DEFAULT] */}
  >
    <FirebaseProvider config={adminConfig} name="admin">
      <App />
    </FirebaseProvider>
  </FirebaseProvider>,
  document.getElementById("root")
);
```

## Using FirestoreProvider

```js
import { FirebaseProvider } from "firebase-react-provider";
import { FirestoreProvider } from 'firebase-react-provider/firestore'

const config = {
  apiKey: "AIza...................................",
  authDomain: "your-app-name.firebaseapp.com",
  databaseURL: "https://your-app-name.firebaseio.com",
  projectId: "your-app-name",
  storageBucket: "your-app-name.appspot.com",
}

const AppWrapper = (name) => {
  return <FirestoreProvider name={name}><App /></FirestoreProvider>
}

ReactDOM.render(
ReactDOM.render(
  <FirebaseProvider config={config} name={/* optional, defaults to [DEFAULT] */}>
    <AppWrapper name={/* optional, defaults to [DEFAULT] */} />
  </FirebaseProvider>
  document.getElementById("root")
);
  document.getElementById("root")
);

```

## Using StorageProvider

```js
import { FirebaseProvider } from "firebase-react-provider";
import { FirestoreProvider } from "firebase-react-provider/firestore";
import { StorageProvider } from "firebase-react-provider/firestore";

const config = {
  apiKey: "AIza...................................",
  authDomain: "your-app-name.firebaseapp.com",
  databaseURL: "https://your-app-name.firebaseio.com",
  projectId: "your-app-name",
  storageBucket: "your-app-name.appspot.com",
};

const AppWrapper = (name) => {
  return (
    <FirestoreProvider name={name}>
      <StorageProvider name={name}>
        <App />
      </StorageProvider>
    </FirestoreProvider>
  );
};

ReactDOM.render(
  <FirebaseProvider
    config={config}
    name={/* optional, defaults to [DEFAULT] */}
  >
    <AppWrapper name={/* optional, defaults to [DEFAULT] */} />
  </FirebaseProvider>,
  document.getElementById("root")
);
```

### useFirebaseUser (user)

The hook value is the current user logged into the app. The user is `null` when the user isn't logged into the app and is the value of the logged in user when the state changes.

See: https://firebase.google.com/docs/reference/js/firebase.auth.Auth#currentuser

This hook has observability based on the `auth(app).onAuthStateChanged` listener.

See: https://firebase.google.com/docs/reference/js/firebase.auth.Auth#onauthstatechanged

The example below to see when a user login is resolved for a persisted login.

```js
function UserComponent = ({appName}) => {
  const user = useFirebaseUser(appName);

  React.useEffect(() => {
    console.log("User Changed", user);
  }, [user]);

  return <div>{`User: ${user && user.user.displayName}`}</div>
}
```

### useFirebaseAuth ({ appAuth, authConstructor })

The hook value is our auth for the app instantiated (firebase.auth(app)). We might want to setup the auth for a user to be persistent for this session only. See: https://firebase.google.com/docs/auth/web/auth-state-persistence

**Note:** In the example, we use the google auth provider to keep them logged in until they logout so we would use LOCAL persistence.

Below is an example:

```js
/*
  const name = "app-name" // name used in the provider or optional
  const { authApp, authConstructor } = useFirebaseAuth(name || undefined)
  authApp = firebase.auth(app)
  authConstructor = firebase.auth
*/
import React from "react";
import {
  useFirebaseAuth,
  useFirebaseUser,
  usePrevious,
} from "firebase-react-provider";

const LoggedInUser = ({ children, isLoggedIn = Boolean(false), onClick }) => {
  const LogoutButton = ({ onClick }) => {
    return <button onClick={onClick}>Logout</button>;
  };
  if (typeof onClick !== "function") {
    throw Error("LoggedInUser must pass onClick");
  }

  return isLoggedIn ? <LogoutButton onClick={onClick} /> : null;
};

const LoggedOutUser = ({ isLoggedIn = Boolean(false), onClick }) => {
  const LoginButton = ({ onClick }) => {
    return <button onClick={onClick}>Login</button>;
  };
  if (typeof onClick !== "function") {
    throw Error("LoggedOutUser must pass onClick");
  }

  return !isLoggedIn ? <LoginButton onClick={onClick} /> : null;
};

export function LoginComponent({ children, name }) {
  const { appAuth, authConstructor } = useFirebaseAuth(
    name /* name of your app if assigned in the provider */
  );
  const user = useFirebaseUser(
    name /* name of your app if assigned in the provider */
  );
  const [userName, setUserName] = React.useState(
    (user && (user.displayName || "No Name")) || null
  );
  const previousUserName = usePrevious(userName);
  const previousUser = usePrevious(user);
  const [inProcess, setInProcess] = React.useState(null);

  function handleLogout(event) {
    setInProcess(true);
    event.preventDefault();
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = "Logging Out...";
    return appAuth
      .signOut()
      .then(() => {
        setInProcess(false);
      })
      .catch(function (error) {
        // An error happened.
      });
  }

  function handleLogin(event) {
    setInProcess(true);
    event.preventDefault();
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = "Logging In...";
    appAuth
      .setPersistence(authConstructor.Auth.Persistence.LOCAL)
      .then(function () {
        // We will use the google Provider
        var provider = new authConstructor.GoogleAuthProvider();
        // New sign-in will be persisted for any session instance.
        // Each new login will force an account selection, unless already logged in
        provider.setCustomParameters({
          prompt: "select_account",
        });
        return appAuth
          .signInWithPopup(provider)
          .then(function (result) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const token = result.credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            const name = (user && user.displayName) || null;
            setUserName(name);
            // ...
            console.log("results", result, name);
          })
          .catch(function (error) {
            throw error;
          });
      })
      .catch(function (error) {
        // Handle Errors here.
        // See https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signinwithpopup
        if ((error.code = "auth/popup-closed-by-user")) {
          setInProcess(false);
        } else {
          var errorCode = error.code;
          var errorMessage = error.message;
          throw new Error(error.message);
        }
      });
  }

  React.useEffect(() => {
    const name = (user && user.displayName) || null;
    if (name !== previousUserName) setUserName(name);
  }, [user, previousUserName]);

  React.useEffect(() => {
    // stillWaiting is defined by auth being setup
    // once the user changes we cancel inProcess
    const stillWaiting = !(appAuth && authConstructor);
    if (stillWaiting) return;
    setInProcess(false);
  }, [user, appAuth, authConstructor]);

  return (
    <div style={{ height: "200px" }}>
      {inProcess || inProcess === null ? (
        <div>Waiting...</div>
      ) : (
        <div>
          <div>{children}</div>
          <LoggedInUser isLoggedIn={!!userName} onClick={handleLogout} />
          <LoggedOutUser isLoggedIn={!!userName} onClick={handleLogin} />
        </div>
      )}
    </div>
  );
}
```

### useFirebaseApp(/_ name of your app if assigned in the provider _/) ([app, changeApp]);

The value of app is firebase.app(name) from the provider. Use `changeApp(name)` to get the app instance from another provider being used.

Below is a component using the hook to get the app instance from the provider.

```js
function AppChange = ({appName}) => {
  const [app, setApp] = useFirebaseApp(appName);

  React.useEffect(() => {
    if (app) console.log("App changed", app);
  }, [app]);

  return <div>{`App: ${app && app.container && app.container.name}`}</div>
}
```
