import React from "react";
import PropTypes from "prop-types";

/**
 * Firebase/Firestore
 */
import firebase from "firebase/app";
import "firebase/auth"; // make sure you add this for auth
// import 'firebase/firestore' // make sure you add this for firestore
// import 'firebase/storage' // make sure you add this for storage
// See: ./README.md

export function usePrevious(value) {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  return ref.current;
}

const appExists = (name) => {
  return !!firebase.apps.find(
    (app) => app.container && app.container.name === name
  );
};
const getApp = (name) => {
  return firebase.app(name);
};

const firebaseReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE":
    case "UPDATE_CONFIG":
      return {
        ...state,
        config: action.config || null,
        user: action.user || null,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.user || null,
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

function getInitialState() {
  return {
    user: null,
    config: null,
    firebase,
  };
}

const globalContexts = {};
const getGlobalContext = (name = "[Default]") => {
  if (!globalContexts[name]) {
    globalContexts[name] = {
      FirebaseStateContext: React.createContext(getInitialState()),
      FirebaseDispatchContext: React.createContext(),
    };
  }
  return globalContexts[name];
};
const useIsolatedContext = (name = "[Default]") => {
  const [context, setContext] = React.useState(getGlobalContext(name));
  React.useEffect(() => {
    setContext(getGlobalContext(name));
  }, [name]);
  return context;
};

function useProviderContext(appName = "[DEFAULT]") {
  const { FirebaseStateContext, FirebaseDispatchContext } = useIsolatedContext(
    appName
  );
  const state = React.useContext(FirebaseStateContext);
  const dispatch = React.useContext(FirebaseDispatchContext);
  if (state === undefined || dispatch === undefined) {
    throw new Error(
      `Context for '${appName}' is missing.\nWrap your app with <FirebaseProvider config={firebaseConfig} name="${appName}">`
    );
  }
  return [state, dispatch];
}

export function useFirebaseApp(appName = "[DEFAULT]") {
  const [firebaseState] = useProviderContext(appName);
  const [app, setApp] = React.useState(null);
  const [name, setName] = React.useState(appName);

  const changeApp = (name = "[DEFAULT]") => setName(name);

  React.useEffect(() => {
    if (appExists(name)) {
      setApp(getApp(name)); // Existing App
    }
    //  else {
    //   throw new Error(`Trying to set App to '${name}' and provider missing for that name`)
    // }
  }, [name, firebaseState]);

  return [app, changeApp];
}

export function useFirebaseAuth(appName = "[DEFAULT]") {
  const [firebaseState] = useProviderContext(appName);
  const [app] = useFirebaseApp(appName);
  const [appAuth, setAuth] = React.useState(null);
  const authConstructor = firebase.auth;

  React.useEffect(() => {
    if (app) {
      // console.log(app)
      setAuth(firebaseState.firebase.auth(app));
    } else {
      setAuth(null);
    }
  }, [app, firebaseState]);

  return { appAuth, authConstructor };
}

export function useFirebaseUser(appName = "[DEFAULT]") {
  const [firebaseState] = useProviderContext(appName);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    setUser(firebaseState.user);
  }, [firebaseState, appName]);

  return user;
}

function FirebaseProvider({ children, config = {}, name = "[DEFAULT]" }) {
  const { FirebaseStateContext, FirebaseDispatchContext } = useIsolatedContext(
    name
  );
  const [state, updateContext] = React.useReducer(
    firebaseReducer,
    getInitialState()
  );
  const [auth, setAuth] = React.useState(null);

  React.useEffect(() => {
    if (updateContext && config && config.apiKey) {
      if (!appExists(name)) {
        // Initialize new app if doesn't exist
        const app = firebase.initializeApp(config, name);
        // Set the auth, so we can setup a user state change
        console.log("Setting up auth for ", name);
        setAuth(firebase.auth(app));
        // Note: The useFirebaseUser and useFirebaseAuth allows for use of provider context
      }
      updateContext({
        type: "UPDATE_CONFIG",
        config,
        name,
      });
    }
  }, [config, name, updateContext, state.firebase]);

  React.useEffect(() => {
    // console.log(auth);
    if (!auth) return;
    // setup auth listener for the app
    // this only listens to login and logout
    // See: https://firebase.google.com/docs/reference/js/firebase.auth.Auth#onauthstatechanged
    const previousAppName = name;
    const unsubscribeAuthListener = auth.onAuthStateChanged(function (user) {
      console.log("Setting up listener for ", user, name);
      updateContext({
        type: "UPDATE_USER",
        user,
        previousAppName,
      });
    });

    return () => {
      unsubscribeAuthListener();
      return;
    };
  }, [auth, name]);

  return (
    <FirebaseStateContext.Provider value={state}>
      <FirebaseDispatchContext.Provider value={updateContext}>
        {children}
      </FirebaseDispatchContext.Provider>
    </FirebaseStateContext.Provider>
  );
}

FirebaseProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  config: PropTypes.object,
  name: PropTypes.string,
};

export { FirebaseProvider, firebase };
